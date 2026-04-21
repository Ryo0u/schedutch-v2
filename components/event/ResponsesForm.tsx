"use client"

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import InputUserInfo from './InputUserInfo';
import { Separator } from '../ui/separator';
import InputResponses from './InputResponses';
import { useEffect } from 'react';
import { Timestamp } from 'next/dist/server/lib/cache-handlers/types';

interface ResposesFromProps {
  data: {
    candidates: {
      id: string
      start_time: Timestamp
      end_time: Timestamp
    }[]
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type UserFormData = {
  name: string;
  comment: string;
  password: string;
  responses: {
    candidate_id: string;
    time: Date;
    status: string; 
  }[];
}

const UserFormSchema = z.object({
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
        candidate_id : z.string(),
        time: z.date(),
        status: z.string()
      })
    ),
})

function ResponsesForm({ data, open, onOpenChange }: ResposesFromProps) {
  const form = useForm<z.infer<typeof UserFormSchema>>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      name: "",
      comment: "",
      password: "",
      responses: [],
    }
  })
  
  useEffect(() => {
    if (open && data.candidates) {
      const initResponses: UserFormData["responses"] = [];
      
      data.candidates.forEach((candidate) => {
        // 世界標準時で取得
        const startDate = new Date(candidate.start_time);
        const endDate = new Date(candidate.end_time);

        // 日本の時差分（9時間 = 540分）をミリ秒で引いて日本時間に戻す
        const JST_OFFSET = 9 * 60 * 60 * 1000;
        let current = new Date(startDate.getTime() - JST_OFFSET);
        const end = new Date(endDate.getTime() - JST_OFFSET);
        
        while (current < end) {
          initResponses.push({
            candidate_id: candidate.id,
            time: new Date(current),
            status: "ok",
          })
          current = new Date(current.getTime() + 30 * 60000); //30分進める
        }
      })
      console.log("生成された回答データ:", initResponses);
      
      form.reset({
      ...form.getValues(),
      responses: initResponses,
    });
    }
  }, [open, data.candidates])
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] md:max-w-175 lg:max-w-250">
        <DialogHeader className='text-center'>
          <DialogTitle className="text-xl font-black">予定を回答する</DialogTitle>
          <DialogDescription>
            回答者の名前とパスワード、日時毎の予定を入力してください
          </DialogDescription>
          <Separator/>
        </DialogHeader>
        
        <form>
          <InputUserInfo control={form.control}/>
          <InputResponses control={form.control}/>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ResponsesForm