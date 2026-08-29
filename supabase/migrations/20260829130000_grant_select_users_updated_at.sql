-- users.updated_at への anon / authenticated の SELECT 権限を付与する。
--
-- 20260705041653_fix_column_grants.sql が users から password_digest 列を
-- revoke した時点で、PostgreSQL は anon / authenticated のテーブルレベル
-- SELECT 権限を「当時存在した列ごとの明示的な列権限」に変換する。そのため
-- 20260829000000 で後から追加した updated_at はこの2ロールの SELECT 対象外に
-- なり、その列を含む getEvent クエリが「1列でも権限がないとクエリ全体を拒否」
-- の仕様で 401 になっていた。明示的に列権限を足して解消する。
grant select ("updated_at") on "public"."users" to anon, authenticated;
