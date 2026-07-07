// JSTはDST(サマータイム)がないため、UTCへの固定オフセット加算とIntl.DateTimeFormatによる変換は常に等価
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

type DateInput = string | number | Date;

/**UTC日時（文字列・Date・Unixミリ秒）をJSTのDateに変換 */
export function toJST(utcDateInput: DateInput): Date {
  const utc = utcDateInput instanceof Date ? utcDateInput : new Date(utcDateInput);
  return new Date(utc.getTime() + JST_OFFSET_MS);
}

/** JST での "HH:MM" 文字列を返す */
export function formatJSTTime(input: DateInput): string {
  const ms = input instanceof Date ? input.getTime() : new Date(input).getTime();
  const jst = new Date(ms + JST_OFFSET_MS);
  const h = String(jst.getUTCHours()).padStart(2, "0");
  const m = String(jst.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/** JST でのローカライズされた日付文字列を返す（ブラウザTZ非依存） */
export function formatJSTDate(
  input: DateInput,
  opts: Omit<Intl.DateTimeFormatOptions, "timeZone">
): string {
  const d = input instanceof Date ? input : new Date(input);
  return d.toLocaleDateString("ja-JP", { ...opts, timeZone: "Asia/Tokyo" });
}

/*
 * カレンダーで選んだ日付 + "HH:MM" を JST の壁時計時刻とみなし、
 * 正しい UTC instant の ISO 文字列を返す。
 * 例: date=2024-03-15 (カレンダー選択), hhmm="09:00" → "2024-03-15T00:00:00.000Z"
 */
export function jstWallTimeToISO(date: Date, hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr ?? "0");
  const m = Number(mStr ?? "0");
  // ブラウザTZ非依存で JST の年月日を取得（"YYYY-MM-DD"）
  const jstDateStr = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
  }).format(date);
  const [year, month, day] = jstDateStr.split("-").map(Number);
  // JST壁時計 → UTC: h-9 は負になり得るが Date.UTC が正しく前日にロールバックする
  return new Date(Date.UTC(year!, month! - 1, day!, h - 9, m)).toISOString();
}
