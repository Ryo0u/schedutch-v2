import * as z from 'zod';
import { titleSchema, passwordSchema, commentSchema } from '@/lib/validation';
import { nameSchema } from './lib/validation';

export const UserFormSchema = z.object({
  name: nameSchema,
  comment: commentSchema,
  password: passwordSchema,
  responses:
    z.array(
      z.object({
        candidate_id: z.string(),
        time: z.date(),
        status: z.string(),
      })
    ),
});
export type UserFormData = z.infer<typeof UserFormSchema>;

/** UserEditDialog: パスワードは事前検証済みのため編集フォームに含めない */
export const UserEditFormSchema = UserFormSchema.omit({ password: true });
export type UserEditFormData = z.infer<typeof UserEditFormSchema>;

export const EventEditFormSchema = z.object({
  title: titleSchema,
  comment: commentSchema,
  password: z.string().min(1, '編集用パスワードを入力してください'),
});
export type EventEditFormData = z.infer<typeof EventEditFormSchema>;
