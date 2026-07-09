import { formatJSTTime, formatJSTDate } from "@/lib/datetime";
import { SLOT_INTERVAL_MS } from "@/lib/constants";
import { STATUS_META } from "@/features/event-detail/lib/status";
import type { User } from "@/features/event-detail/types";

export type ParticipantInfo = { id: string; name: string; status: string };

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

// userId -> (time -> status)。線形探索を避けるための事前索引
type ResponseMaps = Map<string, Map<number, string>>;

const buildResponseMaps = (users: ExtractUser[]): ResponseMaps => {
  return new Map(users.map(u => [
    u.id,
    new Map(u.responses.map(r => [new Date(r.time).getTime(), r.status])),
  ]));
};

const isUserAvailable = (responseMaps: ResponseMaps, userId: string, time: number, includeMaybe: boolean) => {
  const status = responseMaps.get(userId)?.get(time);
  if (!status) return false;
  if (status === 'ok') return true;
  if (includeMaybe && status === 'maybe') return true;
  return false;
};

const areParticipantsEqual = (p1: ParticipantInfo[], p2: ParticipantInfo[]) => {
  if (p1.length !== p2.length) return false;
  const s1 = [...p1].sort((a, b) => a.id.localeCompare(b.id));
  const s2 = [...p2].sort((a, b) => a.id.localeCompare(b.id));
  return s1.every((val, index) => val.id === s2[index]?.id && val.status === s2[index]?.status);
};

// 一コマ単位のルールを適応
const checkSlotConditions = (
  time: number,
  conditions: FilterCondition[],
  users: ExtractUser[],
  responseMaps: ResponseMaps,
  includeMaybe: boolean,
): boolean => {
  return conditions.every(condition => {
    switch (condition.type) {
      case 'PARTICIPANTS':
        return condition.userIds.every(uid => isUserAvailable(responseMaps, uid, time, includeMaybe));
      case 'HEADCOUNTS': {
        const count = users.filter(u => isUserAvailable(responseMaps, u.id, time, includeMaybe)).length;
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
  responseMaps: ResponseMaps,
  includeMaybe: boolean,
  participantsFilter: (user: ExtractUser) => boolean,
): TimeBlock[] => {
  return times.reduce((acc: TimeBlock[], time) => {
    // この時間の参加者リストを作成
    const currentParticipants = users
      .filter(u => isUserAvailable(responseMaps, u.id, time, includeMaybe) && participantsFilter(u))
      .map(u => ({
        id: u.id,
        name: u.name,
        status: responseMaps.get(u.id)?.get(time) ?? "ok"
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
      const start = formatJSTTime(block.start);
      const end = formatJSTTime(block.end + SLOT_INTERVAL_MS);
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
  const responseMaps = buildResponseMaps(users);

  // 全タイムスタンプの取得
  const allTimes = Array.from(new Set(
    users.flatMap(u => u.responses.map(r => new Date(r.time).getTime()))
  )).sort((a, b) => a - b);

  const filteredTimes = allTimes.filter(t => checkSlotConditions(t, conditions, users, responseMaps, includeMaybe));
  const mergedBlocks = createMergedBlocks(filteredTimes, users, responseMaps, includeMaybe, participantsFilter);
  const finalBlocks = mergedBlocks.filter(b => checkBlockConditions(b, conditions));

  return { blocks: finalBlocks, formatted: formatExtractTimes(finalBlocks) };
}
