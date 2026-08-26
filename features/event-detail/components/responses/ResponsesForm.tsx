'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import UserInfoFields from '../form/UserInfoFields';
import ResponsesFields from '../form/ResponsesFields';
import UnsavedChangesDialog from '../shared/UnsavedChangesDialog';
import { hashPassword } from '@/lib/password';
import { type Candidate } from '@/features/event-detail/types';
import { type UserFormData, userFormSchema } from '@/features/event-detail/schema';
import { useSaveResponses } from '@/features/event-detail/hooks/useEventMutations';
import { buildInitialResponses, toResponseInputs } from '@/features/event-detail/lib/responses';
import { useDirtyCloseGuard } from '@/features/event-detail/hooks/useDirtyCloseGuard';
import { useResponseDraft } from '@/features/event-detail/hooks/useResponseDraft';
import { toast } from 'sonner';

interface ResponsesFormProps {
  eventId: string;
  data: {
    candidates: Pick<Candidate, 'id' | 'start_time' | 'end_time'>[];
  };
  onOpenChange: (open: boolean) => void;
}

/**
 * 回答ダイアログの中身。
 *
 * Base UI はダイアログを閉じるとこのツリーを破棄するため、開くたびにマウントされる。
 * おかげで入力の初期化は defaultValues だけで済み、open の遷移を監視する必要がない。
 */
function ResponsesForm({ eventId, data, onOpenChange }: ResponsesFormProps) {
  const saveResponses = useSaveResponses(eventId);
  const responseDraft = useResponseDraft(eventId);

  // マウント時に一度だけ読む。再レンダーのたびに sessionStorage を読み直さない
  const [restoredDraft] = useState(() =>
    responseDraft.load(data.candidates.map((candidate) => candidate.id)),
  );

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: restoredDraft?.name ?? '',
      comment: restoredDraft?.comment ?? '',
      // パスワードは下書きに残さないため、復元時も入力し直してもらう
      password: '',
      responses: restoredDraft?.responses ?? buildInitialResponses(data.candidates),
    },
  });

  const resetToInitial = useCallback(() => {
    form.reset({
      name: '',
      comment: '',
      password: '',
      responses: buildInitialResponses(data.candidates),
    });
    responseDraft.clear();
  }, [form, data.candidates, responseDraft]);

  // isDirty は render 時に読まないと formState の購読が張られず、更新されても再レンダーされない
  const { isDirty } = form.formState;

  // 入力が始まってから下書きを保存する。開いただけで下書きを作らないよう isDirty を条件にする
  useEffect(() => {
    if (!isDirty) return;

    const persist = ({ name, comment, responses }: UserFormData) => {
      responseDraft.save({ name, comment, responses });
    };

    // 購読を張る前に isDirty になった変更自体を取りこぼさないよう、一度保存しておく
    persist(form.getValues());

    return form.subscribe({
      formState: { values: true },
      callback: ({ values }) => persist(values),
    });
  }, [isDirty, form, responseDraft]);

  const closeGuard = useDirtyCloseGuard({
    isDirty,
    onOpenChange,
    onDiscard: resetToInitial,
  });

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
      console.error('Failed to create user:', error);
      toast.error('回答の保存に失敗しました。', { position: 'top-center' });
    }
  };

  return (
    <>
      <form
        id="responses-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex-1 space-y-6 overflow-x-hidden overflow-y-auto p-6"
      >
        <UserInfoFields control={form.control} />
        <Separator />
        <ResponsesFields control={form.control} data={data} />
      </form>

      {/* 閉じても入力が消えないことを、閉じる前に伝える */}
      {isDirty && (
        <p className="text-muted-foreground flex items-center justify-center gap-1.5 px-6 text-xs sm:justify-end">
          <Check className="size-3.5" />
          入力内容は自動で保存されます
        </p>
      )}

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
    </>
  );
}

export default ResponsesForm;
