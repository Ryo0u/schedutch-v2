'use client';

import { useEffect, useMemo, useState } from 'react';
import { ja } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { toJSTDateOnly } from '@/lib/datetime';
import type { Candidate } from '@/features/event-detail/types';
import { candidateAnchorId } from '@/features/event-detail/lib/anchors';

interface CandidateListProps {
  candidates: Candidate[];
  activeId: string;
  onClickCandidate: (id: string) => void;
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
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

  const candidateByDateKey = useMemo(() => {
    const map = new Map<string, { id: string; date: Date }>();
    candidateEntries.forEach((entry) => map.set(dateKey(entry.date), entry));
    return map;
  }, [candidateEntries]);

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
          const entry = candidateByDateKey.get(dateKey(date));
          if (entry) onClickCandidate(entry.id);
        }}
        disabled={(date) => !candidateByDateKey.has(dateKey(date))}
        className="p-0 [--cell-size:--spacing(8)]"
      />
    </div>
  );
}
