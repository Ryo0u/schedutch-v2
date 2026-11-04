import { TIME_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { formatJSTCandidateDateLabel } from '@/lib/datetime';
import { STATUS_META } from '@/features/event-detail/lib/status';
import { responseSlotKey, type ResponseSlotMap } from '@/features/event-detail/lib/responses';
import type { Candidate } from '@/features/event-detail/types';

interface ResponsesOverviewListProps {
  candidates: Pick<Candidate, 'id' | 'start_time'>[];
  responseMap: ResponseSlotMap;
  onSelectCandidate: (candidateId: string) => void;
}

/**
 * スマホで全候補日の回答を読み取り専用の縮小グリッドで並べる（1 日ずつの入力の途中で全日を見渡すために使う）。
 * 行をタップするとその日の入力に移る。
 */
function ResponsesOverviewList({
  candidates,
  responseMap,
  onSelectCandidate,
}: ResponsesOverviewListProps) {
  // 列は全候補日の範囲を合わせた区間にし、日をまたいで同じ時刻を縦に揃える
  const hasSlotAt = (time: string) =>
    candidates.some((candidate) => responseMap[responseSlotKey(candidate.id, time)]);
  const firstIndex = TIME_OPTIONS.findIndex(hasSlotAt);
  const lastIndex = TIME_OPTIONS.findLastIndex(hasSlotAt);
  const times = firstIndex === -1 ? [] : TIME_OPTIONS.slice(firstIndex, lastIndex + 1);

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-xs">日付をタップすると、その日の入力に移ります。</p>

      {/* 時刻の目盛り */}
      <div className="flex items-end">
        <div className="w-20 shrink-0" />
        <div className="flex flex-1">
          {times.map((time) => (
            <div key={time} className="text-muted-foreground relative h-4 flex-1 text-[9px]">
              {time.endsWith(':00') && (
                <span className="absolute left-0 -translate-x-1/2">{time.split(':')[0]}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {candidates.map((candidate) => (
        <button
          key={candidate.id}
          type="button"
          onClick={() => onSelectCandidate(candidate.id)}
          className="hover:bg-muted flex w-full items-center rounded-sm text-left"
        >
          <span className="w-20 shrink-0 text-xs font-bold">
            {formatJSTCandidateDateLabel(candidate.start_time)}
          </span>
          <span className="border-border flex h-6 flex-1 overflow-hidden rounded-sm border">
            {times.map((time) => {
              const slotInfo = responseMap[responseSlotKey(candidate.id, time)];
              return (
                <span
                  key={time}
                  className={cn(
                    'flex-1',
                    slotInfo ? STATUS_META[slotInfo.status].inputCellClass : 'bg-muted',
                  )}
                />
              );
            })}
          </span>
        </button>
      ))}
    </div>
  );
}

export default ResponsesOverviewList;
