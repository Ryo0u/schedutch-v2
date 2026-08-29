-- ローカル開発用シードデータ（`supabase db reset` のたびに投入される）。
-- 複数候補日 × 複数参加者 × ok/maybe/ng が混在した回答を再現し、
-- 予定抽出機能（docs/extract.md）や回答一覧の動作確認をブラウザ操作なしで行えるようにする。
--
-- パスワードは全員共通で "test1234"。
-- digest は RPC と同じ手順（pgcrypto の crypt + cost 10）で生成する。

begin;

insert into public.events (id, title, comment, password_digest)
values (
  '11111111-1111-1111-1111-111111111111',
  '秋の顔合わせ会',
  '候補日から都合の良い時間を選んでください',
  extensions.crypt('test1234', extensions.gen_salt('bf', 10))
);

-- 候補日1: 2026-08-03(月) 09:00-12:00 JST
-- 候補日2: 2026-08-04(火) 13:00-18:00 JST
insert into public.candidates (id, event_id, start_time, end_time, index_number)
values
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', '2026-08-03T00:00:00+00', '2026-08-03T03:00:00+00', 0),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '2026-08-04T04:00:00+00', '2026-08-04T09:00:00+00', 1);

insert into public.users (id, event_id, name, comment, password_digest)
values
  ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', '田中', null, extensions.crypt('test1234', extensions.gen_salt('bf', 10))),
  ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', '佐藤', 'できれば午後がいいです', extensions.crypt('test1234', extensions.gen_salt('bf', 10))),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '鈴木', null, extensions.crypt('test1234', extensions.gen_salt('bf', 10)));

-- 田中: 候補日1は終日ok、候補日2は最終スロットのみng
insert into public.responses (user_id, candidate_id, time, status)
select '33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222221', t, 'ok'
from generate_series('2026-08-03T00:00:00+00'::timestamptz, '2026-08-03T02:30:00+00'::timestamptz, interval '30 min') as t;

insert into public.responses (user_id, candidate_id, time, status)
select '33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222222', t, 'ok'
from generate_series('2026-08-04T04:00:00+00'::timestamptz, '2026-08-04T08:00:00+00'::timestamptz, interval '30 min') as t;

insert into public.responses (user_id, candidate_id, time, status)
values ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222222', '2026-08-04T08:30:00+00', 'ng');

-- 佐藤: 候補日1は終日ng、候補日2は前後をmaybeで挟んで中盤ok
insert into public.responses (user_id, candidate_id, time, status)
select '33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222221', t, 'ng'
from generate_series('2026-08-03T00:00:00+00'::timestamptz, '2026-08-03T02:30:00+00'::timestamptz, interval '30 min') as t;

insert into public.responses (user_id, candidate_id, time, status)
values ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222222', '2026-08-04T04:00:00+00', 'maybe');

insert into public.responses (user_id, candidate_id, time, status)
select '33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222222', t, 'ok'
from generate_series('2026-08-04T04:30:00+00'::timestamptz, '2026-08-04T07:30:00+00'::timestamptz, interval '30 min') as t;

insert into public.responses (user_id, candidate_id, time, status)
select '33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222222', t, 'maybe'
from generate_series('2026-08-04T08:00:00+00'::timestamptz, '2026-08-04T08:30:00+00'::timestamptz, interval '30 min') as t;

-- 鈴木: 候補日1は序盤maybe・後半ok、候補日2は前半ok・終盤ngを挟んでok
insert into public.responses (user_id, candidate_id, time, status)
select '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222221', t, 'maybe'
from generate_series('2026-08-03T00:00:00+00'::timestamptz, '2026-08-03T00:30:00+00'::timestamptz, interval '30 min') as t;

insert into public.responses (user_id, candidate_id, time, status)
select '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222221', t, 'ok'
from generate_series('2026-08-03T01:00:00+00'::timestamptz, '2026-08-03T02:30:00+00'::timestamptz, interval '30 min') as t;

insert into public.responses (user_id, candidate_id, time, status)
select '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', t, 'ok'
from generate_series('2026-08-04T04:00:00+00'::timestamptz, '2026-08-04T07:00:00+00'::timestamptz, interval '30 min') as t;

insert into public.responses (user_id, candidate_id, time, status)
values ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', '2026-08-04T07:30:00+00', 'ng');

insert into public.responses (user_id, candidate_id, time, status)
values ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', '2026-08-04T08:30:00+00', 'ok');

-- 開催予定（docs/event-detail.md の「開催予定」セクション）のサンプル。
-- 1件目は佐藤が ▲（未定）で回答していた時間帯を含むため、画面上は佐藤に ▲ が付く。
insert into public.plans (id, event_id, start_time, end_time, memo)
values
  ('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', '2026-08-04T04:00:00+00', '2026-08-04T06:00:00+00', '場所は渋谷'),
  ('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111111', '2026-08-03T01:00:00+00', '2026-08-03T03:00:00+00', null);

insert into public.plan_participants (plan_id, user_id)
values
  ('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333331'),
  ('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333332'),
  ('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333333'),
  ('44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333331'),
  ('44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333333');

commit;
