'use client';

import { SLOT_INTERVAL_MS } from '@/lib/constants';
import { formatJSTCandidateDateLabel, formatJSTTime } from '@/lib/datetime';
import { STATUS_META } from '@/features/event-detail/lib/status';
import type { TimeBlock } from '@/features/event-detail/lib/extractSlots';
import { useExtractSlotsContext } from './ExtractSlotsContext';

/** TimeBlock.end は最終コマの開始時刻なので、1コマ分足したものが実際の終了時刻 */
const blockEndMs = (block: TimeBlock) => block.end + SLOT_INTERVAL_MS;

function ExtractBlockList() {
  const { extractedBlocks } = useExtractSlotsContext();

  if (extractedBlocks.length === 0) {
    return (
      <div className="text-muted-foreground flex h-72 items-center justify-center px-3 text-center text-sm">
        条件を選んで「抽出する」を押してください
      </div>
    );
  }

  // 日付ごとにグループ化して並べる
  const grouped = extractedBlocks.reduce(
    (acc, block) => {
      const key = formatJSTCandidateDateLabel(block.start);
      (acc[key] ??= []).push(block);
      return acc;
    },
    {} as Record<string, TimeBlock[]>,
  );

  return (
    <div className="h-72 overflow-y-auto">
      {Object.entries(grouped).map(([date, blocks]) => (
        <div key={date} className="mb-3">
          <p className="text-muted-foreground bg-muted/50 px-3 py-1 text-xs font-medium">{date}</p>
          <div className="divide-border divide-y">
            {blocks.map((block) => (
              <div key={`${block.start}-${block.end}`} className="px-3 py-2">
                <p className="text-sm font-bold whitespace-nowrap">
                  {formatJSTTime(block.start)} - {formatJSTTime(blockEndMs(block))}
                </p>
                <p className="text-muted-foreground text-xs wrap-break-word">
                  {block.participants
                    .map((p) =>
                      p.status === 'maybe' ? `${p.name}(${STATUS_META.maybe.symbol})` : p.name,
                    )
                    .join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ExtractBlockList;
