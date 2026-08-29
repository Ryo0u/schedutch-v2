'use client';

import { toast } from 'sonner';
import { useDeletePlan } from '@/features/event-detail/hooks/usePlanMutations';
import DeleteDialogShell from '@/features/event-detail/components/shared/DeleteDialogShell';
import { formatPlanDateTimeLabel } from '@/features/event-detail/lib/plans';
import type { Plan } from '@/features/event-detail/types';

interface PlanDeleteDialogProps {
  eventId: string;
  data: { plan: Plan };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PlanDeleteDialog({ eventId, data, open, onOpenChange }: PlanDeleteDialogProps) {
  const deletePlan = useDeletePlan(eventId);
  const { plan } = data;

  const handleDelete = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await deletePlan.mutateAsync(plan.id);
      toast.success('予定を削除しました', { position: 'top-center' });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete plan:', error);
      toast.error('予定の削除に失敗しました', { position: 'top-center' });
    }
  };

  return (
    <DeleteDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="予定を削除する"
      description={
        <>
          {formatPlanDateTimeLabel(plan)} の予定を
          <br />
          削除します。この操作は取り消せません
        </>
      }
      onSubmit={handleDelete}
      isSubmitting={deletePlan.isPending}
    >
      {null}
    </DeleteDialogShell>
  );
}

export default PlanDeleteDialog;
