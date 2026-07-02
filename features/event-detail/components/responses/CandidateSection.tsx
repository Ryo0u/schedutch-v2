import { cn, jstHHMM, formatJSTDate } from "@/lib/utils";
import type { Candidate, User } from "@/features/event-detail/types";

interface CandidateSectionProps {
  candidate: Candidate;
  users: User[];
  displayedTimes: string[];
}

export default function CandidateSection({ candidate, users, displayedTimes }: CandidateSectionProps) {
  const startHHMM = jstHHMM(candidate.start_time);
  const endHHMM = jstHHMM(candidate.end_time);
  const dateLabel = formatJSTDate(candidate.start_time, {
    month: "short",
    day: "numeric",
    weekday: "short",
  });

  return (
    <tbody id={`candidate-${candidate.id}`} className="scroll-mt-24">
      <tr>
        <th rowSpan={2} className="sticky left-0 z-30 border bg-foreground p-1 sm:p-2 text-[10px] sm:text-xs text-center text-background min-w-10 sm:min-w-24">
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
      {users.map((user) => {
        const responseMap = user.responses.reduce((acc, res) => {
          acc[`${res.candidate_id}-${jstHHMM(res.time)}`] = res.status;
          return acc;
        }, {} as Record<string, string>);

        return (
          <tr key={user.id} className="hover:bg-muted/40">
            <td className="sticky left-0 z-30 border bg-foreground/90 p-1 sm:p-2 text-center text-background font-bold min-w-15 max-w-20 sm:max-w-30 sm:min-w-24 h-7 sm:h-9">
              <div className="text-[11px] sm:text-xs truncate" title={user.name}>
                {user.name}
              </div>
            </td>

            {displayedTimes.map((time) => {
              const status = responseMap[`${candidate.id}-${time}`];
              return (
                <td
                  key={time}
                  className={cn(
                    "border-b border-x border-muted bg-muted text-center text-[8px] sm:text-[10px] transition-all",
                    status === "ok" && "bg-blue-400 text-white",
                    status === "maybe" && "bg-yellow-300 text-yellow-800",
                    status === "ng" && "bg-gray-400 text-gray-600"
                  )}
                >
                  {status === "ok" ? "⚫︎" : status === "maybe" ? "▲" : status === "ng" ? "✖︎" : ""}
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
