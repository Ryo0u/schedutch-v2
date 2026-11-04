-- RPC のサーバー側検証を補強する（#125）。
--
-- 1. create_event_with_candidates の末尾の when others で投げ直すと SQLSTATE が P0001 に
--    上書きされるため、using errcode = sqlstate で元のコードを引き継ぐ
--    （save_user_responses は 20261005000000 で対応済み）。あわせて候補日 0 件を拒否する。
-- 2. 文字数の上限はクライアントの zod でしか担保しておらず、anon が RPC を直接叩けば
--    任意長の文字列を保存できた。書き込む RPC が複数あるため、各 RPC ではなくテーブルの
--    CHECK 制約で強制する。値は lib/validation.ts / features/event-detail/schema.ts と揃える。
--    既存の行が違反していてもマイグレーションを失敗させないよう NOT VALID で追加し、
--    新しく書き込まれる行（insert / update）だけを検証する。

-- create_event_with_candidates ------------------------------------------------
-- 関数本体は 20260828001310 の定義から、候補日件数の検証と errcode の引き継ぎのみを変更している。
create or replace function "public"."create_event_with_candidates"(
  "p_title" text, "p_password" text, "p_comment" text, "p_candidates" jsonb
) returns uuid
    language plpgsql security definer
    set search_path to 'public', 'extensions'
    as $$
declare
  new_event_id uuid;
begin
  if coalesce(jsonb_array_length(p_candidates), 0) = 0 then
    raise exception '候補日を1件以上指定してください';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_candidates) as elem
    where (elem->>'start_time')::timestamptz >= (elem->>'end_time')::timestamptz
  ) then
    raise exception '候補日の開始時刻は終了時刻より前である必要があります';
  end if;

  insert into events (title, password_digest, comment)
  values (p_title, extensions.crypt(p_password, extensions.gen_salt('bf', 10)), p_comment)
  returning id into new_event_id;

  insert into candidates (event_id, start_time, end_time, index_number)
  select
    new_event_id,
    (elem->>'start_time')::timestamptz,
    (elem->>'end_time')::timestamptz,
    (elem->>'index_number')::int
  from jsonb_array_elements(p_candidates) as elem;

  return new_event_id;
exception when others then
  raise exception 'Failed to create event: %', sqlerrm using errcode = sqlstate;
end;
$$;

-- 文字数の上限 ----------------------------------------------------------------
-- char_length は文字数（バイト数ではない）を数えるため、zod の .max() と同じ単位になる。
alter table "public"."events"
  add constraint "events_title_length" check (char_length(title) between 1 and 10) not valid,
  add constraint "events_comment_length" check (char_length(comment) <= 200) not valid;

alter table "public"."users"
  add constraint "users_name_length" check (char_length(name) between 1 and 10) not valid,
  add constraint "users_comment_length" check (char_length(comment) <= 100) not valid;
