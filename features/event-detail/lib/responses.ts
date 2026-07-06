import { SLOT_INTERVAL_MS } from "@/lib/constants";
import { jstHHMM } from "@/lib/datetime";
import type { ResponseInput } from "@/features/event-detail/api/eventApi";
import type { Candidate } from "@/features/event-detail/types";

export type ResponseFormValue = {
  candidate_id: string;
  time: Date;
  status: string;
};

/** 候補日の範囲をSLOT_INTERVAL_MS刻みで初期化する（未回答は"ok"扱い） */
export function buildInitialResponses(
  candidates: Pick<Candidate, "id" | "start_time" | "end_time">[]
): ResponseFormValue[] {
  const responses: ResponseFormValue[] = [];

  // UTC instant 上の30分刻みでループし、ブラウザTZに依存しない
  candidates.forEach((candidate) => {
    let currentMs = new Date(candidate.start_time).getTime();
    const endMs = new Date(candidate.end_time).getTime();

    while (currentMs < endMs) {
      responses.push({
        candidate_id: candidate.id,
        time: new Date(currentMs),
        status: "ok",
      });
      currentMs += SLOT_INTERVAL_MS;
    }
  });

  return responses;
}

/** フォームの回答値をRPC送信用（time: ISO文字列）に整形する */
export function toResponseInputs(responses: ResponseFormValue[]): ResponseInput[] {
  return responses.map((r) => ({
    candidate_id: r.candidate_id,
    time: r.time.toISOString(),
    status: r.status,
  }));
}

/** 回答フィールド配列を「candidate_id-HHmm」キーのマップに変換する（InputResponsesのセル検索用） */
export function buildResponseSlotMap<T extends { candidate_id: string; time: Date }>(
  fields: T[]
): Record<string, T & { index: number }> {
  return fields.reduce(
    (acc, field, index) => {
      const hhmm = jstHHMM(field.time);
      acc[`${field.candidate_id}-${hhmm}`] = { ...field, index };
      return acc;
    },
    {} as Record<string, T & { index: number }>
  );
}
