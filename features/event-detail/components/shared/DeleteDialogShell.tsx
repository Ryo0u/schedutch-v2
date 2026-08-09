import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';

interface DeleteDialogShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  submitDisabled?: boolean;
  children: React.ReactNode;
}

function DeleteDialogShell({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  isSubmitting,
  submitDisabled,
  children,
}: DeleteDialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader className="mb-5">
            <DialogTitle className="text-destructive flex flex-col items-center justify-center gap-3">
              <div className="bg-destructive/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <Trash2 className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">{title}</span>
            </DialogTitle>
            <DialogDescription className="text-center">{description}</DialogDescription>
          </DialogHeader>

          {children}

          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="outline">
                  キャンセル
                </Button>
              }
            />
            <Button type="submit" variant="destructive" disabled={isSubmitting || submitDisabled}>
              {isSubmitting ? '削除中...' : '削除する'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteDialogShell;
