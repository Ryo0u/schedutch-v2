-- 開催予定（plans）機能を削除する。
--
-- 利用者は抽出結果を外部（LINE等）へ写して日程を組んでおり、開催予定はほとんど
-- 使われていなかった。クライアントは抽出結果のテキストコピーに戻したため、
-- テーブルと RPC を残す理由がない。
--
-- get_plans は読み取りの RPC 化（20261027000000_read_via_rpc.sql、未マージ）で
-- 追加されるもの。どちらが先に適用されても通るよう、すべて if exists で消す。

drop function if exists "public"."get_plans"(uuid);
drop function if exists "public"."create_plan"(uuid, timestamptz, timestamptz, text, uuid[]);
drop function if exists "public"."update_plan_memo"(uuid, text);
drop function if exists "public"."delete_plan"(uuid);
drop function if exists "public"."validate_plan_participants"(uuid, uuid[]);
drop function if exists "public"."plan_slot_interval"();

-- plan_participants は plans を参照しているので先に消す（policy・index はテーブルごと消える）
drop table if exists "public"."plan_participants";
drop table if exists "public"."plans";
