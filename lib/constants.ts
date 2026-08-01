const toTimeOption = (i: number) => {
  const hours = Math.floor(i / 2).toString().padStart(2, '0');
  const minutes = (i % 2 === 0 ? '00' : '30');
  return `${hours}:${minutes}`;
};

// 30分刻みの時間(00:00 ~ 23:30)
// z.enum() に渡すには「空でない readonly 配列」型が要るため、先頭要素を分けてタプル型を保つ
export const TIME_OPTIONS = [
  toTimeOption(0),
  ...Array.from({ length: 47 }, (_, i) => toTimeOption(i + 1)),
] as const;

// 予定候補・回答の時間刻み幅（30分）
export const SLOT_INTERVAL_MS = 30 * 60 * 1000;

export const MS_PER_MINUTE = 60 * 1000;