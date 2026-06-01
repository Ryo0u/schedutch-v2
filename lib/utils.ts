import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** Supabaseから取得したUTC日時（文字列・Date・Unixミリ秒）をJST（日本時間）のDateに変換する */
export function toJST(utcDateInput: string | number | Date): Date {
  const utc = utcDateInput instanceof Date ? utcDateInput : new Date(utcDateInput);
  return new Date(utc.getTime() - JST_OFFSET_MS);
}
