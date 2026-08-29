import { supabase } from '@/utils/supabase/client';
import type { ResponseInput } from '@/features/event-detail/types';

/** 編集ダイアログを開く前の事前検証。ユーザー本人のパスワードが正しいかを返す */
export async function verifyUserPassword(userId: string, password: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('verify_user_password', {
    p_user_id: userId,
    p_password: password,
  });
  if (error) throw error;
  return data;
}

export interface SaveUserResponsesInput {
  eventId: string;
  name: string;
  comment: string;
  password: string;
  responses: ResponseInput[];
}

/** 参加者と回答をまとめて作成（RPC 経由） */
export async function saveUserResponses(input: SaveUserResponsesInput): Promise<string> {
  const { data, error } = await supabase.rpc('save_user_responses', {
    p_event_id: input.eventId,
    p_name: input.name,
    p_comment: input.comment,
    p_password: input.password,
    p_response_data: input.responses,
  });

  if (error) throw error;
  // save_user_responses は json_build_object('user_id', ...) を返す
  return (data as { user_id: string }).user_id;
}

export interface UpdateUserWithResponsesInput {
  userId: string;
  /** 本人のパスワード（平文）。DB 側 RPC で照合する */
  password: string;
  name: string;
  comment: string;
  responses: ResponseInput[];
}

/** 参加者情報を更新し、回答を洗い替えする（RPC 経由・パスワード照合込み） */
export async function updateUserWithResponses(input: UpdateUserWithResponsesInput): Promise<void> {
  const { error } = await supabase.rpc('update_user_with_responses', {
    p_user_id: input.userId,
    p_password: input.password,
    p_name: input.name,
    p_comment: input.comment,
    p_response_data: input.responses,
  });
  if (error) throw error;
}

/** 参加者を削除する（RPC 経由・本人 or イベントのパスワードで照合） */
export async function deleteUser(userId: string, password: string): Promise<void> {
  const { error } = await supabase.rpc('delete_user', {
    p_user_id: userId,
    p_password: password,
  });
  if (error) throw error;
}
