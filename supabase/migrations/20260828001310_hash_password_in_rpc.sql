-- パスワードのハッシュ化をサーバー側（pgcrypto の crypt）に一本化する。
--
-- これまで作成時はクライアント（bcryptjs）でハッシュ化した digest を RPC に
-- 渡し、照合時のみサーバーの crypt() を使っていた。この非対称のために
-- bcryptjs 依存と、pgcrypto が解釈できない $2b$ プレフィックスを $2a$ へ
-- 貼り替えるハックを抱えていた。
--
-- cost は bcryptjs 側の genSalt(10) に合わせて明示する
-- （gen_salt('bf') の既定 cost は 6 で、従来より弱くなるため）。
-- crypt(平文, 既存digest) は保存済みの digest をそのまま照合できるので、
-- 既存データの移行は不要。

-- 引数名 p_password_digest → p_password の変更は create or replace では
-- できない（cannot change name of input parameter）ため、一度削除する。
-- grant も失われるので作り直したあとに付け直す。
drop function if exists "public"."create_event_with_candidates"(text, text, text, jsonb);

create function "public"."create_event_with_candidates"(
  "p_title" text, "p_password" text, "p_comment" text, "p_candidates" jsonb
) returns uuid
    language plpgsql security definer
    set search_path to 'public', 'extensions'
    as $$
declare
  new_event_id uuid;
begin
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
  raise exception 'Failed to create event: %', sqlerrm;
end;
$$;

grant execute on function "public"."create_event_with_candidates"(text, text, text, jsonb) to anon, authenticated, service_role;

-- save_user_responses は引数名が既に p_password なので、
-- 受け取った値を digest としてそのまま保存していたのを crypt() に通す。
create or replace function "public"."save_user_responses"(
  "p_event_id" uuid, "p_name" text, "p_comment" text, "p_password" text, "p_response_data" jsonb
) returns json
    language plpgsql security definer
    set search_path to 'public', 'extensions'
    as $$
declare
  new_user_id uuid;
begin
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
  raise exception '保存に失敗しました: %', sqlerrm;
end;
$$;
