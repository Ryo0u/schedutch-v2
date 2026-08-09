import * as z from 'zod';

export const NAME_MAX_LENGTH = 10;

/** 名前フィールドの共通バリデーション */
export const nameSchema = z
  .string()
  .min(1, '名前を入力してください')
  .max(NAME_MAX_LENGTH, `名前を${NAME_MAX_LENGTH}文字以内で入力してください`);
