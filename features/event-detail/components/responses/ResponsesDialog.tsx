'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
    candidates: Pick<Candidate, 'id' | 'start_time' | 'end_time'>[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ResponsesDialog({ eventId, data, open, onOpenChange }: ResponsesDialogProps) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      comment: '',
      password: '',
      responses: [],
    },
  });

  const saveResponses = useSaveResponses(eventId);

  // responsesの初期化
  useEffect(() => {
    if (open && data.candidates) {
      form.reset({
        ...form.getValues(),
        responses: buildInitialResponses(data.candidates),
      });
    }
  }, [open, data.candidates, form]);

  // 保存に成功したときだけ入力をクリアする。reset は実行順序の都合で onSubmit 内ではなく useEffect で行う
  // isSubmitSuccessful は render 時に読まないと formState の購読が張られず、更新されても再レンダーされない
  const { isSubmitSuccessful } = form.formState;
  useEffect(() => {
    if (isSubmitSuccessful) {
      form.reset();
    }
  }, [isSubmitSuccessful, form]);

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
    } catch (error) {
      const message = '回答の保存に失敗しました。';
      console.error('Failed to create user:', error);
      toast.error(message, { position: 'top-center' });
      // handleSubmit は onSubmit が例外を投げなければ成功扱いにするため、errors を非空にして
      // isSubmitSuccessful を false に保つ。これがないと失敗時も上の reset が走り入力が消える
      form.setError('root.serverError', { message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-[95vw] flex-col overflow-hidden p-0 md:max-w-2xl lg:max-w-6xl">
        <DialogHeader className="shrink-0 p-6 pb-2 text-center">
          <DialogTitle className="text-xl font-black">予定を回答する</DialogTitle>
          <DialogDescription>
            回答者の名前とパスワード、日時毎の予定を入力してください
          </DialogDescription>
        </DialogHeader>

        <Separator className="shrink-0" />

        <form
          id="responses-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 space-y-6 overflow-x-hidden overflow-y-auto p-6"
        >
          <UserInfoFields control={form.control} />
          <Separator />
          <ResponsesFields control={form.control} data={data} />
        </form>

        <DialogFooter className="m-3">
          <DialogClose
            render={
              <Button size="lg" variant="ghost" type="button" onClick={() => form.reset()}>
                キャンセル
              </Button>
            }
          />
          <Button
            size="lg"
            variant="default"
            type="submit"
            form="responses-form"
            disabled={saveResponses.isPending}
          >
            {saveResponses.isPending ? '登録中...' : '登録する'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ResponsesDialog;
