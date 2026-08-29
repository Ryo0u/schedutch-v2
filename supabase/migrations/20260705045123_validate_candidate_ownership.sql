-- save_user_responses / update_user_with_responses に candidate_id の
-- 所属イベントチェックを追加する。
--
-- これまでは responses[].candidate_id がクライアントから渡された値を
-- そのまま insert しており、実際に該当イベント（update側はユーザー自身の
-- 所属イベント）の候補日かどうかを検証していなかった。イベントIDは
-- URLから誰でも閲覧できるため、悪意あるクライアントが自分のuser_idに
-- 別イベントのcandidate_idを紐付けた回答を送り込める余地があった。

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

  insert into users (event_id, name, comment, password_digest)
  values (p_event_id, p_name, p_comment, p_password)
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
    raise exception 'パスワードが違います';
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

  update public.users
     set name = p_name, comment = p_comment
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
