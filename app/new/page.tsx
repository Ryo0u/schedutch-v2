'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import InputEventInfo from '@/components/new/InputEventInfo';
import InputEventCandidates from '@/components/new/InputEventCandidates';
import CandidatesList from '@/components/new/CandidatesList';

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
    ).min(1, '候補日を1つ以上選択し、追加ボタンを押してください'),
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
        <div className="flex justify-center items-start gap-8 w-full max-w-6xl mx-auto mb-10">
          <div className="flex-1 max-w-xl shrink-0">
            <InputEventInfo control={form.control} />
          </div>
          
          <div className="flex-1 max-w-xl">
            <InputEventCandidates control={form.control} />
          </div>
        </div>
        
        <div className='flex-row justify-center w-full max-w-6xl mx-auto'>
          <CandidatesList control={form.control}/>
        </div>
        
        <Button className='max-w-md' type="submit">送信</Button>
      </form>
    </>
  );
}
