import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { TIME_OPTIONS } from "@/lib/constants";
import { cn, jstHHMM, formatJSTDate } from "@/lib/utils";
import type { Candidate, User } from "@/lib/types";

interface ResponsesInfoProps {
  data: {
    candidates: Pick<Candidate, "id" | "start_time" | "end_time">[];
    users: Pick<User, "id" | "name" | "responses">[];
  };
}

function ResponsesInfo({ data }: ResponsesInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-black">
          予定一覧
        </CardTitle>
      </CardHeader>
      
      <Separator/>
      
      <CardContent>
        <div className="w-full overflow-x-auto">
          <table className="min-w-max">
            {data.candidates.map((candidate) => {
              const startHHMM = jstHHMM(candidate.start_time);
              const endHHMM = jstHHMM(candidate.end_time);
              const dateKey = formatJSTDate(candidate.start_time, {
                month: "short",
                day: "numeric",
                weekday: "short",
              });

              return (
                <tbody key={candidate.id} className="">
                  <tr>
                    <th rowSpan={2} className="sticky left-0 z-30 border bg-foreground p-1 sm:p-2 text-[10px] sm:text-xs text-center text-background min-w-10 sm:min-w-24">
                      {dateKey}
                    </th>

                    {/* --- 1行目：時間のラベル --- */}
                    {TIME_OPTIONS.map((time) => {
                      const isWholeHour = time.endsWith(":00");

                      return (
                        <th key={time} className="relative h-5 sm:h-8 w-5 sm:w-6 border-y border-border bg-muted/30">
                          {isWholeHour && (
                            <span className="absolute top-0 left-2 -translate-x-1/2 text-[8px] sm:text-[9px] font-bold text-muted-foreground">
                              {time.split(":")[0]}
                            </span>
                          )}
                          <div className={`absolute bottom-0 left-0 border-l border-border ${isWholeHour ? 'h-3 sm:h-4' : 'h-2 sm:h-3'}`} />
                        </th>
                      );
                    })}

                    {/* 一番右の枠線 */}
                    <th className=" border-r border-border"></th>
                  </tr>

                  {/* --- 2行目：予定の範囲 --- */}
                  <tr className="h-3 sm:h-5 border-b">
                    {TIME_OPTIONS.map((time) => {
                      // JST の "HH:MM" 文字列比較で範囲判定（ブラウザTZ非依存）
                      const isInRange = time >= startHHMM && time < endHHMM;

                      return (
                        <td
                          key={time}
                          className={cn(isInRange ? "" : "bg-muted")}
                        />
                      );
                    })}

                     {/* 一番右の枠線 */}
                    <td className=" border-r border-border"></td>
                  </tr>
                  
                  {/* 3行目〜：ユーザー毎の予定一覧 */}
                  {data.users.map((user) => {
                    const userResponseMap = user.responses.reduce((acc, res) => {
                      acc[`${res.candidate_id}-${jstHHMM(res.time)}`] = res.status;
                      return acc;
                    }, {} as Record<string, string>);
                    
                    return (
                      <tr key={user.id}className="hover:bg-muted/40">
                        <td className="sticky left-0 z-30 border bg-foreground/90 p-1 sm:p-2 text-center text-background font-bold min-w-15 max-w-20 sm:max-w-30 sm:min-w-24 h-7 sm:h-9">
                          <div className="text-[11px] sm:text-xs truncate" title={user.name}>
                            {user.name}
                          </div>
                        </td>
                        
                        {/* 各時間の回答セル */}
                        {TIME_OPTIONS.map((time) => {
                          const status = userResponseMap[`${candidate.id}-${time}`];

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
                        {/* 右端の調整用セル */}
                        <td className="border-r border-border"></td>
                      </tr>
                    )
                  })}
                  
                  {/* --- 最終行目：候補日同士の間隔 -- */}
                  <tr className="h-3 sm:h-6 pointer-events-none">
                    <td colSpan={TIME_OPTIONS.length + 1} className="h-4 border-none bg-transparent" />
                  </tr>
                </tbody>
              );
            })}
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

export default ResponsesInfo