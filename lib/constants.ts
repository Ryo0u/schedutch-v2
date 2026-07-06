// 30分刻みの時間(00:00 ~ 23:30)
export const TIME_OPTIONS = Array.from({ length: 48 }).map((_, i) => {
  const hours = Math.floor(i / 2).toString().padStart(2, '0');
  const minutes = (i % 2 === 0 ? '00' : '30');
  return `${hours}:${minutes}`;
});

// 予定候補・回答の時間刻み幅（30分）
export const SLOT_INTERVAL_MS = 30 * 60 * 1000;