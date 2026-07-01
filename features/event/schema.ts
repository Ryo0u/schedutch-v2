import * as z from 'zod';

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
  name:
    z.string()
      .min(1, '名前を入力してください')
      .max(10, '名前を10文字以内で入力してください'),
  comment:
    z.string().max(30, 'コメントは30文字以内で入力してください'),
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
