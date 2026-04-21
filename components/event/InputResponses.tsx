"use client"

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import InputUserInfo from './InputUserInfo';
import { Separator } from '../ui/separator';

interface ResposesFromProps {
  data: {
    candidates: []
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type UserFormData = {
  name: string;
  comment: string;
  password: string;
  responses: {
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
        time: z.date(),
        status: z.string()
      })
    ),
})

function InputResponses({ data, open, onOpenChange }: ResposesFromProps) {
  const form = useForm<z.infer<typeof UserFormSchema>>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      name: "",
      comment: "",
      password: "",
      responses: [],
    }
  })
  console.log(data)
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
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default InputResponses