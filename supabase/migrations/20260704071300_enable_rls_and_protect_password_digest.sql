-- RLS を有効化し、password_digest をクライアント(anon)に配信しないようにする。
--
-- 方針:
--   * events / candidates / users / responses の read は anon に許可（公開閲覧を維持）。
--   * write(INSERT/UPDATE/DELETE) 用ポリシーは anon に付与しない → 直叩き write を全面封鎖。
--     すべての write は SECURITY DEFINER な RPC 経由に限定する。
--   * events.password_digest / users.password_digest は列単位で anon の SELECT 権限を剥奪。
--   * 既存の作成系 RPC は SECURITY DEFINER にして RLS 有効化後も書き込めるようにする。

-- 1) RLS 有効化 -------------------------------------------------------------
alter table public.events     enable row level security;
alter table public.candidates enable row level security;
alter table public.users      enable row level security;
alter table public.responses  enable row level security;

-- 2) 公開 read ポリシー（write ポリシーは意図的に作らない） ------------------
drop policy if exists "anon can read events"     on public.events;
drop policy if exists "anon can read candidates" on public.candidates;
drop policy if exists "anon can read users"      on public.users;
drop policy if exists "anon can read responses"  on public.responses;

create policy "anon can read events"     on public.events     for select to anon using (true);
create policy "anon can read candidates" on public.candidates for select to anon using (true);
create policy "anon can read users"      on public.users      for select to anon using (true);
create policy "anon can read responses"  on public.responses  for select to anon using (true);

-- 3) password_digest の列単位保護 -------------------------------------------
--    テーブル全体の SELECT を剥奪し、password_digest を除く全列だけを再付与する。
--    追加カラムがあっても壊れないよう information_schema から動的に列を組み立てる。
do $$
declare
  v_cols text;
begin
  -- events
  select string_agg(quote_ident(column_name), ', ')
    into v_cols
    from information_schema.columns
   where table_schema = 'public'
     and table_name  = 'events'
     and column_name <> 'password_digest';
  execute 'revoke select on public.events from anon';
  execute format('grant select (%s) on public.events to anon', v_cols);

  -- users
  select string_agg(quote_ident(column_name), ', ')
    into v_cols
    from information_schema.columns
   where table_schema = 'public'
     and table_name  = 'users'
     and column_name <> 'password_digest';
  execute 'revoke select on public.users from anon';
  execute format('grant select (%s) on public.users to anon', v_cols);
end $$;

-- 4) 既存の作成系 RPC を SECURITY DEFINER に（RLS 有効化後も書き込めるように） --
--    署名が不明でも動くよう pg_proc から regprocedure を引いて ALTER する。
do $$
declare
  r record;
begin
  for r in
    select oid::regprocedure as sig
      from pg_proc
     where pronamespace = 'public'::regnamespace
       and proname in ('create_event_with_candidates', 'save_user_responses')
  loop
    execute format('alter function %s security definer', r.sig);
  end loop;
end $$;
