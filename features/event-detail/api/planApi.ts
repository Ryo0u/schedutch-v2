import { supabase } from '@/utils/supabase/client';
import type { Plan } from '@/features/event-detail/types';

/**
 * 開催予定を参加メンバー込みで取得する（RPC 経由）。
 * participants への平坦化・並び順（開始→終了時刻）は RPC 側で済ませている。
 */
export async function getPlans(eventId: string): Promise<Plan[]> {
  const { data, error } = await supabase.rpc('get_plans', { p_event_id: eventId });

  if (error) throw error;
  return data as unknown as Plan[];
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
