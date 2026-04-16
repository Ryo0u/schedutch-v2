'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import InputEventInfo from '@/components/new/InputEventInfo';
import InputEventCandidates from '@/components/new/InputEventCandidates';
import CandidatesList from '@/components/new/CandidatesList';
import CreateEvent from '@/components/new/CreateEvent';
import { Badge } from '@/components/ui/badge';

export type FormData = {
  title: string;
  password: string;
  comment: string;
  candidates: {
    date: Date;
    startTime: string;
    endTime: string;
  }[],
};

const formSchema = z.object({
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
      })
    }),
});

export default function New() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      password: '',
      comment: '',
      candidates: [],
    },
  });

  return (
    <>
      <form>
        <div className="flex flex-col sm:flex-row justify-center items-end gap-8 w-full max-w-6xl mx-auto mt-5 mb-8">
          <section className="flex-1 max-w-xl shrink-0 px-3">
            <div className="p-4 mb-3 space-y-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" className="h-10 w-10" />
                <h1 className="text-xl font-extrabold tracking-tight text-primary">
                  SCHEDUTCH
                </h1>
              </div>

              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">
                  日程調整を、もっとシンプルに。
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  schedutch（スケダッチ）は、面倒な予定調整をスムーズにするツールです。
                  候補日を選んで URL を送るだけ。ログイン不要で、誰でもすぐに回答できます。
                </p>
              </div>
              
              <div className='flex flex-wrap gap-2 '>
                <Badge className='py-3'>
                  ログイン不要
                </Badge>
                <Badge className='py-3'>
                    全機能が無料
                </Badge>
              </div>
            </div>
            
            <InputEventInfo control={form.control} />
          </section>
          
          <section className="flex-1 max-w-xl px-3">
            <InputEventCandidates control={form.control} />
          </section>
        </div>
        
        <section className='flex-row justify-center w-full max-w-6xl mx-auto px-3'>
          <CandidatesList control={form.control}/>
        </section>
        
        <section className='max-w-6xl mx-auto px-3 mb-5'>
          <CreateEvent form={form}/>
        </section>
      </form>
    </>
  );
}
