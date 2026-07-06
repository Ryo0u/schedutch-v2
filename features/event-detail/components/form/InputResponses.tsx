import { Control, FieldValues, useFieldArray } from "react-hook-form";
import { TIME_OPTIONS } from "@/lib/constants";
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { jstHHMM, formatJSTDate } from "@/lib/datetime";
import { RESPONSE_STATUSES, STATUS_META } from "@/features/event-detail/lib/status";
import type { Candidate, ResponseStatus } from "@/features/event-detail/types";

type SlotInfo = {
  id: string;
  candidate_id: string;
  time: Date;
  status: string;
  index: number;
};

type FormWithResponses = FieldValues & {
  responses: { candidate_id: string; time: Date; status: string }[];
};

interface InputResponsesProps<T extends FormWithResponses> {
  control: Control<T>;
  data: {
    candidates: Pick<Candidate, "id" | "start_time" | "end_time">[];
  };
}

function InputResponses<T extends FormWithResponses>({ control, data }: InputResponsesProps<T>) {
  const { fields, update } = useFieldArray({
    control: control as Control<FormWithResponses>,
    name: "responses",
  });
  
  const [ currentState, setCurrentState ] = useState<ResponseStatus>("ok");
  const isSelected = (value: string) => currentState === value;
  
  const [ isDragging, setIsDragging ] = useState(false);
  
  const responseMap = fields.reduce((acc, field, index) => {
    const hhmm = jstHHMM(field.time);
    acc[`${field.candidate_id}-${hhmm}`] = { ...field, index };
    return acc;
  }, {} as Record<string, SlotInfo>);

  // PCでの回答更新ハンドラ
  const handleSlotUpdate = (slotInfo: SlotInfo) => {
    update(slotInfo.index, {
      ...fields[slotInfo.index],
      status: currentState,
      candidate_id: slotInfo.candidate_id,
      time: slotInfo.time,
    });
  };
  
  // スマホでの回答更新ハンドラ
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    if (!touch) return;
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;

    const tdElement = element.closest("[data-index]");
    if (tdElement) {
      const index = Number(tdElement.getAttribute("data-index"));
      const slotField = fields[index];

      if (slotField) {
        update(index, {
          ...slotField,
          status: currentState,
          candidate_id: slotField.candidate_id,
          time: slotField.time,
        });
      }
    }
  };
  
  return (
    <div className="w-full select-none"
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onTouchEnd={() => setIsDragging(false)}
      onTouchCancel={() => setIsDragging(false)}
    >
      <div className="sticky right-0 top-0 z-40 mb-2 flex justify-end">
        <ToggleGroup size="sm" spacing={2} variant="outline">
          {RESPONSE_STATUSES.map((status) => {
            const meta = STATUS_META[status];
            return (
              <ToggleGroupItem
                key={status}
                value={status}
                onClick={() => setCurrentState(status)}
                className={cn("bg-background", isSelected(status) && meta.toggleActiveClass)}
              >
                <span className="sm:hidden">{meta.symbol}</span>
                <span className="hidden sm:inline">{meta.label}（{meta.symbol}）</span>
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </div>
      
      <div className="w-full overflow-x-auto pb-5" onTouchMove={handleTouchMove}>
          {data.candidates.map((candidate) => {
            const dateKey = formatJSTDate(candidate.start_time, {
              month: "short",
              day: "numeric",
              weekday: "short",
            });

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
                          // マウスでのスロット開始&更新
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                            handleSlotUpdate(slotInfo);
                          }}
                          // マウスでのドラッグ状態中の更新
                          onMouseEnter={() => {
                            if (isDragging) {
                              handleSlotUpdate(slotInfo)
                            }
                          }}
                          // スマホ用のイベント
                          onTouchStart={() => {
                            setIsDragging(true);
                            handleSlotUpdate(slotInfo);
                          }}
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

export default InputResponses