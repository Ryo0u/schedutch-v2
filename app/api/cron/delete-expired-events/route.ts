import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

// Vercel Cron から1日1回叩かれる。放置イベントの削除を行い、あわせて
// 本番 Supabase（無料プラン）の自動停止対策（write を発生させる keep-alive）を兼ねる。
// 詳細は docs/database.md / docs/overview.md を参照。

// レスポンスがキャッシュされると Supabase に到達せず意味が無くなるため動的化する。
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  // Vercel は CRON_SECRET が設定されていると Cron リクエストに
  // Authorization: Bearer <CRON_SECRET> を自動付与する。外部からの叩き込みを弾く。
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[cron/delete-expired-events] Supabase の接続情報が未設定です');
    return new Response('Server misconfigured', { status: 500 });
  }

  // delete_expired_events は EXECUTE を service_role のみに絞っているため、
  // publishable key のシングルトンではなく service ロールのクライアントで呼ぶ。
  const admin = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin.rpc('delete_expired_events');
  if (error) {
    console.error('[cron/delete-expired-events] RPC 失敗:', error);
    return new Response('RPC failed', { status: 500 });
  }

  return Response.json({ ok: true, deleted: data });
}
