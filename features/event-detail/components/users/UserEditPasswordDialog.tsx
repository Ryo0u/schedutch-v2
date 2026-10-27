'use client';

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
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { User } from '@/features/event-detail/types';
import { useVerifyUserPassword } from '@/features/event-detail/hooks/useVerifyUserPassword';
import { usePasswordConfirm } from '@/features/event-detail/hooks/usePasswordConfirm';

interface UserEditPasswordDialogProps {
  data: {
    user: Pick<User, 'id' | 'name'>;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 検証済みの平文パスワードを親へ渡す（編集ダイアログでの再検証に使う） */
  onConfirm: (password: string) => void;
}

function UserEditPasswordDialog({
  data,
  open,
  onOpenChange,
  onConfirm,
}: UserEditPasswordDialogProps) {
  const verifyPassword = useVerifyUserPassword();
  const { password, setPassword, isSubmitting, errorMsg, canSubmit, confirm } = usePasswordConfirm({
    open,
  });

  // 編集ダイアログを開く前にサーバー側で事前検証する
  const handleEdit = async () => {
    const success = await confirm(() =>
      verifyPassword.mutateAsync({ userId: data.user.id, password }),
    );
    if (success) onConfirm(password);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEdit();
          }}
        >
          <DialogHeader className="mb-5">
            <DialogTitle className="text-center text-xl font-bold">パスワードを確認</DialogTitle>
            <DialogDescription className="text-center">
              {data.user.name} さんの回答を編集するための
              <br />
              パスワードを入力してください
            </DialogDescription>
          </DialogHeader>

          <Field className="mb-5" data-invalid={!!errorMsg}>
            <FieldLabel>パスワード</FieldLabel>
            <Input
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errorMsg}
            />
            {errorMsg && <FieldError errors={[{ message: errorMsg }]} />}
          </Field>

          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="outline">
                  キャンセル
                </Button>
              }
            />
            <Button type="submit" disabled={isSubmitting || !canSubmit}>
              {isSubmitting ? '確認中...' : '編集する'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UserEditPasswordDialog;
