import { useState } from 'react';
import type { Plan } from '@/features/event-detail/types';

/**
 * PlanSection の作成・削除ダイアログの開閉状態。
 * メモの編集はインラインで行うため、編集ダイアログは持たない。
 */
export function usePlanDialogs() {
  const [createOpen, setCreateOpen] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const startDelete = (plan: Plan) => {
    setDeletingPlan(plan);
    setDeleteOpen(true);
  };

  return {
    startCreate: () => setCreateOpen(true),
    startDelete,
    createPlan: { open: createOpen, onOpenChange: setCreateOpen },
    deletePlan: {
      plan: deletingPlan,
      open: deleteOpen,
      onOpenChange: (open: boolean) => {
        setDeleteOpen(open);
        if (!open) setDeletingPlan(null);
      },
    },
  };
}
