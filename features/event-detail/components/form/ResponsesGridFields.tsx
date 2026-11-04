import { TIME_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { formatJSTCandidateDateLabel } from '@/lib/datetime';
import { STATUS_META } from '@/features/event-detail/lib/status';
import { responseSlotKey, type ResponseSlotMap } from '@/features/event-detail/lib/responses';
import type { ResponseCellHandlers } from '@/features/event-detail/hooks/useResponseDrag';
import type { Candidate } from '@/features/event-detail/types';

interface ResponsesGridFieldsProps {
  candidates: Pick<Candidate, 'id' | 'start_time'>[];
  responseMap: ResponseSlotMap;
  cellHandlers: ResponseCellHandlers;
  onTouchMove: (e: React.TouchEvent) => void;
}

/** PC・タブレット向けの回答グリッド。全候補日を横 1 行ずつ並べて見渡せるようにする */
function ResponsesGridFields({
  candidates,
  responseMap,
  cellHandlers,
  onTouchMove,
}: ResponsesGridFieldsProps) {
  return (
    <div className="w-full overflow-x-auto pb-5" onTouchMove={onTouchMove}>
      {candidates.map((candidate) => {
        const dateKey = formatJSTCandidateDateLabel(candidate.start_time);

        return (
          <table className="min-w-max" key={candidate.id}>
            <thead>
              {/* 時間のメモリ */}
              <tr>
                <th className="border-border sticky left-0 z-30 w-18 border sm:w-25"></th>
                {TIME_OPTIONS.map((time) => {
                  const isWholeHour = time.endsWith(':00');
                  return (
                    <th
                      key={time}
                      className="border-border relative h-6 w-5 border-y sm:h-8 sm:w-6"
                    >
                      {isWholeHour && (
                        <span className="text-muted-foreground absolute top-0 left-2 -translate-x-1/2 text-[8px] font-bold sm:text-[10px]">
                          {time.split(':')[0]}
                        </span>
                      )}
                      {/* 目盛りの線 */}
                      <div
                        className={`border-border absolute bottom-0 left-0 border-l ${isWholeHour ? 'h-4' : 'h-3'}`}
                      />
                    </th>
                  );
                })}
                <th className="border-border border-r"></th>
              </tr>
            </thead>
            <tbody>
              <tr className="h-8">
                {/* 日付ラベル */}
                <td className="bg-primary/80 text-primary-foreground sticky left-0 z-20 h-8 border text-center text-[11px] sm:h-10 sm:text-sm">
                  {dateKey}
                </td>

                {TIME_OPTIONS.map((timeOption) => {
                  const slotInfo = responseMap[responseSlotKey(candidate.id, timeOption)];

                  // 候補日の時間範囲外
                  if (!slotInfo) {
                    return <td key={timeOption} className="bg-muted border-border border-b" />;
                  }

                  const meta = STATUS_META[slotInfo.status];

                  return (
                    <td
                      key={timeOption}
                      data-index={slotInfo.index}
                      {...cellHandlers(slotInfo.index)}
                      className={cn(
                        'cursor-pointer touch-none border border-b border-l text-center transition-all select-none',
                        meta?.inputCellClass,
                      )}
                    >
                      <span className="pointer-events-none text-[10px]">{meta?.symbol ?? ''}</span>
                    </td>
                  );
                })}
                <td className="border-border border-r"></td>
              </tr>

              {/* --- 候補日同士の間隔 -- */}
              <tr className="pointer-events-none h-3">
                <td colSpan={TIME_OPTIONS.length + 1} className="h-4 border-none bg-transparent" />
              </tr>
            </tbody>
          </table>
        );
      })}
    </div>
  );
}

export default ResponsesGridFields;
