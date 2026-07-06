import { jstHHMM, formatJSTDate } from "@/lib/datetime";
import { SLOT_INTERVAL_MS } from "@/lib/constants";
import { STATUS_META } from "@/features/event-detail/lib/status";
import type { User } from "@/features/event-detail/types";

export type ParticipantInfo = { name: string; status: string };

export type TimeBlock = { start: number; end: number; participants: ParticipantInfo[] };

// 抽出条件（アルゴリズムへの入力の内部表現）
export type FilterCondition =
  | { type: 'PARTICIPANTS'; userIds: string[] }
  | { type: 'HEADCOUNTS'; counts: number[] }
  | { type: 'DURATION'; minMinutes: number }
  | { type: 'DATERANGE'; start: number, end: number };

type ExtractUser = Pick<User, "id" | "name" | "responses">;

interface ExtractSlotsParams {
  users: ExtractUser[];
  includeMaybe: boolean;
  conditions: FilterCondition[];
  // 塊の参加者リストに含めるユーザーの絞り込み（タブ等のUI概念はここに閉じ込めず呼び出し側が渡す）
  participantsFilter: (user: ExtractUser) => boolean;
}

const isUserAvailable = (user: ExtractUser, time: number, includeMaybe: boolean) => {
  const res = user.responses.find(r => new Date(r.time).getTime() === time);
  if (!res) return false;
  if (res.status === 'ok') return true;
  if (includeMaybe && res.status === 'maybe') return true;
  return false;
};

const areParticipantsEqual = (p1: ParticipantInfo[], p2: ParticipantInfo[]) => {
  if (p1.length !== p2.length) return false;
  const s1 = [...p1].sort((a, b) => a.name.localeCompare(b.name));
  const s2 = [...p2].sort((a, b) => a.name.localeCompare(b.name));
  return s1.every((val, index) => val.name === s2[index]?.name && val.status === s2[index]?.status);
};

// 一コマ単位のルールを適応
const checkSlotConditions = (
  time: number,
  conditions: FilterCondition[],
  users: ExtractUser[],
  includeMaybe: boolean,
): boolean => {
  return conditions.every(condition => {
    switch (condition.type) {
      case 'PARTICIPANTS':
        return condition.userIds.every(uid => {
          const user = users.find(u => u.id === uid);
          return user ? isUserAvailable(user, time, includeMaybe) : false;
        });
      case 'HEADCOUNTS': {
        const count = users.filter(u => isUserAvailable(u, time, includeMaybe)).length;
        return condition.counts.includes(count);
      }
      case 'DATERANGE':
        return condition.start <= time && time <= condition.end
      default:
        return true;
    }
  });
};

// 連続した時間の塊を作成
const createMergedBlocks = (
  times: number[],
  users: ExtractUser[],
  includeMaybe: boolean,
  participantsFilter: (user: ExtractUser) => boolean,
): TimeBlock[] => {
  return times.reduce((acc: TimeBlock[], time) => {
    // この時間の参加者リストを作成
    const currentParticipants = users
      .filter(u => isUserAvailable(u, time, includeMaybe) && participantsFilter(u))
      .map(u => ({
        name: u.name,
        status: u.responses.find(r => new Date(r.time).getTime() === time)?.status ?? "ok"
      }));

    const lastBlock = acc[acc.length - 1];
    // 「時間が連続」かつ「参加者と状態が一致」なら結合
    if (lastBlock && time === lastBlock.end + SLOT_INTERVAL_MS && areParticipantsEqual(lastBlock.participants, currentParticipants)) {
      lastBlock.end = time;
    } else {
      acc.push({ start: time, end: time, participants: currentParticipants });
    }
    return acc;
  }, []);
};

// 塊単位のルールを適応
const checkBlockConditions = (block: TimeBlock, conditions: FilterCondition[]) => {
  return conditions.every(cond => {
    switch (cond.type) {
      case 'DURATION': {
        const durationMs = (block.end + SLOT_INTERVAL_MS) - block.start;
        return durationMs >= cond.minMinutes * 60 * 1000;
      }
      default:
        return true;
    }
  });
};

const formatExtractTimes = (blocks: TimeBlock[]): string[] => {
  const result: string[] = [];

  const grouped = blocks.reduce((acc, block) => {
    const dateKey = formatJSTDate(block.start, { month: "numeric", day: "numeric" });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(block);
    return acc;
  }, {} as Record<string, TimeBlock[]>);

  Object.entries(grouped).forEach(([date, daysBlocks]) => {
    result.push(date);
    daysBlocks.forEach(block => {
      const start = jstHHMM(block.start);
      const end = jstHHMM(block.end + SLOT_INTERVAL_MS);
      // 表示時に maybe の人には symbol を付ける
      const names = block.participants.map(p => p.status === 'maybe' ? `${p.name}(${STATUS_META.maybe.symbol})` : p.name).join(', ');
      result.push(`${start} - ${end} : ${names}`);
    });
    result.push("");
  });

  return result;
}

// 抽出処理の入口: 条件に合うコマを絞り込み → 連続コマを結合 → 塊単位の条件で絞り込み
export function extractSlots({ users, includeMaybe, conditions, participantsFilter }: ExtractSlotsParams): {
  blocks: TimeBlock[];
  formatted: string[];
} {
  // 全タイムスタンプの取得
  const allTimes = Array.from(new Set(
    users.flatMap(u => u.responses.map(r => new Date(r.time).getTime()))
  )).sort((a, b) => a - b);

  const filteredTimes = allTimes.filter(t => checkSlotConditions(t, conditions, users, includeMaybe));
  const mergedBlocks = createMergedBlocks(filteredTimes, users, includeMaybe, participantsFilter);
  const finalBlocks = mergedBlocks.filter(b => checkBlockConditions(b, conditions));

  return { blocks: finalBlocks, formatted: formatExtractTimes(finalBlocks) };
}
