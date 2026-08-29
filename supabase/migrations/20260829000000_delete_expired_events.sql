-- 放置されたイベントを定期削除する RPC を追加する。
--
-- 背景: 本番 Supabase は無料プランで、1週間アクセスが無いとプロジェクトが
-- 自動停止される。外部（Vercel Cron）から1日1回この RPC を叩くことで
-- 停止対策（keep-alive）を兼ねつつ、古いデータを回収する。
--
-- 削除条件（どちらか該当したら削除）:
--   - 回答者ゼロ           : events.created_at から 60 日経過
--   - 回答者あり           : 最後のアクティビティ（max(users.updated_at)）から 30 日経過
-- 「アクティビティ」は新規参加と既存参加者の回答編集の両方を指す。そのため
-- users に updated_at を追加し、update_user_with_responses で更新する。

-- users.updated_at 追加 -----------------------------------------------------
-- テーブルレベルの grant select on users は後から追加した列にも及ぶため、
-- anon の SELECT 権限は追加設定不要（password_digest の列単位 revoke も無関係）。
alter table "public"."users"
  add column "updated_at" timestamp with time zone not null default now();

-- update_user_with_responses に updated_at の更新を追加（他は据え置き）------
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
    raise exception 'ユーザーが見つかりませんでした';
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

-- delete_expired_events -----------------------------------------------------
-- 他の RPC と違いパスワード照合はしない。anon/authenticated からは呼べないよう
-- EXECUTE を service_role のみに絞る（Vercel Cron が service キーで叩く）。
-- candidates / users / responses / plans は FK の ON DELETE CASCADE で連鎖削除される。
create or replace function "public"."delete_expired_events"()
returns integer
    language plpgsql security definer
    set search_path to 'public', 'extensions'
    as $$
declare
  v_deleted integer;
begin
  with expired as (
    delete from public.events e
    where case
      when exists (select 1 from public.users u where u.event_id = e.id) then
        (select max(u.updated_at) from public.users u where u.event_id = e.id)
          < now() - interval '30 days'
      else
        e.created_at < now() - interval '60 days'
    end
    returning 1
  )
  select count(*) into v_deleted from expired;
  return v_deleted;
end;
$$;

-- Supabase は public スキーマの関数に anon/authenticated への EXECUTE を
-- 既定で付与する（ALTER DEFAULT PRIVILEGES）。public だけの revoke では
-- その明示付与が残るため、anon/authenticated からも明示的に revoke する。
revoke execute on function "public"."delete_expired_events"() from public, anon, authenticated;
grant execute on function "public"."delete_expired_events"() to service_role;
