import * as z from 'zod';

export const TITLE_MAX_LENGTH = 10;
export const PASSWORD_MIN_LENGTH = 3;
export const PASSWORD_MAX_LENGTH = 12;
export const COMMENT_MAX_LENGTH = 30;

/** タイトルフィールドの共通バリデーション */
export const titleSchema = z
  .string()
  .min(1, 'タイトルを入力してください')
  .max(TITLE_MAX_LENGTH, `タイトルを${TITLE_MAX_LENGTH}文字以内で入力してください`);

/** パスワードフィールドの共通バリデーション */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `パスワードを${PASSWORD_MIN_LENGTH}文字以上で入力してください`)
  .max(PASSWORD_MAX_LENGTH, `パスワードを${PASSWORD_MAX_LENGTH}文字以内で入力してください`);

/** コメントフィールドの共通バリデーション */
export const commentSchema = z
  .string()
  .max(COMMENT_MAX_LENGTH, `コメントは${COMMENT_MAX_LENGTH}文字以内で入力してください`);
