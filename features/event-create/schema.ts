import * as z from 'zod';

export type FormData = {
  title: string;
  password: string;
  comment: string;
  candidates: {
    date: Date;
    startTime: string;
    endTime: string;
  }[];
};

export const formSchema = z.object({
  title:
    z.string()
     .min(1, 'タイトルを入力してください')
     .max(10, 'タイトルを10文字以内で入力してください'),
  password:
    z.string()
     .min(3, 'パスワードを3文字以上で入力してください')
     .max(12, 'パスワードを12字以内で入力してください'),
  comment:
    z.string().max(30, 'コメントは30文字以内で入力してください'),
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
