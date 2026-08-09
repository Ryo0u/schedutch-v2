'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import ResponsesDialog from './ResponsesDialog';
import { useEvent } from '@/features/event-detail/hooks/useEvent';

interface JoinButtonProps {
  eventId: string;
}

export default function JoinButton({ eventId }: JoinButtonProps) {
  const { data } = useEvent(eventId);
  const [isOpen, setIsOpen] = useState(false);

  if (!data) return null;

  return (
    <>
      <Button size="lg" className="rounded-full px-8 font-bold" onClick={() => setIsOpen(true)}>
        予定を回答する
      </Button>

      <ResponsesDialog eventId={eventId} data={data} open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
