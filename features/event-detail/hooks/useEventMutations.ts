import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  saveUserResponses,
  updateUserWithResponses,
  updateEvent,
  deleteUser,
  deleteEvent,
} from "@/features/event-detail/api/eventApi";
import { eventKeys } from "./useEvent";

/** 参加者と回答を新規保存し、成功後にイベントを再取得する */
export function useSaveResponses(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveUserResponses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
    },
  });
}

/** 参加者情報・回答を更新し、成功後にイベントを再取得する */
export function useUpdateUser(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUserWithResponses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
    },
  });
}

/** イベント情報を更新し、成功後にイベントを再取得する */
export function useUpdateEvent(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
    },
  });
}

/** 参加者を削除し、成功後にイベントを再取得する */
export function useDeleteUser(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, password }: { userId: string; password: string }) =>
      deleteUser(userId, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
    },
  });
}

/** イベントを削除する（削除後は画面遷移するため invalidate は不要） */
export function useDeleteEvent() {
  return useMutation({
    mutationFn: ({ eventId, password }: { eventId: string; password: string }) =>
      deleteEvent(eventId, password),
  });
}
