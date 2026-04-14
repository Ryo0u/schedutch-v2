'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import InputEventInfo from '@/components/new/InputEventInfo';

export type FormData = {
  title: string;
  password: string;
  comment: string;
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
});

export default function New() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      password: '',
      comment: '',
    },
  });

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <InputEventInfo control={form.control} />
        <Button type="submit">送信</Button>
      </form>
    </>
  );
}
