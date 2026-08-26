'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import ResponsesDialog from './ResponsesDialog';
import ResponseDraftDialog from './ResponseDraftDialog';
import { useEvent } from '@/features/event-detail/hooks/useEvent';
import { useResponseDraft } from '@/features/event-detail/hooks/useResponseDraft';

interface JoinButtonProps {
  eventId: string;
}

export default function JoinButton({ eventId }: JoinButtonProps) {
  const { data } = useEvent(eventId);
  const responseDraft = useResponseDraft(eventId);
  const [isOpen, setIsOpen] = useState(false);
  const [isDraftPromptOpen, setIsDraftPromptOpen] = useState(false);

  if (!data) return null;

  // 下書きが残っているときだけ、復元するかを先に選んでもらう
  const handleJoin = () => {
    const hasDraft = responseDraft.load(data.candidates.map((candidate) => candidate.id)) !== null;

    if (hasDraft) {
      setIsDraftPromptOpen(true);
      return;
    }

    setIsOpen(true);
  };

  const handleRestore = () => {
    setIsDraftPromptOpen(false);
    setIsOpen(true);
  };

  const handleStartOver = () => {
    responseDraft.clear();
    setIsDraftPromptOpen(false);
    setIsOpen(true);
  };

  return (
    <>
      <Button size="lg" className="rounded-full px-8 font-bold" onClick={handleJoin}>
        予定を回答する
      </Button>

      <ResponseDraftDialog
        open={isDraftPromptOpen}
        onOpenChange={setIsDraftPromptOpen}
        onRestore={handleRestore}
        onStartOver={handleStartOver}
      />

      <ResponsesDialog eventId={eventId} data={data} open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
