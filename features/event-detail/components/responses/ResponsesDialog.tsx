"use client"

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import UserInfoFields from '../form/UserInfoFields';
import { Separator } from '@/components/ui/separator';
import ResponsesFields from '../form/ResponsesFields';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { hashPassword } from '@/lib/password';
import { type Candidate } from '@/features/event-detail/types';
import { type UserFormData, userFormSchema } from '@/features/event-detail/schema';
import { useSaveResponses } from '@/features/event-detail/hooks/useEventMutations';
import { buildInitialResponses, toResponseInputs } from '@/features/event-detail/lib/responses';
import { toast } from 'sonner';

interface ResponsesDialogProps {
  eventId: string;
  data: {
    candidates: Pick<Candidate, "id" | "start_time" | "end_time">[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ResponsesDialog({ eventId, data, open, onOpenChange }: ResponsesDialogProps) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      comment: "",
      password: "",
      responses: [],
    }
  })

  const saveResponses = useSaveResponses(eventId);

  // responsesの初期化
  useEffect(() => {
    if (open && data.candidates) {
      form.reset({
        ...form.getValues(),
        responses: buildInitialResponses(data.candidates),
      });
    }
  }, [open, data.candidates, form])

  const onSubmit = async (values: UserFormData) => {
    try {
      const hashedPassword = await hashPassword(values.password);

      const formattedResponses = toResponseInputs(values.responses);

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
      console.error('Failed to create user:', error);
      toast.error('回答の保存に失敗しました。', {position: 'top-center'})
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
          id="responses-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6"
        >
          <UserInfoFields control={form.control} />
          <Separator/>
          <ResponsesFields control={form.control} data={data} />
        </form>

        <DialogFooter className='m-3'>
          <DialogClose render={
            <Button size="lg" variant="ghost" type='button' onClick={() => form.reset()}>キャンセル</Button>
          }/>
          <Button size="lg" variant="default" type='submit' form="responses-form" disabled={saveResponses.isPending}>
            {saveResponses.isPending ? "登録中..." : "登録する"}
          </Button>
        </DialogFooter>
        
      </DialogContent>
    </Dialog>
  )
}

export default ResponsesDialog