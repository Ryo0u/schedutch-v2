import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatJSTTime, formatJSTCandidateDateLabel, jstWallTimeToISO } from "@/lib/datetime";
import { STATUS_META } from "@/features/event-detail/lib/status";
import type { TimeBlock } from "@/features/event-detail/lib/extractSlots";
import type { Candidate, ResponseStatus, User } from "@/features/event-detail/types";
import { candidateAnchorId } from "@/features/event-detail/lib/anchors";
import { responseSlotKey } from "@/features/event-detail/lib/responses";

interface CandidateSectionProps {
  candidate: Candidate;
  users: User[];
  displayedTimes: string[];
  extractedBlocks: TimeBlock[];
}

type HighlightFlags = { inBlock: boolean; isStart: boolean; isEnd: boolean };

export default function CandidateSection({ candidate, users, displayedTimes, extractedBlocks }: CandidateSectionProps) {
  const startHHMM = formatJSTTime(candidate.start_time);
  const endHHMM = formatJSTTime(candidate.end_time);
  const dateLabel = formatJSTCandidateDateLabel(candidate.start_time);

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

  return (
    <tbody id={candidateAnchorId(candidate.id)} className="scroll-mt-24">
      <tr>
        <th rowSpan={2} className="sticky left-0 z-30 border bg-primary/80 p-1 sm:p-2 text-[10px] sm:text-xs text-center text-primary-foreground min-w-10 sm:min-w-24">
          {dateLabel}
        </th>

        {/* 時間ラベル行 */}
        {displayedTimes.map((time) => {
          const isWholeHour = time.endsWith(":00");
          return (
            <th key={time} className="relative h-5 sm:h-8 w-5 sm:w-6 border-y border-border bg-muted/30">
              {isWholeHour && (
                <span className="absolute top-0 left-2 -translate-x-1/2 text-[8px] sm:text-[9px] font-bold text-muted-foreground">
                  {time.split(":")[0]}
                </span>
              )}
              <div className={`absolute bottom-0 left-0 border-l border-border ${isWholeHour ? "h-3 sm:h-4" : "h-2 sm:h-3"}`} />
            </th>
          );
        })}
        <th className="border-r border-border" />
      </tr>

      {/* 予定の範囲行 */}
      <tr className="h-3 sm:h-5 border-b">
        {displayedTimes.map((time) => {
          const isInRange = time >= startHHMM && time < endHHMM;
          return (
            <td key={time} className={cn(!isInRange && "bg-muted")} />
          );
        })}
        <td className="border-r border-border" />
      </tr>

      {/* ユーザー行 */}
      {users.map((user, userIndex) => {
        const responseMap = user.responses.reduce((acc, res) => {
          acc[responseSlotKey(res.candidate_id, formatJSTTime(res.time))] = res.status;
          return acc;
        }, {} as Record<string, ResponseStatus>);

        const isFirstRow = userIndex === 0;
        const isLastRow = userIndex === users.length - 1;

        return (
          <tr key={user.id} className="hover:bg-muted/40">
            <td className="sticky left-0 z-30 border bg-muted p-1 sm:p-2 text-center text-foreground font-bold min-w-15 max-w-20 sm:max-w-30 sm:min-w-24 h-7 sm:h-9">
              <div className="text-[11px] sm:text-xs truncate" title={user.name}>
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
                    "border-b border-x border-muted bg-muted text-center text-[8px] sm:text-[10px] transition-all",
                    meta?.candidateCellClass,
                    // 抽出中は範囲外のセルをグレーで薄くし、範囲の外周を primary の太枠で囲う
                    isExtracting && !highlight && "opacity-25",
                    highlight?.isStart && "border-l-2 border-l-primary",
                    highlight?.isEnd && "border-r-2 border-r-primary",
                    highlight && isFirstRow && "border-t-2 border-t-primary",
                    highlight && isLastRow && "border-b-2 border-b-primary"
                  )}
                >
                  {meta?.symbol ?? ""}
                </td>
              );
            })}
            <td className="border-r border-border" />
          </tr>
        );
      })}

      {/* 候補日間スペーサー */}
      <tr className="h-3 sm:h-6 pointer-events-none">
        <td colSpan={displayedTimes.length + 2} className="h-4 border-none bg-transparent" />
      </tr>
    </tbody>
  );
}
