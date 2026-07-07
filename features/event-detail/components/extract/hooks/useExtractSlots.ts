import { useMemo, useState } from "react";
import type { Candidate, User } from "@/features/event-detail/types";
import { extractSlots, type FilterCondition, type TimeBlock } from "@/features/event-detail/lib/extractSlots";

export type ExtractTab = "people" | "number";

interface UseExtractSlotsArgs {
  candidates: Pick<Candidate, "id" | "start_time">[];
  users: Pick<User, "id" | "name" | "responses">[];
}

export function useExtractSlots({ candidates, users }: UseExtractSlotsArgs) {
  // 条件のフラグ管理
  const [activeTab, setActiveTab] = useState<ExtractTab>("people");
  const [includeMaybe, setIncludeMaybe] = useState(false);
  const [isDurationEnabled, setIsDurationEnabled] = useState(false);
  const [isDateRangeEnabled, setIsDateRangeEnabled] = useState(false);

  // 条件の値を管理
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [selectedHeadcounts, setSelectedHeadcounts] = useState<Set<number>>(new Set());
  const [minDuration, setMinDuration] = useState(0);
  const [dateRange, setDateRange] = useState<[string, string]>(["", ""]);

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [extractedBlocks, setExtractedBlocks] = useState<TimeBlock[]>([]);

  // 抽出結果を予定一覧の表にハイライト表示するかどうか
  const [isHighlightEnabled, setIsHighlightEnabled] = useState(true);

  const availableDates = useMemo(() => {
    // JST の "YYYY-MM-DD" で一意な日付リストを作成（ブラウザTZ非依存）
    const dates = candidates.map(c =>
      new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(
        new Date(c.start_time)
      )
    );
    return Array.from(new Set(dates)).sort();
  }, [candidates]);

  const handleTabChange = (value: ExtractTab) => {
    setActiveTab(value);
    setAvailableSlots([]);
    setExtractedBlocks([]);

    if (value === "people") {
      setSelectedHeadcounts(new Set());
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const toggleUserId = (userId: string) => {
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const toggleHeadcount = (count: number) => {
    setSelectedHeadcounts(prev => {
      const next = new Set(prev);
      if (next.has(count)) {
        next.delete(count);
      } else {
        next.add(count);
      }
      return next;
    });
  };

  const handleStartDateChange = (value: string | null) => {
    if (!value) return;
    if (dateRange[1] && value > dateRange[1]) {
      setDateRange([value, value]);
    } else {
      setDateRange([value, dateRange[1]]);
    }
  };

  const handleEndDateChange = (value: string | null) => {
    if (!value) return;
    if (dateRange[0] && value < dateRange[0]) {
      setDateRange([value, value]);
    } else {
      setDateRange([dateRange[0], value]);
    }
  };

  const handleReset = () => {
    setSelectedUserIds(new Set());
    setSelectedHeadcounts(new Set());
    setAvailableSlots([]);
    setExtractedBlocks([]);
    setIncludeMaybe(false);
    setIsDurationEnabled(false);
    setMinDuration(0);
    setIsDateRangeEnabled(false);
    setDateRange(["", ""]);
  };

  const handleExtractSlots = () => {
    // 条件リストの作成
    const conditions: FilterCondition[] = [];
    if (activeTab === "people") {
      conditions.push({ type: 'PARTICIPANTS', userIds: Array.from(selectedUserIds) });
    } else {
      conditions.push({ type: 'HEADCOUNTS', counts: Array.from(selectedHeadcounts) });
    }

    if (isDurationEnabled) {
      conditions.push({ type: 'DURATION', minMinutes: minDuration });
    }

    if (isDateRangeEnabled) {
      const fallbackStart = availableDates[0] ?? "1970-01-01";
      const startDate = dateRange[0] || fallbackStart;
      // JST 0時 → UTC = "YYYY-MM-DDT00:00:00+09:00"
      const start = new Date(`${startDate}T00:00:00+09:00`).getTime();

      const fallbackEnd = availableDates[availableDates.length - 1] ?? "9999-12-31";
      const endDate = dateRange[1] || fallbackEnd;
      // JST 23:59:59.999 → UTC
      const end = new Date(`${endDate}T23:59:59.999+09:00`).getTime();

      conditions.push({ type: 'DATERANGE', start, end });
    }

    const { blocks, formatted } = extractSlots({
      users,
      includeMaybe,
      conditions,
      participantsFilter: (u) => (activeTab === "people" ? selectedUserIds.has(u.id) : true),
    });

    setAvailableSlots(formatted);
    setExtractedBlocks(blocks);
  };

  return {
    // UI状態
    activeTab,
    includeMaybe,
    isDurationEnabled,
    isDateRangeEnabled,
    selectedUserIds,
    selectedHeadcounts,
    minDuration,
    dateRange,
    availableDates,
    // セッター/ハンドラ
    setIncludeMaybe,
    setIsDurationEnabled,
    setMinDuration,
    setIsDateRangeEnabled,
    handleStartDateChange,
    handleEndDateChange,
    toggleUserId,
    toggleHeadcount,
    handleTabChange,
    handleReset,
    handleExtractSlots,
    // 結果
    availableSlots,
    extractedBlocks,
    // 表へのハイライト表示
    isHighlightEnabled,
    setIsHighlightEnabled,
  };
}
