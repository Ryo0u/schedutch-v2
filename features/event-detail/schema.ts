import * as z from 'zod';
import { nameSchema, commentSchema } from './lib/validation';

export type UserFormData = {
  name: string;
  comment: string;
  password: string;
  responses: {
    candidate_id: string;
    time: Date;
    status: string;
  }[];
};

export const UserFormSchema = z.object({
  name: nameSchema,
  comment: commentSchema,
  password:
    z.string()
      .min(3, 'パスワードを3文字以上で入力してください')
      .max(12, 'パスワードを12字以内で入力してください'),
  responses:
    z.array(
      z.object({
        candidate_id: z.string(),
        time: z.date(),
        status: z.string(),
      })
    ),
});

/** UserEditDialog: パスワードは事前検証済みのため編集フォームに含めない */
export const UserEditFormSchema = UserFormSchema.omit({ password: true });
export type UserEditFormData = z.infer<typeof UserEditFormSchema>;

export const EventEditFormSchema = z.object({
  title:
    z.string()
      .min(1, 'タイトルを入力してください')
      .max(10, 'タイトルを10文字以内で入力してください'),
  comment: commentSchema,
  password: z.string().min(1, '編集用パスワードを入力してください'),
});
export type EventEditFormData = z.infer<typeof EventEditFormSchema>;
