"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { User } from "@/features/event-detail/types";
import { useDeleteUser } from "@/features/event-detail/hooks/useEventMutations";
import { usePasswordConfirm } from "@/features/event-detail/hooks/usePasswordConfirm";
import { createPasswordMismatchError, verifyUserPassword } from "@/features/event-detail/api/eventApi";

interface UsersPasswordDialogProps {
  eventId: string;
  data: {
    user: Pick<User, "id" | "name">;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 検証済みの平文パスワードを親へ渡す（編集ダイアログでの再検証に使う） */
  onConfirm: (password: string) => void;
}

function UsersPasswordDialog({ eventId, data, open, onOpenChange, onConfirm }: UsersPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const deleteUser = useDeleteUser(eventId);
  const { isSubmitting, errorMsg, setErrorMsg, run } = usePasswordConfirm();

  // 編集ダイアログを開く前にサーバー側で事前検証する
  const handleEdit = async () => {
    try {
      const success = await run(async () => {
        const isMatch = await verifyUserPassword(data.user.id, password);
        if (!isMatch) throw createPasswordMismatchError();
      });
      if (success) onConfirm(password);
    } catch {
      toast.error("確認に失敗しました", { position: "top-center" });
    }
  };

  // 削除は RPC 内で照合し、不一致なら例外を投げる
  const handleDelete = async () => {
    try {
      const success = await run(() => deleteUser.mutateAsync({ userId: data.user.id, password }));
      if (success) {
        toast.success("回答を削除しました", { position: "top-center" });
        onOpenChange(false);
      }
    } catch {
      toast.error("削除に失敗しました", { position: "top-center" });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPassword("");
      setErrorMsg(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }}>
          <DialogHeader className="mb-5">
            <DialogTitle className="text-center text-xl font-bold">パスワードを確認</DialogTitle>
            <DialogDescription className="text-center">
              {data.user.name} さんの回答を編集・削除するための<br/>パスワードを入力してください
            </DialogDescription>
          </DialogHeader>

          <Field className="mb-5" data-invalid={!!errorMsg}>
            <FieldLabel>パスワード</FieldLabel>
            <Input
              autoFocus
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrorMsg(null); }}
              aria-invalid={!!errorMsg}
            />
            {errorMsg && <FieldError errors={[{ message: errorMsg }]} />}
          </Field>

          <DialogFooter className="flex-row justify-between sm:justify-between">
            <Button
              type="button"
              variant="destructive"
              disabled={isSubmitting || !password}
              onClick={handleDelete}
            >
              削除する
            </Button>
            <div className="flex gap-2">
              <DialogClose render={<Button type="button" variant="outline">キャンセル</Button>} />
              <Button type="submit" disabled={isSubmitting || !password}>
                {isSubmitting ? "確認中..." : "編集する"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UsersPasswordDialog;
