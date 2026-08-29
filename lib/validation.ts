import * as z from 'zod';

export const TITLE_MAX_LENGTH = 10;
export const PASSWORD_MIN_LENGTH = 3;
export const PASSWORD_MAX_LENGTH = 12;
export const EVENT_COMMENT_MAX_LENGTH = 200;

/** タイトルフィールドの共通バリデーション */
export const titleSchema = z
  .string()
  .min(1, 'タイトルを入力してください')
  .max(TITLE_MAX_LENGTH, `タイトルを${TITLE_MAX_LENGTH}文字以内で入力してください`);

/** 新規に設定するパスワードフィールドの共通バリデーション */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `パスワードを${PASSWORD_MIN_LENGTH}文字以上で入力してください`)
  .max(PASSWORD_MAX_LENGTH, `パスワードを${PASSWORD_MAX_LENGTH}文字以内で入力してください`);

/**
 * イベントのコメントフィールドのバリデーション。
 *
 * 参加者のコメント（features/event-detail の userCommentSchema）とは上限が異なる。
 * イベント側は EventInfo で独立した段落として表示され、長くなっても折り返すだけなので
 * 参加者コメントより長い入力を許容する。
 */
export const eventCommentSchema = z
  .string()
  .max(EVENT_COMMENT_MAX_LENGTH, `コメントは${EVENT_COMMENT_MAX_LENGTH}文字以内で入力してください`);

/**
 * 既存パスワードを照合するフィールドの共通バリデーション。
 *
 * 長さの制約は課さない。登録時に passwordSchema が上限・下限を保証しており、
 * 実際の一致判定はサーバー（RPC 内の crypt()）が行うため、
 * クライアントで見るべきなのは「空のまま送信させない」ことだけ。
 */
export const passwordConfirmSchema = z.string().min(1, 'パスワードを入力してください');
