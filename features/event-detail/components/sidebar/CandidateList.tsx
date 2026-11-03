'use client';

import { useEffect, useMemo, useState } from 'react';
import { ja } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { toJSTDateOnly } from '@/lib/datetime';
import {
  buildCandidateDateMap,
  toCalendarDateKey,
} from '@/features/event-detail/lib/candidateDates';
import type { Candidate } from '@/features/event-detail/types';
import { candidateAnchorId } from '@/features/event-detail/lib/anchors';

interface CandidateListProps {
  candidates: Candidate[];
  activeId: string;
  onClickCandidate: (id: string) => void;
}

export default function CandidateList({
  candidates,
  activeId,
  onClickCandidate,
}: CandidateListProps) {
  const candidateEntries = useMemo(
    () =>
      candidates.map((c) => ({ id: candidateAnchorId(c.id), date: toJSTDateOnly(c.start_time) })),
    [candidates],
  );

  const candidateByDateKey = useMemo(() => buildCandidateDateMap(candidates), [candidates]);

  const activeEntry = candidateEntries.find((entry) => entry.id === activeId);
  const [month, setMonth] = useState<Date>(
    activeEntry?.date ?? candidateEntries[0]?.date ?? new Date(),
  );

  useEffect(() => {
    if (activeEntry) {
      setMonth(activeEntry.date);
    }
    // activeIdが候補日の月に変わった時だけ表示月を追従させる（手動での月送りを妨げないため依存はactiveIdのみ）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  return (
    <div className="mt-4">
      <Calendar
        mode="single"
        locale={ja}
        month={month}
        onMonthChange={setMonth}
        selected={activeEntry?.date}
        onSelect={(date) => {
          if (!date) return;
          const entry = candidateByDateKey.get(toCalendarDateKey(date));
          if (entry) onClickCandidate(candidateAnchorId(entry.id));
        }}
        disabled={(date) => !candidateByDateKey.has(toCalendarDateKey(date))}
        className="p-0 [--cell-size:--spacing(8)]"
      />
    </div>
  );
}
