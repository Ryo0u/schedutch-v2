import { Control, FieldValues, useFieldArray } from "react-hook-form";
import { useState } from "react";
import { TIME_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { formatJSTCandidateDateLabel } from "@/lib/datetime";
import { STATUS_META } from "@/features/event-detail/lib/status";
import { buildResponseSlotMap } from "@/features/event-detail/lib/responses";
import { useResponseDrag } from "@/features/event-detail/hooks/useResponseDrag";
import StatusToggle from "./StatusToggle";
import type { Candidate, ResponseStatus } from "@/features/event-detail/types";

type FormWithResponses = FieldValues & {
  responses: { candidate_id: string; time: Date; status: string }[];
};

interface ResponsesFieldsProps<T extends FormWithResponses> {
  control: Control<T>;
  data: {
    candidates: Pick<Candidate, "id" | "start_time" | "end_time">[];
  };
}

function ResponsesFields<T extends FormWithResponses>({ control, data }: ResponsesFieldsProps<T>) {
  const { fields, update } = useFieldArray({
    control: control as Control<FormWithResponses>,
    name: "responses",
  });

  const [currentState, setCurrentState] = useState<ResponseStatus>("ok");

  const responseMap = buildResponseSlotMap(fields);
  const { containerHandlers, handleTouchMove, cellHandlers } = useResponseDrag(
    fields,
    update,
    currentState
  );

  return (
    <div className="w-full select-none" {...containerHandlers}>
      <StatusToggle value={currentState} onChange={setCurrentState} />

      <div className="w-full overflow-x-auto pb-5" onTouchMove={handleTouchMove}>
          {data.candidates.map((candidate) => {
            const dateKey = formatJSTCandidateDateLabel(candidate.start_time);

            return (
              <table className="min-w-max" key={candidate.id}>
                <thead>
                  {/* 時間のメモリ */}
                  <tr>
                    <th className="sticky left-0 z-30 border border-border w-18 sm:w-25"></th>
                    {TIME_OPTIONS.map((time) => {
                      const isWholeHour = time.endsWith(":00");
                      return (
                        <th key={time} className="relative h-6 sm:h-8 w-5 sm:w-6 border-y border-border">
                          {isWholeHour && (
                            <span className="absolute top-0 left-2 -translate-x-1/2 text-[8px] sm:text-[10px] font-bold text-muted-foreground">
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
                <tbody>
                  <tr className="h-8">
                    {/* 日付ラベル */}
                    <td className="sticky left-0 z-20 border h-8 sm:h-10 text-[11px] sm:text-sm text-center bg-foreground text-background">
                      {dateKey}
                    </td>

                    {TIME_OPTIONS.map((timeOption) => {
                      const slotInfo = responseMap[`${candidate.id}-${timeOption}`];

                      // 候補日の時間範囲外
                      if (!slotInfo) {
                        return <td key={timeOption} className="bg-muted border-b border-border" />;
                      }

                      const meta = STATUS_META[slotInfo.status as ResponseStatus];

                      return (
                        <td
                          key={timeOption}
                          data-index={slotInfo.index}
                          {...cellHandlers(slotInfo.index)}
                          className={cn(
                            "border-b border-l border text-center transition-all cursor-pointer select-none touch-none",
                            meta?.inputCellClass
                          )}
                        >
                          <span className="text-[10px] pointer-events-none">
                            {meta?.symbol ?? ""}
                          </span>
                        </td>
                      );
                    })}
                    <td className=" border-r border-border"></td>
                  </tr>

                  {/* --- 候補日同士の間隔 -- */}
                  <tr className="h-3 pointer-events-none">
                    <td colSpan={TIME_OPTIONS.length + 1} className="h-4 border-none bg-transparent" />
                  </tr>
                </tbody>
              </table>
            );
          })}
      </div>
    </div>
  )
}

export default ResponsesFields
