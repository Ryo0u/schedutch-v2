export const MS_PER_MINUTE = 60 * 1000;

// 予定候補・回答の時間刻み幅（30分）
export const SLOT_INTERVAL_MS = 30 * MS_PER_MINUTE;

const SLOT_INTERVAL_MINUTES = SLOT_INTERVAL_MS / MS_PER_MINUTE;
const SLOTS_PER_DAY = (24 * 60) / SLOT_INTERVAL_MINUTES;

const toTimeOption = (index: number) => {
  const totalMinutes = index * SLOT_INTERVAL_MINUTES;
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// 1日分の時刻の選択肢(00:00 ~ 23:30)。刻み幅は SLOT_INTERVAL_MS から導出するため、
// 刻み幅を変えても回答スロットと選択肢がずれない
// z.enum() に渡すには「空でない readonly 配列」型が要るため、先頭要素を分けてタプル型を保つ
export const TIME_OPTIONS = [
  toTimeOption(0),
  ...Array.from({ length: SLOTS_PER_DAY - 1 }, (_, i) => toTimeOption(i + 1)),
] as const;
