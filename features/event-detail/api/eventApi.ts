import { supabase } from "@/utils/supabase/client";
import type { EventData, ResponseStatus } from "@/features/event-detail/types";

/**
 * 検証 RPC がパスワード不一致で投げた例外かどうかを判定する。
 * RPC 内の RAISE EXCEPTION メッセージ（「パスワードが違います」）で判別する。
 */
export function isPasswordError(error: unknown): boolean {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message).includes("パスワード");
  }
  return false;
}

/** 編集ダイアログを開く前の事前検証。ユーザー本人のパスワードが正しいかを返す */
export async function verifyUserPassword(userId: string, password: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("verify_user_password", {
    p_user_id: userId,
    p_password: password,
  });
  if (error) throw error;
  return data as boolean;
}

/** 保存用に整形済みの回答（time は ISO 文字列） */
export interface ResponseInput {
  candidate_id: string;
  time: string;
  status: ResponseStatus | string;
}

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
    .from("events")
    .select(
      `id, title, comment, created_at, candidates (*), users (id, event_id, name, comment, created_at, responses (*))`
    )
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
  /** 本人のパスワード（平文）。DB 側 RPC で照合する */
  password: string;
  name: string;
  comment: string;
  responses: ResponseInput[];
}

/** 参加者情報を更新し、回答を洗い替えする（RPC 経由・パスワード照合込み） */
export async function updateUserWithResponses(input: UpdateUserWithResponsesInput): Promise<void> {
  const { error } = await supabase.rpc("update_user_with_responses", {
    p_user_id: input.userId,
    p_password: input.password,
    p_name: input.name,
    p_comment: input.comment,
    p_response_data: input.responses,
  });
  if (error) throw error;
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
  const { error } = await supabase.rpc("update_event", {
    p_event_id: input.eventId,
    p_password: input.password,
    p_title: input.title,
    p_comment: input.comment,
  });
  if (error) throw error;
}

/** 参加者を削除する（RPC 経由・本人 or イベントのパスワードで照合） */
export async function deleteUser(userId: string, password: string): Promise<void> {
  const { error } = await supabase.rpc("delete_user", {
    p_user_id: userId,
    p_password: password,
  });
  if (error) throw error;
}

/** イベントを削除する（RPC 経由・イベントのパスワードで照合） */
export async function deleteEvent(eventId: string, password: string): Promise<void> {
  const { error } = await supabase.rpc("delete_event", {
    p_event_id: eventId,
    p_password: password,
  });
  if (error) throw error;
}
