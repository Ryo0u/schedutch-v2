'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import ResponsesForm from './ResponsesForm';

interface EventCandidatesProps {
  data: {
    candidates: [];
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
