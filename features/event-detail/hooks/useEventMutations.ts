import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateEvent, deleteEvent } from '@/features/event-detail/api/eventApi';
import {
  saveUserResponses,
  updateUserWithResponses,
  deleteUser,
} from '@/features/event-detail/api/userApi';
import { eventKeys } from './useEvent';
import { planKeys } from './usePlans';

/**
 * 成功後に該当イベントの再取得（invalidate）を行う mutation の定型をまとめる。
 * errorMessage は失敗時のトースト文言（通知は QueryProvider の MutationCache が行う）
 */
function useEventMutation<TData, TVariables>(
  eventId: string,
  mutationFn: UseMutationOptions<TData, unknown, TVariables>['mutationFn'],
  errorMessage: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    meta: { errorMessage },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
    },
  });
}

/** 参加者と回答を新規保存し、成功後にイベントを再取得する */
export function useSaveResponses(eventId: string) {
  return useEventMutation(eventId, saveUserResponses, '回答の保存に失敗しました');
}

/** 参加者情報・回答を更新し、成功後にイベントを再取得する */
export function useUpdateUser(eventId: string) {
  return useEventMutation(eventId, updateUserWithResponses, '回答の更新に失敗しました');
}

/** イベント情報を更新し、成功後にイベントを再取得する */
export function useUpdateEvent(eventId: string) {
  return useEventMutation(eventId, updateEvent, 'イベントの更新に失敗しました');
}

/**
 * 参加者を削除し、成功後にイベントと予定を再取得する。
 * 参加者を消すと plan_participants も CASCADE で消えるため、
 * 別 query になっている予定一覧も invalidate しないと消えたメンバーが残って見える。
 */
export function useDeleteUser(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, password }: { userId: string; password: string }) =>
      deleteUser(userId, password),
    meta: { errorMessage: '参加者の削除に失敗しました' },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: planKeys.list(eventId) });
    },
  });
}

/** イベントを削除する（削除後は画面遷移するため invalidate は不要） */
export function useDeleteEvent() {
  return useMutation({
    mutationFn: ({ eventId, password }: { eventId: string; password: string }) =>
      deleteEvent(eventId, password),
    meta: { errorMessage: 'イベントの削除に失敗しました' },
  });
}
