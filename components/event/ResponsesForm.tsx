"use client"

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import InputUserInfo from './InputUserInfo';
import { Separator } from '../ui/separator';
import InputResponses from './InputResponses';
import { useEffect } from 'react';
import { Timestamp } from 'next/dist/server/lib/cache-handlers/types';
import { Button } from '../ui/button';
import bcrypt from 'bcryptjs';
import { supabase } from '@/utils/supabase/client';
import { useParams } from 'next/navigation';

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
  
  const params = useParams();
  const eventId = params.id as string;
  
  // responsesの初期化
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
      
      form.reset({
      ...form.getValues(),
      responses: initResponses,
    });
    }
  }, [open, data.candidates])
  
  const onSubmit = async (values: UserFormData) => {
    try {
      // パスワードのハッシュ化
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(values.password, salt);
      
      const formattedResponses = values.responses.map(res => ({
        candidate_id: res.candidate_id,
        time: res.time.toISOString(),
        status: res.status
      }));
      
      const { data, error } = await supabase.rpc("save_user_responses", {
        p_event_id: eventId,
        p_name: values.name,
        p_comment: values.comment,
        p_password: hashedPassword,
        p_response_data: formattedResponses
      })
      
      if (error) throw error;
      
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Failed to creat user:', error);
      alert("保存に失敗しました。")
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] md:max-w-175 lg:max-w-300">
        <DialogHeader className='text-center'>
          <DialogTitle className="text-xl font-black">予定を回答する</DialogTitle>
          <DialogDescription>
            回答者の名前とパスワード、日時毎の予定を入力してください
          </DialogDescription>
          <Separator/>
        </DialogHeader>
        
        <form className='overflow-auto'>
          <InputUserInfo control={form.control}/>
          <Separator className="my-8"/>
          <InputResponses control={form.control} data={data}/>
          
          <DialogFooter>
            <DialogClose render={
              <Button size="lg" variant="ghost" type='button' onClick={() => form.reset()}>キャンセル</Button>
            }/>
            <Button size="lg" variant="default" type='submit' onClick={form.handleSubmit(onSubmit)}>登録する</Button>
          </DialogFooter>
        </form>
        
      </DialogContent>
    </Dialog>
  )
}

export default ResponsesForm