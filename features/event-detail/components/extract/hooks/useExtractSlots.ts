import { useMemo, useState } from 'react';
import type { Candidate, User } from '@/features/event-detail/types';
import {
  extractSlots,
  type FilterCondition,
  type TimeBlock,
} from '@/features/event-detail/lib/extractSlots';
import {
  toJSTDateString,
  jstDateStringToStartOfDayMs,
  jstDateStringToEndOfDayMs,
} from '@/lib/datetime';

export type ExtractTab = 'people' | 'number';

interface UseExtractSlotsArgs {
  candidates: Pick<Candidate, 'id' | 'start_time'>[];
  users: Pick<User, 'id' | 'name' | 'responses'>[];
}

export function useExtractSlots({ candidates, users }: UseExtractSlotsArgs) {
  // 条件のフラグ管理
  const [activeTab, setActiveTab] = useState<ExtractTab>('people');
  const [includeMaybe, setIncludeMaybe] = useState(false);
  const [isDurationEnabled, setIsDurationEnabled] = useState(false);
  const [isDateRangeEnabled, setIsDateRangeEnabled] = useState(false);

  // 条件の値を管理
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [selectedHeadcounts, setSelectedHeadcounts] = useState<Set<number>>(new Set());
  const [minDuration, setMinDuration] = useState(0);
  const [dateRange, setDateRange] = useState<[string, string]>(['', '']);

  const [extractedBlocks, setExtractedBlocks] = useState<TimeBlock[]>([]);

  // 抽出結果を予定一覧の表にハイライト表示するかどうか
  const [isHighlightEnabled, setIsHighlightEnabled] = useState(true);

  const availableDates = useMemo(() => {
    // JST の "YYYY-MM-DD" で一意な日付リストを作成（ブラウザTZ非依存）
    const dates = candidates.map((c) => toJSTDateString(c.start_time));
    return Array.from(new Set(dates)).sort();
  }, [candidates]);

  // 回答の追加・編集でcandidates/usersが更新されたら、古い抽出結果を破棄する
  // （レンダー中に前回値と比較して更新する。Reactの推奨パターンでeffectは使わない）
  const [prevCandidates, setPrevCandidates] = useState(candidates);
  const [prevUsers, setPrevUsers] = useState(users);
  if (candidates !== prevCandidates || users !== prevUsers) {
    setPrevCandidates(candidates);
    setPrevUsers(users);
    setExtractedBlocks([]);
  }

  const handleTabChange = (value: ExtractTab) => {
    setActiveTab(value);
    setExtractedBlocks([]);

    if (value === 'people') {
      setSelectedHeadcounts(new Set());
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const toggleUserId = (userId: string) => {
    setSelectedUserIds((prev) => {
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
    setSelectedHeadcounts((prev) => {
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
    setActiveTab('people');
    setSelectedUserIds(new Set());
    setSelectedHeadcounts(new Set());
    setExtractedBlocks([]);
    setIncludeMaybe(false);
    setIsDurationEnabled(false);
    setMinDuration(0);
    setIsDateRangeEnabled(false);
    setDateRange(['', '']);
    setIsHighlightEnabled(true);
  };

  const handleExtractSlots = () => {
    // 条件リストの作成
    const conditions: FilterCondition[] = [];
    if (activeTab === 'people') {
      conditions.push({ type: 'PARTICIPANTS', userIds: Array.from(selectedUserIds) });
    } else {
      conditions.push({ type: 'HEADCOUNTS', counts: Array.from(selectedHeadcounts) });
    }

    if (isDurationEnabled) {
      conditions.push({ type: 'DURATION', minMinutes: minDuration });
    }

    if (isDateRangeEnabled) {
      const fallbackStart = availableDates[0] ?? '1970-01-01';
      const startDate = dateRange[0] || fallbackStart;
      const start = jstDateStringToStartOfDayMs(startDate);

      const fallbackEnd = availableDates[availableDates.length - 1] ?? '9999-12-31';
      const endDate = dateRange[1] || fallbackEnd;
      const end = jstDateStringToEndOfDayMs(endDate);

      conditions.push({ type: 'DATERANGE', start, end });
    }

    const blocks = extractSlots({
      users,
      includeMaybe,
      conditions,
      participantsFilter: (u) => (activeTab === 'people' ? selectedUserIds.has(u.id) : true),
    });

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
    extractedBlocks,
    // 表へのハイライト表示
    isHighlightEnabled,
    setIsHighlightEnabled,
  };
}
