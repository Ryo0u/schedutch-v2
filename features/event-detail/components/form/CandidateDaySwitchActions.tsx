'use client';

import { useMemo, useState } from 'react';
import { ja } from 'date-fns/locale';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatJSTCandidateDateLabel, toJSTDateOnly } from '@/lib/datetime';
import {
  buildCandidateDateMap,
  toCalendarDateKey,
} from '@/features/event-detail/lib/candidateDates';
import type { Candidate } from '@/features/event-detail/types';

interface CandidateDaySwitchActionsProps {
  candidates: Pick<Candidate, 'id' | 'start_time'>[];
  activeId: string;
  onChange: (candidateId: string) => void;
}

/** スマホの 1 日表示で、表示する候補日を前後ボタンかカレンダーで切り替える */
function CandidateDaySwitchActions({
  candidates,
  activeId,
  onChange,
}: CandidateDaySwitchActionsProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const candidateByDateKey = useMemo(() => buildCandidateDateMap(candidates), [candidates]);

  const activeIndex = candidates.findIndex((candidate) => candidate.id === activeId);
  const active = candidates[activeIndex];
  const prev = candidates[activeIndex - 1];
  const next = candidates[activeIndex + 1];

  if (!active) return null;

  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="前の候補日"
        disabled={!prev}
        onClick={() => prev && onChange(prev.id)}
      >
        <ChevronLeft />
      </Button>

      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger
          render={
            <Button type="button" variant="ghost" className="font-bold">
              <CalendarDays />
              {formatJSTCandidateDateLabel(active.start_time)}
              <span className="text-muted-foreground text-xs font-normal">
                （{activeIndex + 1}/{candidates.length}）
              </span>
            </Button>
          }
        />
        <PopoverContent className="w-auto">
          <Calendar
            mode="single"
            locale={ja}
            defaultMonth={toJSTDateOnly(active.start_time)}
            selected={toJSTDateOnly(active.start_time)}
            onSelect={(date) => {
              if (!date) return;
              const entry = candidateByDateKey.get(toCalendarDateKey(date));
              if (!entry) return;
              onChange(entry.id);
              setCalendarOpen(false);
            }}
            disabled={(date) => !candidateByDateKey.has(toCalendarDateKey(date))}
            className="p-0"
          />
        </PopoverContent>
      </Popover>

      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="次の候補日"
        disabled={!next}
        onClick={() => next && onChange(next.id)}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}

export default CandidateDaySwitchActions;
