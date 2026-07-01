import { useQuery } from "@tanstack/react-query";
import { getEvent } from "@/features/event-detail/api/eventApi";

export const eventKeys = {
  all: ["events"] as const,
  detail: (eventId: string) => [...eventKeys.all, eventId] as const,
};

/** イベント詳細（候補日・参加者・回答を含む）を取得する */
export function useEvent(eventId: string) {
  return useQuery({
    queryKey: eventKeys.detail(eventId),
    queryFn: () => getEvent(eventId),
    enabled: !!eventId,
  });
}
