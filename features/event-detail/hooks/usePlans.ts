import { useQuery } from '@tanstack/react-query';
import { getPlans } from '@/features/event-detail/api/planApi';

export const planKeys = {
  all: ['plans'] as const,
  list: (eventId: string) => [...planKeys.all, eventId] as const,
};

/**
 * 開催予定の一覧を取得する。
 *
 * useEvent の結合クエリには含めない。予定を1件保存するたびにイベント全体を
 * 再取得すると useExtractSlots の「データが変わったら抽出結果を破棄」が発火し、
 * 続けて別のブロックを追加できなくなるため、あえて独立した query にしている。
 */
export function usePlans(eventId: string) {
  return useQuery({
    queryKey: planKeys.list(eventId),
    queryFn: () => getPlans(eventId),
    enabled: !!eventId,
  });
}
