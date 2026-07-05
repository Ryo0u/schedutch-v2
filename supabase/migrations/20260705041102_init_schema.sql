-- schedutch-v2 初期スキーマ。
--
-- テーブル・RLS・RPC を最初から一つのマイグレーションとして構築する
-- （旧プロジェクトで手作業により作られていたスキーマを CLI 管理下に
-- 移行する過程で、db pull の不具合や列権限の仕様（select("*") が
-- 1列でも権限のない列があるとクエリ全体を拒否する）を踏まえて再設計した）。

-- 拡張機能 -------------------------------------------------------------------
create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists "pgcrypto" with schema extensions;

-- テーブル --------------------------------------------------------------------
create table "public"."events" (
    "id" uuid default extensions.uuid_generate_v4() primary key,
    "title" text not null,
    "comment" text,
    "password_digest" text,
    "created_at" timestamp with time zone default now()
);

create table "public"."candidates" (
    "id" uuid default extensions.uuid_generate_v4() primary key,
    "event_id" uuid references "public"."events"("id") on delete cascade,
    "start_time" timestamp with time zone not null,
    "end_time" timestamp with time zone not null,
    "index_number" integer
);

create table "public"."users" (
    "id" uuid default extensions.uuid_generate_v4() primary key,
    "event_id" uuid references "public"."events"("id") on delete cascade,
    "name" text not null,
    "comment" text,
    "password_digest" text,
    "created_at" timestamp with time zone default now()
);

create table "public"."responses" (
    "id" uuid default extensions.uuid_generate_v4() primary key,
    "user_id" uuid references "public"."users"("id") on delete cascade,
    "candidate_id" uuid references "public"."candidates"("id") on delete cascade,
    "status" text not null check (status in ('ok', 'ng', 'maybe')),
    "time" timestamp with time zone not null,
    unique ("user_id", "candidate_id", "time")
);

create index "idx_candidates_event_id" on "public"."candidates" using btree ("event_id");
create index "idx_responses_candidate_id" on "public"."responses" using btree ("candidate_id");
create index "idx_responses_user_id" on "public"."responses" using btree ("user_id");
create index "idx_users_event_id" on "public"."users" using btree ("event_id");

-- RLS ---------------------------------------------------------------------
alter table "public"."events" enable row level security;
alter table "public"."candidates" enable row level security;
alter table "public"."users" enable row level security;
alter table "public"."responses" enable row level security;

create policy "anon can read events" on "public"."events" for select to anon using (true);
create policy "anon can read candidates" on "public"."candidates" for select to anon using (true);
create policy "anon can read users" on "public"."users" for select to anon using (true);
create policy "anon can read responses" on "public"."responses" for select to anon using (true);

-- 権限 ---------------------------------------------------------------------
-- anon には SELECT のみ許可する（INSERT/UPDATE/DELETE は一切許可しない。
-- write は全て SECURITY DEFINER な RPC 経由に限定する）。
grant usage on schema "public" to anon, authenticated, service_role;

grant select on "public"."events", "public"."candidates", "public"."users", "public"."responses"
  to anon, authenticated, service_role;

-- password_digest はクライアントに一切配信しない。
-- 注意: select("*") は対象列のうち1つでも権限が無いとクエリ全体を拒否するため、
-- アプリ側では events/users を select する際に password_digest 以外の列を
-- 明示的に指定すること（features/event-detail/api/eventApi.ts の getEvent 参照）。
revoke select ("password_digest") on "public"."events" from anon, authenticated;
revoke select ("password_digest") on "public"."users"  from anon, authenticated;

-- RPC（write は全てここ経由。パスワードが絡む操作は crypt() で照合） -----------

create or replace function "public"."create_event_with_candidates"(
  "p_title" text, "p_password_digest" text, "p_comment" text, "p_candidates" jsonb
) returns uuid
    language plpgsql security definer
    set search_path to 'public', 'extensions'
    as $$
declare
  new_event_id uuid;
begin
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
    raise exception 'パスワードが違います';
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
begin
  select password_digest into v_digest from public.users where id = p_user_id;
  if v_digest is null then
    raise exception 'ユーザーが見つかりませんでした';
  end if;
  if v_digest <> extensions.crypt(p_password, v_digest) then
    raise exception 'パスワードが違います';
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
    raise exception 'パスワードが違います';
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
    raise exception 'パスワードが違います';
  end if;
end;
$$;

create or replace function "public"."verify_user_password"(
  "p_user_id" uuid, "p_password" text
) returns boolean
    language plpgsql security definer
    set search_path to 'public', 'extensions'
    as $$
declare
  v_digest text;
begin
  select password_digest into v_digest from public.users where id = p_user_id;
  if v_digest is null then
    return false;
  end if;
  return v_digest = extensions.crypt(p_password, v_digest);
end;
$$;

-- RPC 実行権限（anon から直接呼べる必要があるもののみ） -------------------------
grant execute on function "public"."create_event_with_candidates"(text, text, text, jsonb) to anon, authenticated, service_role;
grant execute on function "public"."save_user_responses"(uuid, text, text, text, jsonb) to anon, authenticated, service_role;
grant execute on function "public"."update_event"(uuid, text, text, text) to anon, authenticated, service_role;
grant execute on function "public"."update_user_with_responses"(uuid, text, text, text, jsonb) to anon, authenticated, service_role;
grant execute on function "public"."delete_event"(uuid, text) to anon, authenticated, service_role;
grant execute on function "public"."delete_user"(uuid, text) to anon, authenticated, service_role;
grant execute on function "public"."verify_user_password"(uuid, text) to anon, authenticated, service_role;
