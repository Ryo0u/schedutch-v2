import { toJSTDateOnly } from '@/lib/datetime';
import type { Candidate } from '@/features/event-detail/types';

/**
 * カレンダーの日付照合用キー。react-day-picker は Date のローカル年月日で日付を扱うため、
 * toJSTDateOnly で作った Date と同じくローカルの年月日から作る。
 */
export function toCalendarDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** 候補日をカレンダーの日付キーで引けるマップにする（候補日以外を選択不可にする判定に使う） */
export function buildCandidateDateMap(
  candidates: Pick<Candidate, 'id' | 'start_time'>[],
): Map<string, { id: string; date: Date }> {
  const map = new Map<string, { id: string; date: Date }>();
  candidates.forEach((candidate) => {
    const date = toJSTDateOnly(candidate.start_time);
    map.set(toCalendarDateKey(date), { id: candidate.id, date });
  });
  return map;
}
