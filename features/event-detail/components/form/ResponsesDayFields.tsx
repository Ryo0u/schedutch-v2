import { TIME_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { STATUS_META } from '@/features/event-detail/lib/status';
import { responseSlotKey, type ResponseSlotMap } from '@/features/event-detail/lib/responses';
import type { ResponseCellHandlers } from '@/features/event-detail/hooks/useResponseDrag';

interface ResponsesDayFieldsProps {
  candidateId: string;
  responseMap: ResponseSlotMap;
  cellHandlers: ResponseCellHandlers;
  onTouchMove: (e: React.TouchEvent) => void;
}

/**
 * スマホ向けに 1 日分の回答を 30 分 1 行で縦に並べる。
 *
 * 塗るセルは touch-none でなぞり操作に使うため、その上ではフォームを縦スクロールできない。
 * 左の時刻ラベル列と右の余白はタッチ操作を奪わず、スクロール用の領域として残す。
 */
function ResponsesDayFields({
  candidateId,
  responseMap,
  cellHandlers,
  onTouchMove,
}: ResponsesDayFieldsProps) {
  return (
    <div className="space-y-1 pr-8" onTouchMove={onTouchMove}>
      {TIME_OPTIONS.map((time) => {
        const slotInfo = responseMap[responseSlotKey(candidateId, time)];
        // 候補日の時間範囲外は描画しない
        if (!slotInfo) return null;

        const meta = STATUS_META[slotInfo.status];
        const isWholeHour = time.endsWith(':00');

        return (
          <div key={time} className="flex h-10 gap-3">
            <div
              className={cn(
                'text-muted-foreground flex w-14 shrink-0 items-center justify-center text-xs',
                isWholeHour && 'text-foreground font-bold',
              )}
            >
              {time}
            </div>
            <div
              data-index={slotInfo.index}
              {...cellHandlers(slotInfo.index)}
              className={cn(
                'flex flex-1 cursor-pointer touch-none items-center justify-center gap-1.5 rounded-md text-sm transition-all select-none',
                meta.inputCellClass,
              )}
            >
              <span className="pointer-events-none">{meta.symbol}</span>
              <span className="pointer-events-none text-xs">{meta.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ResponsesDayFields;
