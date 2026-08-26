'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import TextField from '@/components/form/TextField';
import TextareaCounterField from '@/components/form/TextareaCounterField';
import ResponsesFields from '../form/ResponsesFields';
import UnsavedChangesDialog from '../shared/UnsavedChangesDialog';
import { useDirtyCloseGuard } from '@/features/event-detail/hooks/useDirtyCloseGuard';
import { toast } from 'sonner';
import type { Candidate, User } from '@/features/event-detail/types';
import { useUpdateUser } from '@/features/event-detail/hooks/useEventMutations';
import { toResponseInputs } from '@/features/event-detail/lib/responses';
import { userEditFormSchema, type UserEditFormData } from '@/features/event-detail/schema';
import { COMMENT_MAX_LENGTH } from '@/lib/validation';

interface UserEditDialogProps {
  eventId: string;
  data: {
    user: Pick<User, 'id' | 'name' | 'comment' | 'responses'>;
    candidates: Pick<Candidate, 'id' | 'start_time' | 'end_time'>[];
  };
  /** 事前検証済みの平文パスワード。更新 RPC が再検証する */
  password: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function UserEditDialog({ eventId, data, password, open, onOpenChange }: UserEditDialogProps) {
  const updateUser = useUpdateUser(eventId);

  const form = useForm<UserEditFormData>({
    resolver: zodResolver(userEditFormSchema),
    defaultValues: { name: '', comment: '', responses: [] },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: data.user.name,
        comment: data.user.comment ?? '',
        responses: data.user.responses.map((r) => ({
          candidate_id: r.candidate_id,
          time: new Date(r.time),
          status: r.status,
        })),
      });
    }
  }, [open, data.user.name, data.user.comment, data.user.responses, form]);

  // isDirty は render 時に読まないと formState の購読が張られず、更新されても再レンダーされない
  const { isDirty } = form.formState;
  const closeGuard = useDirtyCloseGuard({
    isDirty,
    onOpenChange,
    onDiscard: () => form.reset(),
  });

  const onSubmit = async (values: UserEditFormData) => {
    try {
      const formattedResponses = toResponseInputs(values.responses);

      await updateUser.mutateAsync({
        userId: data.user.id,
        password,
        name: values.name,
        comment: values.comment,
        responses: formattedResponses,
      });

      toast.success('回答を更新しました', { position: 'top-center' });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('更新に失敗しました', { position: 'top-center' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={closeGuard.handleOpenChange} disablePointerDismissal>
      <DialogContent className="flex max-h-[90vh] max-w-[95vw] flex-col overflow-hidden p-0 md:max-w-2xl lg:max-w-6xl">
        <DialogHeader className="shrink-0 p-6 pb-2 text-center">
          <DialogTitle className="text-xl font-black">
            {data.user.name} の回答を編集する
          </DialogTitle>
          <DialogDescription>名前・コメント・回答を編集してください</DialogDescription>
        </DialogHeader>

        <Separator className="shrink-0" />

        <form
          id="user-edit-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 space-y-6 overflow-x-hidden overflow-y-auto p-6"
        >
          <FieldGroup>
            <TextField control={form.control} name="name" label="名前" required />
            <TextareaCounterField
              control={form.control}
              name="comment"
              label="コメント"
              rows={10}
              maxLength={COMMENT_MAX_LENGTH}
            />
          </FieldGroup>

          <Separator />
          <ResponsesFields control={form.control} data={data} />
        </form>

        <DialogFooter className="m-3">
          <Button size="lg" variant="ghost" type="button" onClick={closeGuard.requestClose}>
            キャンセル
          </Button>
          <Button size="lg" type="submit" form="user-edit-form" disabled={updateUser.isPending}>
            {updateUser.isPending ? '保存中...' : '保存する'}
          </Button>
        </DialogFooter>

        <UnsavedChangesDialog {...closeGuard.confirm} />
      </DialogContent>
    </Dialog>
  );
}

export default UserEditDialog;
