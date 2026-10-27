import { supabase } from '@/utils/supabase/client';
import type { EventData } from '@/features/event-detail/types';

/**
 * イベント・候補日・参加者・回答をまとめて取得する（RPC 経由）。
 * テーブルへの直接 select は RLS / 権限で封鎖しており、イベント id を指定した RPC でしか読めない。
 * イベントが存在しない場合、RPC は NTF01 を投げる。
 */
export async function getEvent(eventId: string): Promise<EventData> {
  const { data, error } = await supabase.rpc('get_event', { p_event_id: eventId });

  if (error) throw error;
  return data as unknown as EventData;
}

/**
 * OGP 用にイベントのタイトルだけを取得する（Server Component の generateMetadata から呼ぶ）。
 * イベントが存在しない場合は null を返す。
 */
export async function getEventTitle(eventId: string): Promise<string | null> {
  // 生成型は戻り値を string とするが、未存在のイベントでは RPC が null を返す
  const { data, error } = await supabase.rpc('get_event_title', { p_event_id: eventId });

  if (error) throw error;
  return data ?? null;
}

export interface UpdateEventInput {
  eventId: string;
  /** イベントのパスワード（平文）。DB 側 RPC で照合する */
  password: string;
  title: string;
  comment: string;
}

/** イベントのタイトル・コメントを更新する（RPC 経由・パスワード照合込み） */
export async function updateEvent(input: UpdateEventInput): Promise<void> {
  const { error } = await supabase.rpc('update_event', {
    p_event_id: input.eventId,
    p_password: input.password,
    p_title: input.title,
    p_comment: input.comment,
  });
  if (error) throw error;
}

/** イベントを削除する（RPC 経由・イベントのパスワードで照合） */
export async function deleteEvent(eventId: string, password: string): Promise<void> {
  const { error } = await supabase.rpc('delete_event', {
    p_event_id: eventId,
    p_password: password,
  });
  if (error) throw error;
}
