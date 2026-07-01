import { supabase } from "@/utils/supabase/client";
import type { EventData, ResponseStatus } from "@/features/event-detail/types";

/** 保存用に整形済みの回答（time は ISO 文字列） */
export interface ResponseInput {
  candidate_id: string;
  time: string;
  status: ResponseStatus | string;
}

/** イベント・候補日・参加者・回答を1クエリで取得 */
export async function getEvent(eventId: string): Promise<EventData> {
  const { data, error } = await supabase
    .from("events")
    .select(`*, candidates (*), users (*, responses (*))`)
    .eq("id", eventId)
    .single();

  if (error) throw error;
  if (!data) throw new Error("イベントが見つかりませんでした");
  return data as EventData;
}

export interface SaveUserResponsesInput {
  eventId: string;
  name: string;
  comment: string;
  passwordDigest: string;
  responses: ResponseInput[];
}

/** 参加者と回答をまとめて作成（RPC 経由） */
export async function saveUserResponses(input: SaveUserResponsesInput): Promise<string> {
  const { data, error } = await supabase.rpc("save_user_responses", {
    p_event_id: input.eventId,
    p_name: input.name,
    p_comment: input.comment,
    p_password: input.passwordDigest,
    p_response_data: input.responses,
  });

  if (error) throw error;
  return data as string;
}

export interface UpdateUserWithResponsesInput {
  userId: string;
  name: string;
  comment: string;
  responses: ResponseInput[];
}

/** 参加者情報を更新し、回答を洗い替えする */
export async function updateUserWithResponses(input: UpdateUserWithResponsesInput): Promise<void> {
  const { userId, name, comment, responses } = input;

  const { error: userError } = await supabase
    .from("users")
    .update({ name, comment })
    .eq("id", userId);
  if (userError) throw userError;

  const { error: deleteError } = await supabase
    .from("responses")
    .delete()
    .eq("user_id", userId);
  if (deleteError) throw deleteError;

  const rows = responses.map((r) => ({ ...r, user_id: userId }));
  const { error: insertError } = await supabase.from("responses").insert(rows);
  if (insertError) throw insertError;
}

/** 参加者を削除 */
export async function deleteUser(userId: string): Promise<void> {
  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) throw error;
}

/** イベントを削除 */
export async function deleteEvent(eventId: string): Promise<void> {
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) throw error;
}
