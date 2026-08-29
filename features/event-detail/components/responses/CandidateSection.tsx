import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { formatJSTTime, formatJSTCandidateDateLabel, jstWallTimeToISO } from '@/lib/datetime';
import { STATUS_META } from '@/features/event-detail/lib/status';
import { SLOT_INTERVAL_MS } from '@/lib/constants';
import type { TimeBlock } from '@/features/event-detail/lib/extractSlots';
import type { Candidate, Plan, ResponseStatus, User } from '@/features/event-detail/types';
import { candidateAnchorId } from '@/features/event-detail/lib/anchors';
import { PLAN_STRIPE_CLASS } from '@/features/event-detail/lib/plans';
import { responseSlotKey } from '@/features/event-detail/lib/responses';

interface CandidateSectionProps {
  candidate: Candidate;
  users: User[];
  displayedTimes: string[];
  extractedBlocks: TimeBlock[];
  plans: Pick<Plan, 'id' | 'start_time' | 'end_time'>[];
}

type HighlightFlags = { inBlock: boolean; isStart: boolean; isEnd: boolean };

/** 開催予定が重なるスロット。ホバー時に出す時間帯のラベルだけ持つ */
type PlanFlags = { label: string };

export default function CandidateSection({
  candidate,
  users,
  displayedTimes,
  extractedBlocks,
  plans,
}: CandidateSectionProps) {
  const startHHMM = formatJSTTime(candidate.start_time);
  const endHHMM = formatJSTTime(candidate.end_time);
  const dateLabel = formatJSTCandidateDateLabel(candidate.start_time);

  // ユーザーごとの回答を候補日・時刻のキーで引けるよう事前計算
  const userResponseMaps = useMemo(() => {
    const maps = new Map<string, Record<string, ResponseStatus>>();
    for (const user of users) {
      maps.set(
        user.id,
        user.responses.reduce(
          (acc, res) => {
            acc[responseSlotKey(res.candidate_id, formatJSTTime(res.time))] = res.status;
            return acc;
          },
          {} as Record<string, ResponseStatus>,
        ),
      );
    }
    return maps;
  }, [users]);

  // 各時刻スロットが抽出結果ブロックの範囲内かどうかのフラグを事前計算
  // (block.end は最終スロットの開始時刻なので範囲判定は <= でよい)
  const highlightMap = useMemo(() => {
    const map = new Map<string, HighlightFlags>();
    if (extractedBlocks.length === 0) return map;

    const candidateDate = new Date(candidate.start_time);
    for (const time of displayedTimes) {
      const t = new Date(jstWallTimeToISO(candidateDate, time)).getTime();
      const block = extractedBlocks.find((b) => b.start <= t && t <= b.end);
      if (block) {
        map.set(time, { inBlock: true, isStart: t === block.start, isEnd: t === block.end });
      }
    }
    return map;
  }, [extractedBlocks, candidate.start_time, displayedTimes]);

  // 各時刻スロットが開催予定の範囲内かどうかを事前計算
  // （予定の end_time は終了そのものなので、スロットの終わりと比較する）
  const planMap = useMemo(() => {
    const map = new Map<string, PlanFlags>();
    if (plans.length === 0) return map;

    const candidateDate = new Date(candidate.start_time);
    for (const time of displayedTimes) {
      const slotStart = new Date(jstWallTimeToISO(candidateDate, time)).getTime();
      const slotEnd = slotStart + SLOT_INTERVAL_MS;

      const plan = plans.find((p) => {
        const start = new Date(p.start_time).getTime();
        const end = new Date(p.end_time).getTime();
        return start <= slotStart && slotEnd <= end;
      });

      if (plan) {
        map.set(time, {
          label: `${formatJSTTime(plan.start_time)} - ${formatJSTTime(plan.end_time)} の予定`,
        });
      }
    }
    return map;
  }, [plans, candidate.start_time, displayedTimes]);

  return (
    <tbody id={candidateAnchorId(candidate.id)} className="scroll-mt-24">
      <tr>
        <th
          rowSpan={2}
          className="bg-primary/80 text-primary-foreground sticky left-0 z-30 min-w-10 border p-1 text-center text-[10px] sm:min-w-24 sm:p-2 sm:text-xs"
        >
          {dateLabel}
        </th>

        {/* 時間ラベル行 */}
        {displayedTimes.map((time) => {
          const isWholeHour = time.endsWith(':00');
          return (
            <th
              key={time}
              className="border-border bg-muted/30 relative h-5 w-5 border-y sm:h-8 sm:w-6"
            >
              {isWholeHour && (
                <span className="text-muted-foreground absolute top-0 left-2 -translate-x-1/2 text-[8px] font-bold sm:text-[9px]">
                  {time.split(':')[0]}
                </span>
              )}
              <div
                className={`border-border absolute bottom-0 left-0 border-l ${isWholeHour ? 'h-3 sm:h-4' : 'h-2 sm:h-3'}`}
              />
            </th>
          );
        })}
        <th className="border-border border-r" />
      </tr>

      {/* 予定の範囲行。開催予定はここに帯で重ねる */}
      <tr className="h-3 border-b sm:h-5">
        {displayedTimes.map((time) => {
          const isInRange = time >= startHHMM && time < endHHMM;
          const plan = planMap.get(time);
          return (
            <td
              key={time}
              title={plan?.label}
              className={cn(!isInRange && 'bg-muted', plan && PLAN_STRIPE_CLASS)}
            />
          );
        })}
        <td className="border-border border-r" />
      </tr>

      {/* ユーザー行 */}
      {users.map((user, userIndex) => {
        const responseMap = userResponseMaps.get(user.id) ?? {};

        const isFirstRow = userIndex === 0;
        const isLastRow = userIndex === users.length - 1;

        return (
          <tr key={user.id} className="hover:bg-muted/40">
            <td className="bg-muted text-foreground sticky left-0 z-30 h-7 max-w-20 min-w-15 border p-1 text-center font-bold sm:h-9 sm:max-w-30 sm:min-w-24 sm:p-2">
              <div className="truncate text-[11px] sm:text-xs" title={user.name}>
                {user.name}
              </div>
            </td>

            {displayedTimes.map((time) => {
              const status = responseMap[responseSlotKey(candidate.id, time)];
              const meta = status ? STATUS_META[status] : undefined;
              const highlight = highlightMap.get(time);
              const isExtracting = extractedBlocks.length > 0;
              return (
                <td
                  key={time}
                  className={cn(
                    'border-muted bg-muted border-x border-b text-center text-[8px] transition-all sm:text-[10px]',
                    meta?.candidateCellClass,
                    // 抽出中は範囲外のセルをグレーで薄くし、範囲の外周を primary の太枠で囲う
                    isExtracting && !highlight && 'opacity-25',
                    highlight?.isStart && 'border-l-primary border-l-2',
                    highlight?.isEnd && 'border-r-primary border-r-2',
                    highlight && isFirstRow && 'border-t-primary border-t-2',
                    highlight && isLastRow && 'border-b-primary border-b-2',
                  )}
                >
                  {meta?.symbol ?? ''}
                </td>
              );
            })}
            <td className="border-border border-r" />
          </tr>
        );
      })}

      {/* 候補日間スペーサー */}
      <tr className="pointer-events-none h-3 sm:h-6">
        <td colSpan={displayedTimes.length + 2} className="h-4 border-none bg-transparent" />
      </tr>
    </tbody>
  );
}
