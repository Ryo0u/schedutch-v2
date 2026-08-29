import { supabase } from '@/utils/supabase/client';
import type { EventData } from '@/features/event-detail/types';
import { createEventNotFoundError } from '@/features/event-detail/api/errors';

/**
 * イベント・候補日・参加者・回答を1クエリで取得。
 *
 * events/users は password_digest 列の SELECT 権限を anon から剥奪しているため、
 * `select("*")` を使うと（1列でも権限がない列があるとクエリ全体が拒否される
 * という Postgres の列権限の仕様により）取得自体が失敗する。そのため
 * password_digest を含まない列を明示的に指定する。
 */
export async function getEvent(eventId: string): Promise<EventData> {
  const { data, error } = await supabase
    .from('events')
    .select(
      `id, title, comment, created_at, candidates (*), users (id, event_id, name, comment, created_at, responses (*))`,
    )
    .eq('id', eventId)
    .order('start_time', { referencedTable: 'candidates', ascending: true })
    .order('created_at', { referencedTable: 'users', ascending: true })
    .single();

  if (error) throw error;
  if (!data) throw createEventNotFoundError();
  return data as EventData;
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
