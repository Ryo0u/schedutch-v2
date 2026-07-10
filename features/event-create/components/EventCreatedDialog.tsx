import { Check, Copy, ExternalLink, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from 'next/navigation';

interface EventCreatedDialogProps {
  open: boolean;
  onChangeOpen: (open: boolean) => void;
  eventId: string | null;
}

function EventCreatedDialog({ open, onChangeOpen, eventId}: EventCreatedDialogProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  
  const eventUrl = eventId ? `${window.location.origin}/event/${eventId}` : "";
    
  const handleCopy = () => {
    if (!eventUrl) return;
    navigator.clipboard.writeText(eventUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };
  
  return (
    <AlertDialog open={open} onOpenChange={onChangeOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>イベントを作成しました</AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            イベントのURLをコピーして参加者に共有するか、一覧ページへ移動してください。
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex items-center space-x-2 bg-muted p-3 rounded-lg border overflow-x-auto">
          <code className="text-xs flex-1 truncate">{eventUrl}</code>
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleCopy}>
            {copied ? <Check/> : <Copy/>}
          </Button>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>
            <X/>閉じる
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => router.push(`/event/${eventId}`)}>
            <ExternalLink/>ページへ進む
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default EventCreatedDialog