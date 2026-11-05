'use client';

import { TriangleAlert } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EventDeleteWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userCount: number;
  onProceed: () => void;
}

/**
 * パスワード入力（EventDeleteDialog）の前に出す警告。
 * イベントパスワードを事前照合する RPC がないため、警告を先に出して
 * 「最後の確認を押した後にパスワード不一致が分かる」順序を避けている。
 */
function EventDeleteWarningDialog({
  open,
  onOpenChange,
  userCount,
  onProceed,
}: EventDeleteWarningDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <TriangleAlert />
          </AlertDialogMedia>
          <AlertDialogTitle>イベントを削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            {userCount > 0
              ? `回答済み ${userCount}人分の回答も含めてすべて削除され、元には戻せません。`
              : 'イベントはすべて削除され、元には戻せません。'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onProceed}>
            削除に進む
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default EventDeleteWarningDialog;
