import { Check, Copy, ExternalLink, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

interface EventCreatedDialogProps {
  open: boolean;
  onChangeOpen: (open: boolean) => void;
  eventId: string | null;
}

function EventCreatedDialog({ open, onChangeOpen, eventId }: EventCreatedDialogProps) {
  const router = useRouter();
  const { copied, copy } = useCopyToClipboard();

  const eventUrl = eventId ? `${window.location.origin}/event/${eventId}` : '';

  return (
    <AlertDialog open={open} onOpenChange={onChangeOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>イベントを作成しました</AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            イベントのURLをコピーして参加者に共有するか、一覧ページへ移動してください。
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="bg-muted flex items-center space-x-2 overflow-x-auto rounded-lg border p-3">
          <code className="flex-1 truncate text-xs">{eventUrl}</code>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            aria-label="イベントURLをコピー"
            onClick={() => copy(eventUrl)}
          >
            {copied ? <Check /> : <Copy />}
          </Button>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>
            <X />
            閉じる
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => router.push(`/event/${eventId}`)}>
            <ExternalLink />
            ページへ進む
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default EventCreatedDialog;
