'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import ResponsesForm from './ResponsesForm';
import { type Candidate } from '@/features/event-detail/types';

interface ResponsesDialogProps {
  eventId: string;
  data: {
    candidates: Pick<Candidate, 'id' | 'start_time' | 'end_time'>[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ResponsesDialog({ eventId, data, open, onOpenChange }: ResponsesDialogProps) {
  return (
    // 背景クリックでは閉じない。閉じる操作の扱いは ResponsesForm 側に集約している
    <Dialog open={open} onOpenChange={onOpenChange} disablePointerDismissal>
      <DialogContent className="flex max-h-[90vh] max-w-[95vw] flex-col overflow-hidden p-0 md:max-w-2xl lg:max-w-6xl">
        <DialogHeader className="shrink-0 p-6 pb-2 text-center">
          <DialogTitle className="text-xl font-black">予定を回答する</DialogTitle>
          <DialogDescription>
            回答者の名前とパスワード、日時毎の予定を入力してください
          </DialogDescription>
        </DialogHeader>

        <Separator className="shrink-0" />

        <ResponsesForm eventId={eventId} data={data} onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}

export default ResponsesDialog;
