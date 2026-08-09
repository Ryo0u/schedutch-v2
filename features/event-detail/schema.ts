import * as z from 'zod';
import { titleSchema, passwordSchema, commentSchema } from '@/lib/validation';
import { nameSchema } from './lib/validation';
import { RESPONSE_STATUSES } from './lib/status';

export const userFormSchema = z.object({
  name: nameSchema,
  comment: commentSchema,
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
  comment: commentSchema,
  password: z.string().min(1, '編集用パスワードを入力してください'),
});
export type EventEditFormData = z.infer<typeof eventEditFormSchema>;
