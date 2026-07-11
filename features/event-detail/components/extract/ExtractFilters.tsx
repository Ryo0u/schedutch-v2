import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, Plus } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const DURATION_OPTIONS = [
  { label: "制限なし", value: "0" },
  { label: "1時間以上", value: "60" },
  { label: "2時間以上", value: "120" },
  { label: "3時間以上", value: "180" },
];

interface ExtractFiltersProps {
  includeMaybe: boolean;
  onIncludeMaybeChange: (value: boolean) => void;
  isDurationEnabled: boolean;
  onIsDurationEnabledChange: (value: boolean) => void;
  minDuration: number;
  onMinDurationChange: (value: number) => void;
  isDateRangeEnabled: boolean;
  onIsDateRangeEnabledChange: (value: boolean) => void;
  dateRange: [string, string];
  onStartDateChange: (value: string | null) => void;
  onEndDateChange: (value: string | null) => void;
  availableDates: string[];
}

function ExtractFilters({
  includeMaybe,
  onIncludeMaybeChange,
  isDurationEnabled,
  onIsDurationEnabledChange,
  minDuration,
  onMinDurationChange,
  isDateRangeEnabled,
  onIsDateRangeEnabledChange,
  dateRange,
  onStartDateChange,
  onEndDateChange,
  availableDates,
}: ExtractFiltersProps) {
  return (
    <Collapsible className="rounded-md data-open:bg-muted">
      <CollapsibleTrigger
        render={
          <Button variant="ghost" className="w-full">
            <Plus/>条件を追加<ChevronDownIcon className="ml-auto group-data-panel-open/button:rotate-180" />
          </Button>
        }
      />
      <CollapsibleContent className="p-2">
          <FieldGroup>
            <Field orientation="horizontal" className="justify-start gap-2">
              <Checkbox
                id="include-maybe"
                checked={includeMaybe}
                onCheckedChange={(checked) => onIncludeMaybeChange(!!checked)}
              />
              <FieldLabel htmlFor="include-maybe" className="text-sm cursor-pointer">
                ▲（未定）も予定に含める
              </FieldLabel>
            </Field>

            <Field orientation="horizontal">
              <Checkbox
                id="select-min-duration"
                checked={isDurationEnabled}
                onCheckedChange={(checked) => onIsDurationEnabledChange(!!checked)}
              />
              <FieldLabel htmlFor="select-min-duration" className="text-sm cursor-pointer">
                時間を指定
              </FieldLabel>
              <Select
                disabled={!isDurationEnabled}
                value={minDuration.toString()}
                onValueChange={(val) => onMinDurationChange(Number(val))}
              >
                <SelectTrigger className={cn("w-25.5 sm:w-32 h-8 text-[10px] sm:text-xs transition-opacity", !isDurationEnabled && "opacity-50")}>
                  <SelectValue placeholder="時間を選択" />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field orientation="horizontal">
              <Checkbox
                id="date-range"
                checked={isDateRangeEnabled}
                onCheckedChange={(checked) => onIsDateRangeEnabledChange(!!checked)}
              />
              <FieldLabel htmlFor="date-range" className="text-sm cursor-pointer">
                日付範囲を指定
              </FieldLabel>

              <Select
                disabled={!isDateRangeEnabled}
                value={dateRange[0]}
                onValueChange={onStartDateChange}
              >
                <SelectTrigger className="w-25.5 sm:w-32 h-8 text-[10px] sm:text-xs">
                  <SelectValue placeholder="開始日" />
                </SelectTrigger>
                <SelectContent>
                  {availableDates.map(date => (
                    <SelectItem key={date} value={date}>{date.replace(/-/g, '/')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">〜</span>

              <Select
                disabled={!isDateRangeEnabled}
                value={dateRange[1]}
                onValueChange={onEndDateChange}
              >
                <SelectTrigger className="w-25.5 sm:w-32 h-8 text-[10px] sm:text-xs">
                  <SelectValue placeholder="終了日" />
                </SelectTrigger>
                <SelectContent>
                  {availableDates.map(date => (
                    <SelectItem key={date} value={date}>{date.replace(/-/g, '/')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default ExtractFilters;
