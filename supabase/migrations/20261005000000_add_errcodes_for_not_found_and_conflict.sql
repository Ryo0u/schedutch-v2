-- 対象の未存在と、他の人の更新との競合に専用の SQLSTATE を付与する。
--
-- これまでこれらは errcode 指定なしの RAISE EXCEPTION（P0001）で、クライアントは
-- UI 側で防いでいる不正値（＝バグ）と区別できず、どれも「〜に失敗しました」に
-- 潰れていた。PWD01 と同じ方式で SQLSTATE を付け、ユーザーが取るべき行動で
-- 分類できるようにする（クライアントは lib/rpcErrors.ts の classifyError）。
--
--   NTF01: 操作対象（イベント・参加者・予定）が存在しない。自動削除や他の人の削除の後に操作した場合
--   CNF01: 他の人の更新と競合した。先に予定が入った・回答が変わった場合
--
-- 「不正な候補日/回答時刻/参加者」など UI 側で防いでいる値の検証は P0001 のまま据え置く。
-- 関数本体は各 RPC の最新定義から errcode の付与とイベントの存在チェック追加のみを変更している。

-- update_event: 未存在に NTF01 --------------------------------------------------
create or replace function "public"."update_event"(
  "p_event_id" uuid, "p_password" text, "p_title" text, "p_comment" text
) returns void
    language plpgsql security definer
    set search_path to 'public', 'extensions'
    as $$
declare
  v_digest text;
begin
  select password_digest into v_digest from public.events where id = p_event_id;
  if v_digest is null then
    raise exception 'イベントが見つかりませんでした' using errcode = 'NTF01';
  end if;
  if v_digest <> extensions.crypt(p_password, v_digest) then
    raise exception 'パスワードが違います' using errcode = 'PWD01';
  end if;

  update public.events
     set title = p_title, comment = p_comment
   where id = p_event_id;
end;
$$;

-- delete_event: 未存在に NTF01 --------------------------------------------------
create or replace function "public"."delete_event"(
  "p_event_id" uuid, "p_password" text
) returns void
    language plpgsql security definer
    set search_path to 'public', 'extensions'
    as $$
declare
  v_digest text;
begin
  select password_digest into v_digest from public.events where id = p_event_id;
  if v_digest is null then
    raise exception 'イベントが見つかりませんでした' using errcode = 'NTF01';
  end if;
  if v_digest <> extensions.crypt(p_password, v_digest) then
    raise exception 'パスワードが違います' using errcode = 'PWD01';
  end if;

  delete from public.responses  where user_id in (select id from public.users where event_id = p_event_id);
  delete from public.users      where event_id = p_event_id;
  delete from public.candidates where event_id = p_event_id;
  delete from public.events     where id = p_event_id;
end;
$$;

-- save_user_responses: イベントの存在チェックを追加し、例外の SQLSTATE を保つ -----------
-- 存在チェックが無いと、削除済みイベントへの回答は候補日の検証で「不正な候補日」（P0001）になり、
-- バグと区別できない。また末尾の when others で投げ直すと SQLSTATE が P0001 に
-- 上書きされるため、using errcode = sqlstate で元のコードを引き継ぐ。
create or replace function "public"."save_user_responses"(
  "p_event_id" uuid, "p_name" text, "p_comment" text, "p_password" text, "p_response_data" jsonb
) returns json
    language plpgsql security definer
    set search_path to 'public', 'extensions'
    as $$
declare
  new_user_id uuid;
begin
  if not exists (select 1 from public.events where id = p_event_id) then
    raise exception 'イベントが見つかりませんでした' using errcode = 'NTF01';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_response_data) as obj
    where not exists (
      select 1 from public.candidates c
      where c.id = (obj->>'candidate_id')::uuid
        and c.event_id = p_event_id
    )
  ) then
    raise exception '不正な候補日が指定されました';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_response_data) as obj
    join public.candidates c on c.id = (obj->>'candidate_id')::uuid
    where (obj->>'time')::timestamptz < c.start_time
       or (obj->>'time')::timestamptz >= c.end_time
       or extract(minute from (obj->>'time')::timestamptz at time zone 'UTC')::int not in (0, 30)
       or extract(second from (obj->>'time')::timestamptz at time zone 'UTC') <> 0
  ) then
    raise exception '不正な回答時刻が指定されました';
  end if;

  insert into users (event_id, name, comment, password_digest)
  values (p_event_id, p_name, p_comment, extensions.crypt(p_password, extensions.gen_salt('bf', 10)))
  returning id into new_user_id;

  insert into responses (user_id, candidate_id, time, status)
  select
    new_user_id,
    (obj->>'candidate_id')::uuid,
    (obj->>'time')::timestamptz,
    (obj->>'status')::text
  from jsonb_array_elements(p_response_data) as obj;

  return json_build_object('user_id', new_user_id);
exception when others then
  raise exception '保存に失敗しました: %', sqlerrm using errcode = sqlstate;
end;
$$;

-- update_user_with_responses: 未存在に NTF01 ------------------------------------
create or replace function "public"."update_user_with_responses"(
  "p_user_id" uuid, "p_password" text, "p_name" text, "p_comment" text, "p_response_data" jsonb
) returns void
    language plpgsql security definer
    set search_path to 'public', 'extensions'
    as $$
declare
  v_digest text;
  v_event_id uuid;
begin
  select password_digest, event_id into v_digest, v_event_id
    from public.users where id = p_user_id;
  if v_digest is null then
    raise exception 'ユーザーが見つかりませんでした' using errcode = 'NTF01';
  end if;
  if v_digest <> extensions.crypt(p_password, v_digest) then
    raise exception 'パスワードが違います' using errcode = 'PWD01';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_response_data) as elem
    where not exists (
      select 1 from public.candidates c
      where c.id = (elem->>'candidate_id')::uuid
        and c.event_id = v_event_id
    )
  ) then
    raise exception '不正な候補日が指定されました';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_response_data) as elem
    join public.candidates c on c.id = (elem->>'candidate_id')::uuid
    where (elem->>'time')::timestamptz < c.start_time
       or (elem->>'time')::timestamptz >= c.end_time
       or extract(minute from (elem->>'time')::timestamptz at time zone 'UTC')::int not in (0, 30)
       or extract(second from (elem->>'time')::timestamptz at time zone 'UTC') <> 0
  ) then
    raise exception '不正な回答時刻が指定されました';
  end if;

  update public.users
     set name = p_name, comment = p_comment, updated_at = now()
   where id = p_user_id;

  delete from public.responses where user_id = p_user_id;

  insert into public.responses (user_id, candidate_id, time, status)
  select p_user_id,
         (elem ->> 'candidate_id')::uuid,
         (elem ->> 'time')::timestamptz,
         elem ->> 'status'
    from jsonb_array_elements(p_response_data) as elem;
end;
$$;

-- delete_user: 未存在に NTF01 ---------------------------------------------------
create or replace function "public"."delete_user"(
  "p_user_id" uuid, "p_password" text
) returns void
    language plpgsql security definer
    set search_path to 'public', 'extensions'
    as $$
declare
  v_user_digest  text;
  v_event_digest text;
begin
  select u.password_digest, e.password_digest
    into v_user_digest, v_event_digest
    from public.users u
    join public.events e on e.id = u.event_id
   where u.id = p_user_id;

  if v_user_digest is null then
    raise exception 'ユーザーが見つかりませんでした' using errcode = 'NTF01';
  end if;

  if v_user_digest = extensions.crypt(p_password, v_user_digest)
     or v_event_digest = extensions.crypt(p_password, v_event_digest) then
    delete from public.responses where user_id = p_user_id;
    delete from public.users     where id = p_user_id;
  else
    raise exception 'パスワードが違います' using errcode = 'PWD01';
  end if;
end;
$$;

-- create_plan: イベントの存在チェックを追加し、競合に CNF01 -------------------------
-- 存在チェックが無いと、削除済みイベントへの予定作成は「候補日の時間帯から外れた」（P0001）になり、
-- バグと区別できない。時間帯の重なりと参加不可メンバーは、画面を開いている間に
-- 他の人が予定を入れた・回答を変えた場合に起きるため競合として扱う。
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
  if not exists (select 1 from public.events where id = p_event_id) then
    raise exception 'イベントが見つかりませんでした' using errcode = 'NTF01';
  end if;

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
    raise exception '既に登録されている予定と時間が重なっています' using errcode = 'CNF01';
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
    raise exception '予定の時間帯に参加できないメンバーが含まれています' using errcode = 'CNF01';
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

-- update_plan_memo: 未存在に NTF01 ----------------------------------------------
create or replace function "public"."update_plan_memo"(
  "p_plan_id" uuid, "p_memo" text
) returns void
    language plpgsql security definer
    set search_path to 'public', 'extensions'
    as $$
begin
  update public.plans set memo = p_memo where id = p_plan_id;

  if not found then
    raise exception '予定が見つかりませんでした' using errcode = 'NTF01';
  end if;
end;
$$;
