'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldError } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { useUpdatePlanMemo } from '@/features/event-detail/hooks/usePlanMutations';
import { planMemoFormSchema, type PlanMemoFormData } from '@/features/event-detail/schema';
import type { Plan } from '@/features/event-detail/types';

interface PlanMemoFormProps {
  eventId: string;
  plan: Pick<Plan, 'id' | 'memo'>;
}

/**
 * 予定のメモのインライン編集。
 * 予定で後から変えられるのはメモだけなので、ダイアログを開かずその場で編集する。
 */
function PlanMemoForm({ eventId, plan }: PlanMemoFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const updateMemo = useUpdatePlanMemo(eventId);

  const form = useForm<PlanMemoFormData>({
    resolver: zodResolver(planMemoFormSchema),
    defaultValues: { memo: plan.memo },
  });

  useEffect(() => {
    if (isEditing) {
      form.reset({ memo: plan.memo });
      inputRef.current?.focus();
    }
  }, [isEditing, plan.memo, form]);

  const onSubmit = async ({ memo }: PlanMemoFormData) => {
    if (memo === plan.memo) {
      setIsEditing(false);
      return;
    }

    try {
      await updateMemo.mutateAsync({ planId: plan.id, memo });
      setIsEditing(false);
    } catch {
      // 失敗の通知は QueryProvider の MutationCache が行う
    }
  };

  if (!isEditing) {
    return (
      <button
        type="button"
        className="hover:bg-muted/60 text-muted-foreground w-full cursor-text rounded-md px-2 py-1 text-left text-sm wrap-break-word transition-colors"
        onClick={() => setIsEditing(true)}
      >
        {plan.memo || <span className="opacity-60">メモを追加</span>}
      </button>
    );
  }

  const { ref, ...memoField } = form.register('memo');
  const error = form.formState.errors.memo;

  return (
    <Field data-invalid={!!error}>
      <Textarea
        {...memoField}
        ref={(element) => {
          ref(element);
          inputRef.current = element;
        }}
        rows={1}
        className="min-h-8 resize-none py-1 text-sm"
        aria-label="メモ"
        placeholder="場所・持ち物など"
        aria-invalid={!!error}
        disabled={updateMemo.isPending}
        // Enter と focus 外しで保存、Shift+Enter で改行、Esc で編集前に戻す。
        // 1フィールドなので保存ボタンは置かない
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            form.handleSubmit(onSubmit)();
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            // 閉じる際の blur で編集中の値が保存されないよう、先に元の値へ戻す
            form.reset({ memo: plan.memo });
            setIsEditing(false);
          }
        }}
        onBlur={() => form.handleSubmit(onSubmit)()}
      />
      {error && <FieldError errors={[error]} />}
    </Field>
  );
}

export default PlanMemoForm;
