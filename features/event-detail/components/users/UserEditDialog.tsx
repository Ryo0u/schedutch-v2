"use client"

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import TextField from '@/components/form/TextField';
import TextareaCounterField from '@/components/form/TextareaCounterField';
import ResponsesFields from '../form/ResponsesFields';
import { toast } from 'sonner';
import type { Candidate, User } from '@/features/event-detail/types';
import { useUpdateUser } from '@/features/event-detail/hooks/useEventMutations';
import { toResponseInputs } from '@/features/event-detail/lib/responses';
import { UserEditFormSchema, type UserEditFormData } from '@/features/event-detail/schema';

interface UserEditDialogProps {
  eventId: string;
  data: {
    user: Pick<User, "id" | "name" | "comment" | "responses">;
    candidates: Pick<Candidate, "id" | "start_time" | "end_time">[];
  };
  /** 事前検証済みの平文パスワード。更新 RPC が再検証する */
  password: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function UserEditDialog({ eventId, data, password, open, onOpenChange }: UserEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateUser = useUpdateUser(eventId);

  const form = useForm<UserEditFormData>({
    resolver: zodResolver(UserEditFormSchema),
    defaultValues: { name: "", comment: "", responses: [] },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: data.user.name,
        comment: data.user.comment ?? "",
        responses: data.user.responses.map(r => ({
          candidate_id: r.candidate_id,
          time: new Date(r.time),
          status: r.status,
        })),
      });
    }
  }, [open, data.user.name, data.user.comment, data.user.responses, form]);

  const onSubmit = async (values: UserEditFormData) => {
    setIsSubmitting(true);

    try {
      const formattedResponses = toResponseInputs(values.responses);

      await updateUser.mutateAsync({
        userId: data.user.id,
        password,
        name: values.name,
        comment: values.comment,
        responses: formattedResponses,
      });

      toast.success("回答を更新しました", { position: 'top-center' });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error("更新に失敗しました", { position: 'top-center' });
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-2xl lg:max-w-6xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 text-center shrink-0">
          <DialogTitle className="text-xl font-black">{data.user.name} の回答を編集する</DialogTitle>
          <DialogDescription>
            名前・コメント・回答を編集してください
          </DialogDescription>
        </DialogHeader>

        <Separator className="shrink-0" />

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6"
        >
          <FieldGroup>
            <TextField control={form.control} name="name" label="名前" required />
            <TextareaCounterField control={form.control} name="comment" label="コメント" rows={10} maxLength={30} />
          </FieldGroup>

          <Separator />
          <ResponsesFields control={form.control} data={data} />
        </form>

        <DialogFooter className="m-3">
          <DialogClose render={
            <Button size="lg" variant="ghost" type="button" onClick={() => form.reset()}>キャンセル</Button>
          }/>
          <Button size="lg" type="submit" onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "保存する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UserEditDialog;
