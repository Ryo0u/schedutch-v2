import { supabase } from "@/utils/supabase/client";

/** RPC 用に整形済みの候補日（time は ISO 文字列） */
export interface CandidateInput {
  start_time: string;
  end_time: string;
  index_number: number;
}

export interface CreateEventInput {
  title: string;
  passwordDigest: string;
  comment: string;
  candidates: CandidateInput[];
}

/** イベントと候補日をトランザクションで作成（RPC 経由）。作成した event id を返す */
export async function createEvent(input: CreateEventInput): Promise<string> {
  const { data, error } = await supabase.rpc("create_event_with_candidates", {
    p_title: input.title,
    p_password_digest: input.passwordDigest,
    p_comment: input.comment,
    p_candidates: input.candidates,
  });

  if (error) throw error;
  return data as string;
}
