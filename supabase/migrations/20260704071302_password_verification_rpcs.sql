-- パスワード検証をサーバー側に集約する RPC 群。
--
--   * すべて SECURITY DEFINER（RLS を越えて write する）。
--   * 先頭で crypt(平文, digest) = digest により照合し、不一致なら例外を投げる。
--     既存の digest は bcryptjs 製（$2a$/$2b$）で、pgcrypto の crypt() でそのまま検証できる。
--   * 平文パスワードは引数で受け取り、digest はクライアントに一切返さない。

create extension if not exists pgcrypto with schema extensions;

-- delete_event: イベントパスワードで照合し、イベント一式を削除 --------------------
create or replace function public.delete_event(p_event_id uuid, p_password text)
returns void
language plpgsql
security definer
set search_path = public, extensions
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

-- delete_user: ユーザー本人 or イベントの digest のどちらかに一致すれば削除 --------
--   本人削除（ユーザーパスワード）と幹事削除（イベントパスワード）の両フローを兼ねる。
create or replace function public.delete_user(p_user_id uuid, p_password text)
returns void
language plpgsql
security definer
set search_path = public, extensions
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

-- update_user_with_responses: ユーザー本人の digest で照合し、更新＋回答洗い替え ----
create or replace function public.update_user_with_responses(
  p_user_id       uuid,
  p_password      text,
  p_name          text,
  p_comment       text,
  p_response_data jsonb
)
returns void
language plpgsql
security definer
set search_path = public, extensions
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

-- update_event: イベントパスワードで照合し、タイトル・コメントを更新 --------------
--   候補日(candidates)の編集は回答へ波及するため今回スコープ外。
create or replace function public.update_event(
  p_event_id uuid,
  p_password text,
  p_title    text,
  p_comment  text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
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

-- verify_user_password: ユーザー本人の digest と照合して真偽を返す（read 用途） --
--   編集ダイアログを開く前の事前検証に使う（実 write は update_user_with_responses が再検証）。
create or replace function public.verify_user_password(p_user_id uuid, p_password text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
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

-- 実行権限は anon にのみ付与（write は必ずこの RPC を通す） --------------------
revoke all on function public.delete_event(uuid, text)                             from public;
revoke all on function public.delete_user(uuid, text)                              from public;
revoke all on function public.update_user_with_responses(uuid, text, text, text, jsonb) from public;
revoke all on function public.update_event(uuid, text, text, text)                 from public;

grant execute on function public.delete_event(uuid, text)                             to anon;
grant execute on function public.delete_user(uuid, text)                              to anon;
grant execute on function public.update_user_with_responses(uuid, text, text, text, jsonb) to anon;
grant execute on function public.update_event(uuid, text, text, text)                 to anon;

revoke all on function public.verify_user_password(uuid, text) from public;
grant execute on function public.verify_user_password(uuid, text) to anon;
