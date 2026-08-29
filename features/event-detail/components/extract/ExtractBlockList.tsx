'use client';

import { Check, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SLOT_INTERVAL_MS } from '@/lib/constants';
import { formatJSTCandidateDateLabel, formatJSTTime } from '@/lib/datetime';
import { STATUS_META } from '@/features/event-detail/lib/status';
import { usePlans } from '@/features/event-detail/hooks/usePlans';
import { hasOverlappingPlan } from '@/features/event-detail/lib/plans';
import { useCreatePlan } from '@/features/event-detail/hooks/usePlanMutations';
import type { TimeBlock } from '@/features/event-detail/lib/extractSlots';
import { useExtractSlotsContext } from './ExtractSlotsContext';

/** TimeBlock.end は最終コマの開始時刻なので、1コマ分足したものが実際の終了時刻 */
const blockEndMs = (block: TimeBlock) => block.end + SLOT_INTERVAL_MS;

function ExtractBlockList({ eventId }: { eventId: string }) {
  const { extractedBlocks } = useExtractSlotsContext();
  const { data: plans } = usePlans(eventId);
  const createPlan = useCreatePlan(eventId);

  if (extractedBlocks.length === 0) {
    return (
      <div className="text-muted-foreground flex h-72 items-center justify-center px-3 text-center text-sm">
        条件を選んで「抽出する」を押してください
      </div>
    );
  }

  // 保存済みの予定と突き合わせる。時刻が完全一致なら「追加済み」、
  // 一致はしないが重なっている場合は同じ時間に予定が並ぶため追加させない
  const savedTimes = new Set(
    (plans ?? []).map(
      (p) => `${new Date(p.start_time).getTime()}-${new Date(p.end_time).getTime()}`,
    ),
  );
  const isSaved = (block: TimeBlock) => savedTimes.has(`${block.start}-${blockEndMs(block)}`);
  const isOverlapping = (block: TimeBlock) =>
    !isSaved(block) && hasOverlappingPlan(plans ?? [], block.start, blockEndMs(block));

  const handleAdd = async (block: TimeBlock) => {
    try {
      await createPlan.mutateAsync({
        eventId,
        startTime: new Date(block.start).toISOString(),
        endTime: new Date(blockEndMs(block)).toISOString(),
        memo: '',
        // ▲（未定）の人もそのままメンバーに含める。▲ 表示は回答から判定されるため、
        // 後で回答が ok に変われば自動で外れる
        userIds: block.participants.map((p) => p.id),
      });
      toast.success('予定に追加しました', { position: 'top-center' });
    } catch (error) {
      console.error('Failed to create plan from extracted block:', error);
      toast.error('予定の追加に失敗しました', { position: 'top-center' });
    }
  };

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
            {blocks.map((block) => {
              const saved = isSaved(block);
              const overlapping = isOverlapping(block);
              return (
                <div
                  key={`${block.start}-${block.end}`}
                  className="flex items-center justify-between gap-2 px-3 py-2"
                >
                  <div className="min-w-0">
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

                  <Button
                    variant={saved || overlapping ? 'ghost' : 'outline'}
                    size="sm"
                    disabled={saved || overlapping || createPlan.isPending}
                    aria-label={
                      saved
                        ? '追加済み'
                        : overlapping
                          ? '既存の予定と時間が重なっているため追加できません'
                          : 'この時間帯を予定に追加'
                    }
                    onClick={() => handleAdd(block)}
                  >
                    {saved && (
                      <>
                        <Check className="h-4 w-4" />
                        追加済み
                      </>
                    )}
                    {overlapping && <span className="text-xs">時間が重複</span>}
                    {!saved && !overlapping && <Plus className="h-4 w-4" />}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ExtractBlockList;
