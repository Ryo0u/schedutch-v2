'use client';

import { useCallback, useEffect, useRef } from 'react';
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
import UserInfoFields from '../form/UserInfoFields';
import { Separator } from '@/components/ui/separator';
import ResponsesFields from '../form/ResponsesFields';
import { Button } from '@/components/ui/button';
import { hashPassword } from '@/lib/password';
import { type Candidate } from '@/features/event-detail/types';
import { type UserFormData, userFormSchema } from '@/features/event-detail/schema';
import { useSaveResponses } from '@/features/event-detail/hooks/useEventMutations';
import { buildInitialResponses, toResponseInputs } from '@/features/event-detail/lib/responses';
import { useDirtyCloseGuard } from '@/features/event-detail/hooks/useDirtyCloseGuard';
import { useResponseDraft } from '@/features/event-detail/hooks/useResponseDraft';
import UnsavedChangesDialog from '../shared/UnsavedChangesDialog';
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
  const responseDraft = useResponseDraft(eventId);

  const resetToInitial = useCallback(() => {
    form.reset({
      name: '',
      comment: '',
      password: '',
      responses: buildInitialResponses(data.candidates),
    });
    responseDraft.clear();
  }, [form, data.candidates, responseDraft]);

  // 初期化するのはダイアログを開いた瞬間だけ。開いている間の再レンダーで入力を消さないよう遷移を見る
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (open === wasOpenRef.current) return;
    wasOpenRef.current = open;
    if (!open) return;

    const draft = responseDraft.load(data.candidates.map((candidate) => candidate.id));
    form.reset({
      name: draft?.name ?? '',
      comment: draft?.comment ?? '',
      // パスワードは下書きに残さないため、復元時も入力し直してもらう
      password: '',
      responses: draft?.responses ?? buildInitialResponses(data.candidates),
    });

    if (draft) {
      toast.info('前回の入力を復元しました', {
        position: 'top-center',
        action: { label: '破棄', onClick: resetToInitial },
      });
    }
  }, [open, data.candidates, form, responseDraft, resetToInitial]);

  // 保存に成功したときだけ入力をクリアする。reset は実行順序の都合で onSubmit 内ではなく useEffect で行う
  // isSubmitSuccessful / isDirty は render 時に読まないと formState の購読が張られず、更新されても再レンダーされない
  const { isSubmitSuccessful, isDirty } = form.formState;
  useEffect(() => {
    if (isSubmitSuccessful) {
      form.reset();
    }
  }, [isSubmitSuccessful, form]);

  // 入力が始まってから下書きを保存する。開いただけで下書きを作らないよう isDirty を条件にする
  useEffect(() => {
    if (!open || !isDirty) return;

    const persist = ({ name, comment, responses }: UserFormData) => {
      responseDraft.save({ name, comment, responses });
    };

    // 購読を張る前に isDirty になった変更自体を取りこぼさないよう、一度保存しておく
    persist(form.getValues());

    return form.subscribe({
      formState: { values: true },
      callback: ({ values }) => persist(values),
    });
  }, [open, isDirty, form, responseDraft]);

  const closeGuard = useDirtyCloseGuard({
    isDirty,
    onOpenChange,
    onDiscard: resetToInitial,
  });

  // 閉じても下書きが残るため、× と Esc は確認せずに閉じる（破棄はキャンセルボタンから行う）
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      responseDraft.flush();
    }

    onOpenChange(nextOpen);
  };

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

      responseDraft.clear();
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
    <Dialog open={open} onOpenChange={handleOpenChange} disablePointerDismissal>
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
          <Button size="lg" variant="ghost" type="button" onClick={closeGuard.requestClose}>
            キャンセル
          </Button>
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

        <UnsavedChangesDialog {...closeGuard.confirm} />
      </DialogContent>
    </Dialog>
  );
}

export default ResponsesDialog;
