-- responses.time / candidates の時刻をサーバ側（RPC）でも検証する。
--
-- これまで save_user_responses / update_user_with_responses は
-- candidate_id の所属イベントのみ検証しており、time が候補日の
-- start_time〜end_time の範囲内か・30分グリッド上かを検証していなかった。
-- RPC を直叩きすれば任意の time を挿入でき、extractSlots の allTimes
-- （全 responses.time の和集合）に幽霊スロットが混入し得た。
-- 同様に create_event_with_candidates も start_time < end_time を
-- サーバ側で検証していなかった（クライアント zod のみ）。

create or replace function "public"."create_event_with_candidates"(
  "p_title" text, "p_password_digest" text, "p_comment" text, "p_candidates" jsonb
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
  values (p_title, p_password_digest, p_comment)
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
