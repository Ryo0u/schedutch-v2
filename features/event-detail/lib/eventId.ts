import * as z from 'zod';

/**
 * URL の id がイベント ID（events.id の uuid）として成り立つ形式かを判定する。
 *
 * 不正な形式のまま問い合わせると Postgres が 22P02 で拒否し、not-found ではなく
 * エラー画面に振り分けられるため、問い合わせ前にここで弾く。
 * z.uuid() は RFC の version/variant ビットまで検証し、Postgres の uuid 型が受け付ける
 * 値（seed の固定 ID 等）まで弾いてしまうため、形式のみを見る z.guid() を使う。
 */
export function isValidEventId(id: string): boolean {
  return z.guid().safeParse(id).success;
}
