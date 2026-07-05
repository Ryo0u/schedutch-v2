-- パスワード不一致の例外に専用の SQLSTATE ('PWD01') を付与する。
--
-- これまでクライアント側 isPasswordError() は RAISE EXCEPTION の
-- メッセージ文言（「パスワードが違います」を含むか）で判定していたが、
-- これは SQL 側の文言を変えるだけでサイレントに壊れる脆い結合だった。
-- SQLSTATE はエラーの種類を表す構造化されたコードなので、メッセージ文言と
-- 判定ロジックを分離できる。

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
    raise exception 'イベントが見つかりませんでした';
  end if;
  if v_digest <> extensions.crypt(p_password, v_digest) then
    raise exception 'パスワードが違います' using errcode = 'PWD01';
  end if;

  update public.events
     set title = p_title, comment = p_comment
   where id = p_event_id;
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
    raise exception 'イベントが見つかりませんでした';
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
    raise exception 'ユーザーが見つかりませんでした';
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
