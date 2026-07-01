'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import ResponsesForm from './ResponsesForm';
import type { Candidate } from '@/features/event/types';

interface EventCandidatesProps {
  data: {
    candidates: Pick<Candidate, "id" | "start_time" | "end_time">[];
  };
  onSuccess: () => void;
}

export default function JoinButton({ data, onSuccess }: EventCandidatesProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        size="lg"
        className="rounded-full px-8 font-bold"
        onClick={() => setIsOpen(true)}
      >
        予定を回答する
      </Button>

      <ResponsesForm data={data} open={isOpen} onOpenChange={setIsOpen} onSuccess={onSuccess} />
    </>
  );
}
