'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import InputEventInfo from '@/components/new/InputEventInfo';
import InputEventCandidates from '@/components/new/InputEventCandidates';
import CandidatesList from '@/components/new/CandidatesList';
import { Eraser, Plus } from 'lucide-react'; 
import { Separator } from '@/components/ui/separator';

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

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex justify-center items-end gap-8 w-full max-w-6xl mx-auto mt-5 mb-8">
          <section className="flex-1 max-w-xl shrink-0">
            <div className="p-2">
              <h1 className="text-2xl font-bold text-primary">schedutch</h1>
              <p>ここにロゴとか説明を書く</p>
            </div>
            
            <InputEventInfo control={form.control} />
          </section>
          
          <section className="flex-1 max-w-xl">
            <InputEventCandidates control={form.control} />
          </section>
        </div>
        
        <section className='flex-row justify-center w-full max-w-6xl mx-auto mb-8'>
          <CandidatesList control={form.control}/>
        </section>
        
        <div className='max-w-6xl mx-auto'>
          <Separator className="my-8" />
          <div className='flex justify-between items-center bg-muted/30 p-4 rounded-xl border border-border'>
            <p className="text-sm text-muted-foreground ml-2">
              入力内容を確認して送信してください
            </p>
            <div className='flex gap-3'>
              <Button className="hover:bg-destructive/10 hover:text-destructive " variant="ghost" type="button" onClick={() => form.reset()}>
                <Eraser/>リセット
              </Button>
              <Button className='px-12 font-bold' size="lg" type="submit">
                <Plus/>作成する
              </Button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
