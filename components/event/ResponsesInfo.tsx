import { Timestamp } from "next/dist/server/lib/cache-handlers/types"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { TIME_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ResponsesInfoProps {
  data: {
    candidates: {
      id: string;
      start_time: Timestamp;
      end_time: Timestamp;
    }[];
    users: {
      id: string;
      name: string;
      responses: {
        user_id: string;
        candidate_id: string;
        time: Date;
        status: string; 
      }[];
    }[];
  }
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
              // 日本の時差分（9時間 = 540分）をミリ秒で引いて日本時間に戻す
              const JST_OFFSET = 9 * 60 * 60 * 1000;
              const start = new Date(new Date(candidate.start_time).getTime() - JST_OFFSET);
              const end = new Date(new Date(candidate.end_time).getTime() - JST_OFFSET);

              const dateKey = start.toLocaleDateString('ja-JP', { 
                month: 'short', day: 'numeric', weekday: 'short' 
              });

              return (
                <tbody key={candidate.id} className="">
                  <tr>
                    <th rowSpan={2} className="sticky left-0 z-30 border bg-foreground p-2 text-xs text-background min-w-24">
                      {dateKey}
                    </th>
                    
                    {/* --- 1行目：時間のラベル --- */}
                    {TIME_OPTIONS.map((time) => {
                      const isWholeHour = time.endsWith(":00");
                      
                      return (
                        <th key={time} className="relative h-8 w-6 border-y border-border bg-muted/30">
                          {isWholeHour && (
                            <span className="absolute top-0 left-2 -translate-x-1/2 text-[9px] font-bold text-muted-foreground">
                              {time.split(":")[0]}
                            </span>
                          )}
                          <div className={`absolute bottom-0 left-0 border-l border-border ${isWholeHour ? 'h-4' : 'h-3'}`} />
                        </th>
                      );
                    })}
                    
                    {/* 一番右の枠線 */}
                    <th className=" border-r border-border"></th>
                  </tr>

                  {/* --- 2行目：予定の範囲 --- */}
                  <tr className="h-5 border-b">
                    {TIME_OPTIONS.map((time) => {
                      const [hours, minutes] = time.split(":").map(Number);
                      const cellTime = new Date(start);
                      cellTime.setHours(hours!, minutes, 0, 0);

                      const isInRange = cellTime >= start && cellTime < end;

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
                      const d = new Date(res.time);
                      const hhmm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
                      acc[`${res.candidate_id}-${hhmm}`] = res.status;
                      return acc;
                    }, {} as Record<string, string>);
                    
                    return (
                      <tr key={user.id}className="hover:bg-muted/40">
                        <td className="sticky left-0 z-30 border bg-foreground/90 p-2 text-center text-background font-bold min-w-24">
                          {user.name}
                        </td>
                        
                        {/* 各時間の回答セル */}
                        {TIME_OPTIONS.map((time) => {
                          const status = userResponseMap[`${candidate.id}-${time}`];

                          return (
                            <td
                              key={time}
                              className={cn(
                                "border-b border-x border-muted bg-muted text-center text-[10px] transition-all",
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
                  <tr className="h-6 pointer-events-none">
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