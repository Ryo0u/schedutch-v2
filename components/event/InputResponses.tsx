import { Control, useFieldArray } from "react-hook-form";
import { UserFormData } from "./ResponsesForm";
import { TIME_OPTIONS } from "@/lib/constants";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";

interface InputResponsesProps {
  control: Control<UserFormData>;
  data: {
    candidates: {
    id: string
    start_time: Timestamp
    end_time: Timestamp
  }[]
  };
}

function InputResponses({ control, data } :InputResponsesProps) {
  const { fields, update } = useFieldArray({
    control,
    name: "responses"
  });
  
  const responseMap = fields.reduce((acc, field, index) => {
    const d = new Date(field.time);
    const hhmm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    acc[`${field.candidate_id}-${hhmm}`] = { ...field, index };
    return acc;
  }, {} as Record<string, any>);
  
  return (
    <div className="w-full overflow-x-auto select-none">
      <table className="border-separate border-spacing-0 mx-auto">
        <thead>
          {/* 時間のメモリ */}
          <tr>
            <th className="sticky left-0 z-30 border border-border w-40"></th>
            {TIME_OPTIONS.map((time) => {
              const isWholeHour = time.endsWith(":00");
              return (
                <th key={time} className="relative h-8 w-6 sm:w-8 border-y border-border">
                  {isWholeHour && (
                    <span className="absolute -top-0.5 left-2 -translate-x-1/2 text-[10px] font-bold text-muted-foreground">
                      {time.split(":")[0]}
                    </span>
                  )}
                  {/* 目盛りの線 */}
                  <div className={`absolute bottom-0 left-0 border-l border-border ${isWholeHour ? 'h-4' : 'h-3'}`} />
                </th>
              );
            })}
            <th className=" border-r border-border"></th>
          </tr>
        </thead>
        
        {data.candidates.map((candidate) => {
          const dateKey = new Date(candidate.start_time).toLocaleDateString('ja-JP', { 
            month: 'short', day: 'numeric', weekday: 'short' 
          });

          return (
            <tbody key={candidate.id}>
              <tr className="h-10">
                {/* 日付ラベル */}
                <td className="sticky left-0 z-20 border px-2 text-center">
                  {dateKey}
                </td>

                {TIME_OPTIONS.map((timeOption) => {
                  const slotInfo = responseMap[`${candidate.id}-${timeOption}`];

                  // 候補日の時間範囲外
                  if (!slotInfo) {
                    return <td key={timeOption} className="bg-muted/30 border-b border-border" />;
                  }

                  return (
                    <td
                      key={timeOption}
                      onClick={() => {
                        update(slotInfo.index, {
                          ...fields[slotInfo.index],
                          status: "ng",
                          candidate_id: slotInfo.candidate_id as string,
                          time: slotInfo.time as Date,
                        });
                      }}
                      className={`
                        border-b border-l border-border text-center transition-all
                        ${slotInfo?.status === "ok" ? "bg-blue-400 text-white" : ""}
                        ${slotInfo?.status === "maybe" ? "bg-yellow-300 text-yellow-800" : ""}
                        ${slotInfo?.status === "ng" ? "bg-gray-400 text-gray-600" : ""}
                      `}
                    >
                      <span className="text-[10px] pointer-events-none">
                        {slotInfo?.status === "ok" ? "⚫︎" : slotInfo?.status === "maybe" ? "▲" : slotInfo?.status === "ng" ? "×" : ""}
                      </span>
                    </td>
                  );
                })}
                <td className=" border-r border-border"></td>
              </tr>
            </tbody>
          );
        })}
      </table>
    </div>
  )
}

export default InputResponses