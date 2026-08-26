import * as z from 'zod';
import { RESPONSE_STATUSES } from './status';
import type { ResponseFormValue } from '@/features/event-detail/schema';

/** 保存形式を変えたときに古い下書きを破棄させるための版数 */
const DRAFT_VERSION = 1;

// 入力途中の値を保存するため、name/comment はフォームのバリデーションを通さない。
// パスワードは共有端末に平文で残さないよう、下書きには含めない
const draftSchema = z.object({
  version: z.literal(DRAFT_VERSION),
  name: z.string(),
  comment: z.string(),
  responses: z.array(
    z.object({
      candidate_id: z.string(),
      time: z.string(),
      status: z.enum(RESPONSE_STATUSES),
    }),
  ),
});

export interface ResponseDraft {
  name: string;
  comment: string;
  responses: ResponseFormValue[];
}

export function responseDraftKey(eventId: string): string {
  return `schedutch:response-draft:${eventId}`;
}

/** 下書きを保存用のJSON文字列に変換する（timeはISO文字列） */
export function serializeResponseDraft(draft: ResponseDraft): string {
  return JSON.stringify({
    version: DRAFT_VERSION,
    name: draft.name,
    comment: draft.comment,
    responses: draft.responses.map((response) => ({
      candidate_id: response.candidate_id,
      time: response.time.toISOString(),
      status: response.status,
    })),
  });
}

/**
 * 保存済みの下書きを復元する。
 * 壊れたJSON・版数違い・現在の候補日に存在しないcandidate_idを含むものは
 * 復元せず null を返す（呼び出し側で破棄させる）。
 */
export function parseResponseDraft(raw: string, candidateIds: string[]): ResponseDraft | null {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }

  const parsed = draftSchema.safeParse(json);
  if (!parsed.success) return null;

  const knownCandidateIds = new Set(candidateIds);
  const responses: ResponseFormValue[] = [];

  for (const response of parsed.data.responses) {
    if (!knownCandidateIds.has(response.candidate_id)) return null;

    const time = new Date(response.time);
    if (Number.isNaN(time.getTime())) return null;

    responses.push({
      candidate_id: response.candidate_id,
      time,
      status: response.status,
    });
  }

  return { name: parsed.data.name, comment: parsed.data.comment, responses };
}
