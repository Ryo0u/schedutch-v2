import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createPlan, updatePlanMemo, deletePlan } from '@/features/event-detail/api/planApi';
import { planKeys } from './usePlans';

/**
 * 成功後に予定一覧の再取得（invalidate）を行う mutation の定型をまとめる。
 * errorMessage は失敗時のトースト文言（通知は QueryProvider の MutationCache が行う）
 */
function usePlanMutation<TData, TVariables>(
  eventId: string,
  mutationFn: UseMutationOptions<TData, unknown, TVariables>['mutationFn'],
  errorMessage: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    meta: { errorMessage },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.list(eventId) });
    },
  });
}

/** 予定を作成し、成功後に予定一覧を再取得する */
export function useCreatePlan(eventId: string) {
  return usePlanMutation(eventId, createPlan, '予定の追加に失敗しました');
}

/** 予定のメモを更新し、成功後に予定一覧を再取得する */
export function useUpdatePlanMemo(eventId: string) {
  return usePlanMutation(eventId, updatePlanMemo, 'メモの保存に失敗しました');
}

/** 予定を削除し、成功後に予定一覧を再取得する */
export function useDeletePlan(eventId: string) {
  return usePlanMutation(
    eventId,
    (planId: string) => deletePlan(planId),
    '予定の削除に失敗しました',
  );
}
