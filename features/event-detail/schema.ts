import * as z from 'zod';
import {
  titleSchema,
  passwordSchema,
  passwordConfirmSchema,
  eventCommentSchema,
} from '@/lib/validation';
import { RESPONSE_STATUSES } from './lib/status';

export const NAME_MAX_LENGTH = 10;

export const nameSchema = z
  .string()
  .min(1, '名前を入力してください')
  .max(NAME_MAX_LENGTH, `名前を${NAME_MAX_LENGTH}文字以内で入力してください`);

export const USER_COMMENT_MAX_LENGTH = 100;

/**
 * 参加者のコメントフィールドのバリデーション。
 *
 * UsersInfo の一覧で名前と同じ行に表示されるため、イベントのコメントより上限を抑える。
 */
export const userCommentSchema = z
  .string()
  .max(USER_COMMENT_MAX_LENGTH, `コメントは${USER_COMMENT_MAX_LENGTH}文字以内で入力してください`);

export const userFormSchema = z.object({
  name: nameSchema,
  comment: userCommentSchema,
  password: passwordSchema,
  responses: z.array(
    z.object({
      candidate_id: z.string(),
      time: z.date(),
      status: z.enum(RESPONSE_STATUSES),
    }),
  ),
});
export type UserFormData = z.infer<typeof userFormSchema>;
export type ResponseFormValue = UserFormData['responses'][number];

/** UserEditDialog: パスワードは事前検証済みのため編集フォームに含めない */
export const userEditFormSchema = userFormSchema.omit({ password: true });
export type UserEditFormData = z.infer<typeof userEditFormSchema>;

export const eventEditFormSchema = z.object({
  title: titleSchema,
  comment: eventCommentSchema,
  password: passwordConfirmSchema,
});
export type EventEditFormData = z.infer<typeof eventEditFormSchema>;
