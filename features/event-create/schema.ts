import * as z from 'zod';
import { titleSchema, passwordSchema, commentSchema } from '@/lib/validation';

export const formSchema = z.object({
  title: titleSchema,
  password: passwordSchema,
  comment: commentSchema,
  candidates:
    z.array(
      z.object({
        date: z.date(),
        startTime: z.string(),
        endTime: z.string(),
      })
    )
    .min(1, '候補日を1つ以上選択し、追加ボタンを押してください')
    .superRefine((data, ctx) => {
      data.forEach((item, index) => {
        const start = parseInt(item.startTime.replace(':', ''), 10);
        const end = parseInt(item.endTime.replace(':', ''), 10);

        if (start >= end) {
          ctx.addIssue({
            code: "custom",
            message: "開始時間は終了時間より前に入力してください",
            path: [index],
          });
        }
      });
    }),
});

export type EventCreateFormData = z.infer<typeof formSchema>;
