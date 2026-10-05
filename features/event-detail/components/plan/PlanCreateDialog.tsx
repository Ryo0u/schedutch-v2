'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEvent } from '@/features/event-detail/hooks/useEvent';
import { usePlans } from '@/features/event-detail/hooks/usePlans';
import { useCreatePlan } from '@/features/event-detail/hooks/usePlanMutations';
import {
  hasOverlappingPlan,
  listPlanTimeOptions,
  listPlansInCandidate,
} from '@/features/event-detail/lib/plans';
import { planFormSchema, type PlanFormData } from '@/features/event-detail/schema';
import PlanFields from './PlanFields';

interface PlanCreateDialogProps {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PlanCreateDialog({ eventId, open, onOpenChange }: PlanCreateDialogProps) {
  const { data } = useEvent(eventId);
  const { data: plans } = usePlans(eventId);
  const createPlan = useCreatePlan(eventId);

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: { candidateId: '', startTime: '', endTime: '', participants: [] },
  });

  useEffect(() => {
    if (!open) return;

    // 最初の候補日の全時間帯を初期値にする（そこから縮めて使う想定）
    const candidate = data?.candidates[0];
    const options = candidate
      ? listPlanTimeOptions(candidate, listPlansInCandidate(plans ?? [], candidate))
      : null;
    form.reset({
      candidateId: candidate?.id ?? '',
      startTime: options?.startOptions[0]?.value ?? '',
      endTime: options?.endOptions[options.endOptions.length - 1]?.value ?? '',
      participants: [],
    });
    // 候補日は開いている間変わらないため、open のみを見る
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async (values: PlanFormData) => {
    const startMs = new Date(values.startTime).getTime();
    const endMs = new Date(values.endTime).getTime();

    // 重なりは他の予定に依存するのでスキーマではなくここで見る（サーバー側でも再検証される）
    if (hasOverlappingPlan(plans ?? [], startMs, endMs)) {
      form.setError('endTime', { message: '既に登録されている予定と時間が重なっています' });
      return;
    }

    try {
      await createPlan.mutateAsync({
        eventId,
        startTime: values.startTime,
        endTime: values.endTime,
        memo: '',
        userIds: values.participants,
      });

      toast.success('予定を追加しました', { position: 'top-center' });
      onOpenChange(false);
    } catch {
      // 失敗の通知は QueryProvider の MutationCache が行う
    }
  };

  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader className="mb-5">
            <DialogTitle className="flex flex-col items-center justify-center gap-3">
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                <CalendarPlus className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">予定を追加する</span>
            </DialogTitle>
            <DialogDescription className="text-center">
              候補日の時間帯から選べます。メモは追加後に一覧から入力できます
            </DialogDescription>
          </DialogHeader>

          <PlanFields
            control={form.control}
            setValue={form.setValue}
            candidates={data.candidates}
            users={data.users}
            plans={plans ?? []}
          />

          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="outline">
                  キャンセル
                </Button>
              }
            />
            <Button type="submit" disabled={createPlan.isPending}>
              {createPlan.isPending ? '追加中...' : '追加する'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PlanCreateDialog;
