import * as z from "zod";

/** 名前フィールドの共通バリデーション */
export const nameSchema = z
  .string()
  .min(1, "名前を入力してください")
  .max(10, "名前を10文字以内で入力してください");

/** コメントフィールドの共通バリデーション */
export const commentSchema = z.string().max(30, "コメントは30文字以内で入力してください");
