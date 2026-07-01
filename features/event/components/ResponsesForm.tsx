"use client"

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import InputUserInfo from './InputUserInfo';
import { Separator } from '@/components/ui/separator';
import InputResponses from './InputResponses';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { hashPassword } from '@/lib/utils';
import { useParams } from 'next/navigation';
import { Candidate } from '@/features/event/types';
import { UserFormData, UserFormSchema } from '@/features/event/schema';
import { useSaveResponses } from '@/features/event/hooks/useEventMutations';

interface ResposesFromProps {
  data: {
    candidates: Pick<Candidate, "id" | "start_time" | "end_time">[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
  const saveResponses = useSaveResponses(eventId);

  // responsesの初期化
  useEffect(() => {
    if (open && data.candidates) {
      const initResponses: UserFormData["responses"] = [];

      // UTC instant 上の30分刻みでループし、ブラウザTZに依存しない
      data.candidates.forEach((candidate) => {
        let currentMs = new Date(candidate.start_time).getTime();
        const endMs = new Date(candidate.end_time).getTime();

        while (currentMs < endMs) {
          initResponses.push({
            candidate_id: candidate.id,
            time: new Date(currentMs),
            status: "ok",
          });
          currentMs += 30 * 60000; // 30分進める
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
      const hashedPassword = await hashPassword(values.password);
      
      const formattedResponses = values.responses.map(res => ({
        candidate_id: res.candidate_id,
        time: res.time.toISOString(),
        status: res.status
      }));

      await saveResponses.mutateAsync({
        eventId,
        name: values.name,
        comment: values.comment,
        passwordDigest: hashedPassword,
        responses: formattedResponses,
      });

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Failed to creat user:', error);
      alert("保存に失敗しました。")
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-2xl lg:max-w-6xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 text-center shrink-0">
          <DialogTitle className="text-xl font-black">予定を回答する</DialogTitle>
          <DialogDescription>
            回答者の名前とパスワード、日時毎の予定を入力してください
          </DialogDescription>
        </DialogHeader>

        <Separator className="shrink-0" />

        <form 
          onSubmit={form.handleSubmit(onSubmit)} 
          className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6"
        >
          <InputUserInfo control={form.control} />
          <Separator/>
          <InputResponses control={form.control} data={data} />
        </form>
        
        <DialogFooter className='m-3'>
          <DialogClose render={
            <Button size="lg" variant="ghost" type='button' onClick={() => form.reset()}>キャンセル</Button>
          }/>
          <Button size="lg" variant="default" type='submit' onClick={form.handleSubmit(onSubmit)}>登録する</Button>
        </DialogFooter>
        
      </DialogContent>
    </Dialog>
  )
}

export default ResponsesForm