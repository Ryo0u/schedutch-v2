-- 権限修正: Supabase の新規プロジェクトには最初から
-- `alter default privileges ... grant all on tables to anon` が設定されており、
-- CREATE TABLE した瞬間に anon へ ALL（SELECT/INSERT/UPDATE/DELETE 全て）が
-- 自動付与される。前マイグレーションの `revoke select (password_digest) ...`
-- は「grant select」個別の権限しか取り消せず、この自動付与された ALL 権限には
-- 効かなかった（Postgres の権限は加算的で、片方の revoke がもう片方の
-- 広い grant を打ち消すことはない）ため、password_digest が実際には
-- 依然として select 可能なままだった。
--
-- ここで一度 ALL 権限を明示的に revoke し、必要な権限だけを明示的に
-- grant し直す。write（INSERT/UPDATE/DELETE）は RLS で policy が無いため
-- 引き続き拒否されるが、権限モデル自体も write を許可しない状態に揃える。

revoke all on "public"."events", "public"."candidates", "public"."users", "public"."responses"
  from anon, authenticated;

grant select on "public"."candidates", "public"."responses" to anon, authenticated, service_role;

grant select (id, title, comment, created_at) on "public"."events" to anon, authenticated;
grant select (id, event_id, name, comment, created_at) on "public"."users" to anon, authenticated;

grant select on "public"."events", "public"."users" to service_role;
