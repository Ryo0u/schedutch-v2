-- 開催予定（plans）を蓄積する機能を追加する。
--
-- 抽出結果はこれまでテキストとして画面に出るだけで、幹事が外部（LINE等）へ
-- コピペして退避するしかなかった。「この日はこのメンバーで確定」という決定を
-- DB に残し、URL を知る参加者全員が同じものを見られるようにする。
--
-- 他の write RPC と違い、この 3 本（create_plan / update_plan_memo / delete_plan）だけは
-- パスワード照合を行わない。URL を知る人なら誰でも予定を追加・編集・削除できる
-- という仕様上の決定によるもので、write を RPC 経由に限定する（テーブルへの
-- 直叩き write は許可しない）という権限モデル自体は変えていない。

-- テーブル --------------------------------------------------------------------
create table "public"."plans" (
    "id" uuid default extensions.uuid_generate_v4() primary key,
    "event_id" uuid not null references "public"."events"("id") on delete cascade,
    "start_time" timestamp with time zone not null,
    "end_time" timestamp with time zone not null,
    "memo" text,
    "created_at" timestamp with time zone default now()
);

-- メンバーは users への参照のみを持つ。「未定（▲）だった人」は plan 側に保持せず、
-- 表示時に responses から判定する（回答が変われば表示も追従する）。
create table "public"."plan_participants" (
    "plan_id" uuid not null references "public"."plans"("id") on delete cascade,
    "user_id" uuid not null references "public"."users"("id") on delete cascade,
    primary key ("plan_id", "user_id")
);

create index "idx_plans_event_id" on "public"."plans" using btree ("event_id");
create index "idx_plan_participants_user_id" on "public"."plan_participants" using btree ("user_id");

-- RLS ---------------------------------------------------------------------
alter table "public"."plans" enable row level security;
alter table "public"."plan_participants" enable row level security;

create policy "anon can read plans" on "public"."plans" for select to anon using (true);
create policy "anon can read plan_participants" on "public"."plan_participants" for select to anon using (true);

-- 権限 ---------------------------------------------------------------------
-- Supabase の default privileges により create table した時点で anon へ ALL が
-- 自動付与される（20260705041653_fix_column_grants.sql のコメント参照）ため、
-- 一度 revoke してから select だけを grant し直す。
revoke all on "public"."plans", "public"."plan_participants" from anon, authenticated;

grant select on "public"."plans", "public"."plan_participants" to anon, authenticated, service_role;

-- RPC（write は全てここ経由） --------------------------------------------------

-- 回答の刻み幅（30 分）。responses は候補日の範囲をこの幅で刻んで作られるため、
-- 「予定の時間帯の全コマに回答があるか」を数えるのに使う。
-- クライアント側の SLOT_INTERVAL_MS（lib/constants.ts）と対応する。
create or replace function "public"."plan_slot_interval"() returns interval
    language sql immutable
    as $$ select interval '30 minutes' $$;

-- メンバーが全て当該イベントの参加者かを検証する。
-- candidate 所属チェック（20260705045123_validate_candidate_ownership.sql）と
-- 同じ狙いで、他イベントの user_id を紛れ込ませた書き込みを防ぐ。
create or replace function "public"."validate_plan_participants"(
  "p_event_id" uuid, "p_user_ids" uuid[]
) returns void
    language plpgsql
    set search_path to 'public', 'extensions'
    as $$
begin
  if exists (
    select 1
    from unnest(p_user_ids) as uid
    where not exists (
      select 1 from public.users u
      where u.id = uid and u.event_id = p_event_id
    )
  ) then
    raise exception '不正な参加者が指定されました';
  end if;
end;
$$;

create or replace function "public"."create_plan"(
  "p_event_id" uuid, "p_start_time" timestamptz, "p_end_time" timestamptz,
  "p_memo" text, "p_user_ids" uuid[]
) returns uuid
    language plpgsql security definer
    set search_path to 'public', 'extensions'
    as $$
declare
  new_plan_id uuid;
begin
  if p_start_time >= p_end_time then
    raise exception '開始時刻は終了時刻より前である必要があります';
  end if;

  -- 候補日の時間帯に収まっていること。回答が存在しない時間に予定を作らせない。
  if not exists (
    select 1 from public.candidates c
    where c.event_id = p_event_id
      and c.start_time <= p_start_time
      and c.end_time >= p_end_time
  ) then
    raise exception '候補日の時間帯から外れた予定は作成できません';
  end if;

  -- 既存の予定と時間帯が重ならないこと。同じ時間に複数の予定が並ぶ状態を作らせない。
  if exists (
    select 1 from public.plans p
    where p.event_id = p_event_id
      and p.start_time < p_end_time
      and p_start_time < p.end_time
  ) then
    raise exception '既に登録されている予定と時間が重なっています';
  end if;

  perform public.validate_plan_participants(p_event_id, p_user_ids);

  -- メンバーが全員その時間帯に参加可能（全コマが ok / maybe）であること。
  -- 予定の内容と回答の状態が食い違わないようにする。
  if exists (
    select 1
    from unnest(coalesce(p_user_ids, '{}'::uuid[])) as uid
    where (
      select count(*)
      from public.responses r
      where r.user_id = uid
        and r.time >= p_start_time
        and r.time < p_end_time
        and r.status in ('ok', 'maybe')
    ) <> (
      extract(epoch from (p_end_time - p_start_time))
        / extract(epoch from public.plan_slot_interval())
    )::int
  ) then
    raise exception '予定の時間帯に参加できないメンバーが含まれています';
  end if;

  insert into public.plans (event_id, start_time, end_time, memo)
  values (p_event_id, p_start_time, p_end_time, p_memo)
  returning id into new_plan_id;

  insert into public.plan_participants (plan_id, user_id)
  select new_plan_id, uid
  from unnest(coalesce(p_user_ids, '{}'::uuid[])) as uid;

  return new_plan_id;
end;
$$;

-- 日時とメンバーは抽出結果（＝回答）から決まるので更新しない。
-- 任意の日時・メンバーに書き換えられると、回答の状態と予定の内容がずれるため、
-- 後から変えられるのはメモだけにしている。
create or replace function "public"."update_plan_memo"(
  "p_plan_id" uuid, "p_memo" text
) returns void
    language plpgsql security definer
    set search_path to 'public', 'extensions'
    as $$
begin
  update public.plans set memo = p_memo where id = p_plan_id;

  if not found then
    raise exception '予定が見つかりませんでした';
  end if;
end;
$$;

create or replace function "public"."delete_plan"("p_plan_id" uuid)
returns void
    language plpgsql security definer
    set search_path to 'public', 'extensions'
    as $$
begin
  -- plan_participants は on delete cascade で消える
  delete from public.plans where id = p_plan_id;
end;
$$;

-- RPC 実行権限 -----------------------------------------------------------------
-- validate_plan_participants は上の3本から呼ばれる内部用。Postgres は関数の EXECUTE を
-- 既定で PUBLIC に付与するため、明示的に取り消して外部から直接呼べないようにする。
revoke execute on function "public"."validate_plan_participants"(uuid, uuid[]) from public;
revoke execute on function "public"."plan_slot_interval"() from public;
grant execute on function "public"."create_plan"(uuid, timestamptz, timestamptz, text, uuid[]) to anon, authenticated, service_role;
grant execute on function "public"."update_plan_memo"(uuid, text) to anon, authenticated, service_role;
grant execute on function "public"."delete_plan"(uuid) to anon, authenticated, service_role;
