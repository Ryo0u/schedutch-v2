import { supabase } from '@/utils/supabase/client';
import type { Plan } from '@/features/event-detail/types';

/**
 * 開催予定を参加メンバー込みで取得する。
 *
 * users は password_digest 列の SELECT 権限が無く `select("*")` が
 * クエリごと拒否されるため、列を明示指定する（eventApi.getEvent と同じ注意点）。
 */
export async function getPlans(eventId: string): Promise<Plan[]> {
  const { data, error } = await supabase
    .from('plans')
    .select(`id, event_id, start_time, end_time, memo, plan_participants (users (id, name))`)
    .eq('event_id', eventId)
    .order('start_time', { ascending: true })
    // 開始が同時刻の予定でも並びが入れ替わらないよう、終了時刻を第2キーにする
    .order('end_time', { ascending: true });

  if (error) throw error;

  // ネストした plan_participants → users を、扱いやすい participants 配列に平坦化する
  return (data ?? []).map((row) => ({
    id: row.id,
    event_id: row.event_id,
    start_time: row.start_time,
    end_time: row.end_time,
    memo: row.memo ?? '',
    // users が null になるのは参加者が削除された直後の中間行だけなので、その行は落とす
    participants: row.plan_participants.flatMap((pp) =>
      pp.users ? [{ id: pp.users.id, name: pp.users.name }] : [],
    ),
  }));
}

export interface CreatePlanInput {
  eventId: string;
  /** UTC の ISO 文字列 */
  startTime: string;
  endTime: string;
  memo: string;
  userIds: string[];
}

/** 予定を作成する（RPC 経由。パスワード照合は行わない仕様） */
export async function createPlan(input: CreatePlanInput): Promise<string> {
  const { data, error } = await supabase.rpc('create_plan', {
    p_event_id: input.eventId,
    p_start_time: input.startTime,
    p_end_time: input.endTime,
    p_memo: input.memo,
    p_user_ids: input.userIds,
  });
  if (error) throw error;
  return data;
}

export interface UpdatePlanMemoInput {
  planId: string;
  memo: string;
}

/**
 * 予定のメモを更新する（RPC 経由）。
 * 日時とメンバーは抽出結果から決まるため更新できない（回答とのズレを防ぐ）。
 */
export async function updatePlanMemo(input: UpdatePlanMemoInput): Promise<void> {
  const { error } = await supabase.rpc('update_plan_memo', {
    p_plan_id: input.planId,
    p_memo: input.memo,
  });
  if (error) throw error;
}

/** 予定を削除する（メンバーは CASCADE で消える。RPC 経由） */
export async function deletePlan(planId: string): Promise<void> {
  const { error } = await supabase.rpc('delete_plan', { p_plan_id: planId });
  if (error) throw error;
}
