"use client"

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group';
import InputResponses from '../form/InputResponses';
import { toast } from 'sonner';
import type { Candidate, User } from '@/features/event-detail/types';
import { useUpdateUser } from '@/features/event-detail/hooks/useEventMutations';
import { toResponseInputs } from '@/features/event-detail/lib/responses';
import { UserEditFormSchema, type UserEditFormData } from '@/features/event-detail/schema';

interface UsersEditDialogProps {
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

function UsersEditDialog({ eventId, data, password, open, onOpenChange }: UsersEditDialogProps) {
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
  }, [open]);

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
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>名前<span className="text-destructive">*</span></FieldLabel>
                  <Input {...field} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="comment"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>コメント</FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      rows={10}
                      className="min-h-15 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">{field.value.length}/30</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <Separator />
          <InputResponses control={form.control} data={data} />
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

export default UsersEditDialog;
