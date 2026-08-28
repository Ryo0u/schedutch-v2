import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateEvent, deleteEvent } from '@/features/event-detail/api/eventApi';
import {
  saveUserResponses,
  updateUserWithResponses,
  deleteUser,
} from '@/features/event-detail/api/userApi';
import { eventKeys } from './useEvent';

/** 成功後に該当イベントの再取得（invalidate）を行う mutation の定型をまとめる */
function useEventMutation<TData, TVariables>(
  eventId: string,
  mutationFn: UseMutationOptions<TData, unknown, TVariables>['mutationFn'],
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
    },
  });
}

/** 参加者と回答を新規保存し、成功後にイベントを再取得する */
export function useSaveResponses(eventId: string) {
  return useEventMutation(eventId, saveUserResponses);
}

/** 参加者情報・回答を更新し、成功後にイベントを再取得する */
export function useUpdateUser(eventId: string) {
  return useEventMutation(eventId, updateUserWithResponses);
}

/** イベント情報を更新し、成功後にイベントを再取得する */
export function useUpdateEvent(eventId: string) {
  return useEventMutation(eventId, updateEvent);
}

/** 参加者を削除し、成功後にイベントを再取得する */
export function useDeleteUser(eventId: string) {
  return useEventMutation(eventId, ({ userId, password }: { userId: string; password: string }) =>
    deleteUser(userId, password),
  );
}

/** イベントを削除する（削除後は画面遷移するため invalidate は不要） */
export function useDeleteEvent() {
  return useMutation({
    mutationFn: ({ eventId, password }: { eventId: string; password: string }) =>
      deleteEvent(eventId, password),
  });
}
