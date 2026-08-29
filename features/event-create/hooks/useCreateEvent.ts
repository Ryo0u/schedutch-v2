import { useMutation } from '@tanstack/react-query';
import { createEvent } from '@/features/event-create/api/eventApi';

/** イベントを作成する（作成後は遷移するため invalidate は不要） */
export function useCreateEvent() {
  return useMutation({
    mutationFn: createEvent,
  });
}
