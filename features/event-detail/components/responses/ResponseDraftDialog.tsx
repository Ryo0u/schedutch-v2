'use client';

import { History } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ResponseDraftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 下書きを引き継いで回答ダイアログを開く */
  onRestore: () => void;
  /** 下書きを捨てて、まっさらな状態で回答ダイアログを開く */
  onStartOver: () => void;
}

/**
 * 前回の入力が残っているときに、続きから入力するかを選んでもらう。
 *
 * 黙って復元すると、書き直したい人が一度開いてから破棄する遠回りを強いられるため、
 * 回答ダイアログを開く前に選択させる。
 */
function ResponseDraftDialog({
  open,
  onOpenChange,
  onRestore,
  onStartOver,
}: ResponseDraftDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <History />
          </AlertDialogMedia>
          <AlertDialogTitle>前回の入力が残っています</AlertDialogTitle>
          <AlertDialogDescription>
            続きから入力するか、最初から入力し直すかを選んでください。
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction variant="outline" onClick={onStartOver}>
            最初から入力する
          </AlertDialogAction>
          <AlertDialogAction onClick={onRestore}>続きから入力する</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ResponseDraftDialog;
