"use client"

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '../ui/input-group';
import InputResponses from './InputResponses';
import { UserFormSchema, type UserFormData } from './ResponsesForm';
import { supabase } from '@/utils/supabase/client';
import { toast } from 'sonner';
import bcrypt from 'bcryptjs';
import type { Candidate, User } from '@/lib/types';

interface UsersEditDialogProps {
  data: {
    user: Pick<User, "id" | "name" | "comment" | "password_digest" | "responses">;
    candidates: Pick<Candidate, "id" | "start_time" | "end_time">[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function UsersEditDialog({ data, open, onOpenChange, onSuccess }: UsersEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const form = useForm<UserFormData>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: { name: "", comment: "", password: "", responses: [] },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: data.user.name,
        comment: data.user.comment ?? "",
        password: "",
        responses: data.user.responses.map(r => ({
          candidate_id: r.candidate_id,
          time: new Date(r.time),
          status: r.status,
        })),
      });
      setPasswordError(null);
    }
  }, [open]);

  const onSubmit = async (values: UserFormData) => {
    setIsSubmitting(true);
    setPasswordError(null);

    const isMatch = await bcrypt.compare(values.password, data.user.password_digest);
    if (!isMatch) {
      setPasswordError("パスワードが間違っています");
      setIsSubmitting(false);
      return;
    }

    try {
      const { error: userError } = await supabase
        .from('users')
        .update({ name: values.name, comment: values.comment })
        .eq('id', data.user.id);
      if (userError) throw userError;

      const { error: deleteError } = await supabase
        .from('responses')
        .delete()
        .eq('user_id', data.user.id);
      if (deleteError) throw deleteError;

      const formattedResponses = values.responses.map(r => ({
        user_id: data.user.id,
        candidate_id: r.candidate_id,
        time: r.time.toISOString(),
        status: r.status,
      }));

      const { error: insertError } = await supabase.from('responses').insert(formattedResponses);
      if (insertError) throw insertError;

      toast.success("回答を更新しました", { position: 'top-center' });
      onSuccess?.();
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
          <DialogTitle className="text-xl font-black">回答を編集する</DialogTitle>
          <DialogDescription>
            パスワードを入力し、名前・コメント・回答を編集してください
          </DialogDescription>
        </DialogHeader>

        <Separator className="shrink-0" />

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6"
        >
          <FieldGroup>
            <div className="flex flex-col gap-3 sm:flex-row">
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
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || !!passwordError}>
                    <FieldLabel>パスワード<span className="text-destructive">*</span></FieldLabel>
                    <Input {...field} aria-invalid={fieldState.invalid || !!passwordError} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    {!fieldState.invalid && passwordError && <FieldError errors={[{ message: passwordError }]} />}
                  </Field>
                )}
              />
            </div>
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
