-- read も RPC 経由に限定し、イベント id を知らなければ 1 行も引けない状態にする（#139）。
--
-- 背景: これまで 6 テーブルすべてに `for select to anon using (true)` のポリシーがあり、
-- ブラウザに配布される anon key だけで PostgREST から全イベント・全参加者（実名・コメント）・
-- 全回答・全予定を列挙できた。クライアントの `.eq('id', eventId)` は作法にすぎず、
-- 「URL を知っている人だけが閲覧できる」という前提が DB 層で担保されていなかった。
--
-- 対応: 引数のイベント配下だけを返す SECURITY DEFINER の read RPC を追加し、
-- テーブルへの SELECT ポリシーと anon / authenticated の SELECT 権限を外す。
-- 権限も外すのは、将来ポリシーを誤って足しても直接 select できないようにするため。

-- get_event: イベント・候補日・参加者・回答を1つの json で返す -------------------
-- 形は従来の PostgREST 埋め込み select（features/event-detail/types.ts の EventData）と同じ。
-- password_digest は含めない。
create or replace function "public"."get_event"("p_event_id" uuid) returns json
    language plpgsql stable security definer
    set search_path to 'public', 'extensions'
    as $$
declare
  v_result json;
begin
  select json_build_object(
    'id', e.id,
    'title', e.title,
    'comment', e.comment,
    'created_at', e.created_at,
    'candidates', coalesce((
      select json_agg(json_build_object(
        'id', c.id,
        'event_id', c.event_id,
        'start_time', c.start_time,
        'end_time', c.end_time,
        'index_number', c.index_number
      ) order by c.start_time)
      from public.candidates c
      where c.event_id = e.id
    ), '[]'::json),
    'users', coalesce((
      select json_agg(json_build_object(
        'id', u.id,
        'event_id', u.event_id,
        'name', u.name,
        'comment', u.comment,
        'created_at', u.created_at,
        'updated_at', u.updated_at,
        'responses', coalesce((
          select json_agg(json_build_object(
            'id', r.id,
            'user_id', r.user_id,
            'candidate_id', r.candidate_id,
            'status', r.status,
            'time', r.time
          ) order by r.time)
          from public.responses r
          where r.user_id = u.id
        ), '[]'::json)
      ) order by u.created_at)
      from public.users u
      where u.event_id = e.id
    ), '[]'::json)
  )
  into v_result
  from public.events e
  where e.id = p_event_id;

  if v_result is null then
    raise exception 'イベントが見つかりませんでした' using errcode = 'NTF01';
  end if;
  return v_result;
end;
$$;

-- get_event_title: OGP 用にタイトルだけを返す。未存在なら null ---------------------
create or replace function "public"."get_event_title"("p_event_id" uuid) returns text
    language sql stable security definer
    set search_path to 'public', 'extensions'
    as $$
  select title from public.events where id = p_event_id;
$$;

-- get_plans: 開催予定を参加メンバー込みで返す（features/event-detail/types.ts の Plan[]） --
-- 未存在のイベントでも例外にせず空配列を返す（従来の select と同じ挙動）。
create or replace function "public"."get_plans"("p_event_id" uuid) returns json
    language sql stable security definer
    set search_path to 'public', 'extensions'
    as $$
  select coalesce(json_agg(json_build_object(
    'id', p.id,
    'event_id', p.event_id,
    'start_time', p.start_time,
    'end_time', p.end_time,
    'memo', coalesce(p.memo, ''),
    'participants', coalesce((
      select json_agg(json_build_object('id', u.id, 'name', u.name) order by u.created_at)
      from public.plan_participants pp
      join public.users u on u.id = pp.user_id
      where pp.plan_id = p.id
    ), '[]'::json)
    -- 開始が同時刻の予定でも並びが入れ替わらないよう、終了時刻を第2キーにする
  ) order by p.start_time, p.end_time), '[]'::json)
  from public.plans p
  where p.event_id = p_event_id;
$$;

grant execute on function "public"."get_event"(uuid) to anon, authenticated, service_role;
grant execute on function "public"."get_event_title"(uuid) to anon, authenticated, service_role;
grant execute on function "public"."get_plans"(uuid) to anon, authenticated, service_role;

-- 直接 select を封鎖する ---------------------------------------------------------
drop policy "anon can read events" on "public"."events";
drop policy "anon can read candidates" on "public"."candidates";
drop policy "anon can read users" on "public"."users";
drop policy "anon can read responses" on "public"."responses";
drop policy "anon can read plans" on "public"."plans";
drop policy "anon can read plan_participants" on "public"."plan_participants";

-- テーブルレベルの revoke は列単位の grant（events / users の列ごとの select）も取り消す。
-- service_role の権限は Cron 等のサーバー処理用に残す。
revoke select on "public"."events", "public"."candidates", "public"."users",
                 "public"."responses", "public"."plans", "public"."plan_participants"
  from anon, authenticated;
