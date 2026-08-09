// JSTはDST(サマータイム)がないため、UTCへの固定オフセット加算とIntl.DateTimeFormatによる変換は常に等価
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

type DateInput = string | number | Date;

/** JST での "HH:MM" 文字列を返す */
export function formatJSTTime(input: DateInput): string {
  const ms = input instanceof Date ? input.getTime() : new Date(input).getTime();
  const jst = new Date(ms + JST_OFFSET_MS);
  const h = String(jst.getUTCHours()).padStart(2, '0');
  const m = String(jst.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/** JST でのローカライズされた日付文字列を返す（ブラウザTZ非依存） */
export function formatJSTDate(
  input: DateInput,
  opts: Omit<Intl.DateTimeFormatOptions, 'timeZone'>,
): string {
  const d = input instanceof Date ? input : new Date(input);
  return d.toLocaleDateString('ja-JP', { ...opts, timeZone: 'Asia/Tokyo' });
}

/** JST での "8月1日(金)" 形式の候補日ラベルを返す（ブラウザTZ非依存） */
export function formatJSTCandidateDateLabel(input: DateInput): string {
  return formatJSTDate(input, { month: 'short', day: 'numeric', weekday: 'short' });
}

/** UTC日時をJSTの "YYYY-MM-DD" 文字列で返す（ブラウザTZ非依存） */
export function toJSTDateString(input: DateInput): string {
  const d = input instanceof Date ? input : new Date(input);
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(d);
}

/**
 * UTC日時をJSTの年月日を表すDateオブジェクト（時刻はブラウザのローカル0時）で返す。
 * react-day-picker はDateのローカル年月日で日付を比較するため、カレンダーの日付照合に使う。
 */
export function toJSTDateOnly(input: DateInput): Date {
  const [year, month, day] = toJSTDateString(input).split('-').map(Number);
  return new Date(year!, month! - 1, day!);
}

/*
 * カレンダーで選んだ日付 + "HH:MM" を JST の壁時計時刻とみなし、
 * 正しい UTC instant の ISO 文字列を返す。
 * 例: date=2024-03-15 (カレンダー選択), hhmm="09:00" → "2024-03-15T00:00:00.000Z"
 */
export function jstWallTimeToISO(date: Date, hhmm: string): string {
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr ?? '0');
  const m = Number(mStr ?? '0');
  // ブラウザTZ非依存で JST の年月日を取得（"YYYY-MM-DD"）
  const [year, month, day] = toJSTDateString(date).split('-').map(Number);
  // JST壁時計 → UTC: h-9 は負になり得るが Date.UTC が正しく前日にロールバックする
  return new Date(Date.UTC(year!, month! - 1, day!, h - 9, m)).toISOString();
}

/** JST の "YYYY-MM-DD" 文字列から、その日の JST 0時0分0秒の UTC ミリ秒を返す */
export function jstDateStringToStartOfDayMs(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00+09:00`).getTime();
}

/** JST の "YYYY-MM-DD" 文字列から、その日の JST 23時59分59.999秒の UTC ミリ秒を返す */
export function jstDateStringToEndOfDayMs(dateStr: string): number {
  return new Date(`${dateStr}T23:59:59.999+09:00`).getTime();
}
