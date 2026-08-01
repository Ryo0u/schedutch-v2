import * as z from 'zod';
import { titleSchema, passwordSchema, commentSchema } from '@/lib/validation';
import { TIME_OPTIONS } from '@/lib/constants';

export const eventCreateFormSchema = z.object({
  title: titleSchema,
  password: passwordSchema,
  comment: commentSchema,
  candidates:
    z.array(
      z.object({
        date: z.date(),
        // z.string() だと空文字を通し、superRefine の parseInt('') が NaN になって
        // 前後関係チェックもすり抜けるため、値の集合をスキーマで保証する
        startTime: z.enum(TIME_OPTIONS, { message: '開始時間を選択してください' }),
        endTime: z.enum(TIME_OPTIONS, { message: '終了時間を選択してください' }),
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

export type EventCreateFormData = z.infer<typeof eventCreateFormSchema>;
