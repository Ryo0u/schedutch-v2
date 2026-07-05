"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/features/event-detail/types";
import { useDeleteUser } from "@/features/event-detail/hooks/useEventMutations";
import { usePasswordConfirm } from "@/features/event-detail/hooks/usePasswordConfirm";

interface UserDeleteDialogProps {
  eventId: string;
  data: {
    user: Pick<User, "id" | "name">;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function UserDeleteDialog({ eventId, data, open, onOpenChange }: UserDeleteDialogProps) {
  const [password, setPassword] = useState("");
  const deleteUser = useDeleteUser(eventId);
  const { isSubmitting, errorMsg, setErrorMsg, run } = usePasswordConfirm();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPassword("");
      setErrorMsg(null);
    }
    onOpenChange(open);
  };

  const handleDelete = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleDelete}>
          <DialogHeader className="mb-5">
            <DialogTitle className="flex flex-col justify-center items-center gap-3 text-destructive">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <Trash2 className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">回答を削除する</span>
            </DialogTitle>
            <DialogDescription className="text-center">
              {data.user.name} さんの回答を削除するための<br/>パスワードを入力してください
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

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline">キャンセル</Button>} />
            <Button type="submit" variant="destructive" disabled={isSubmitting || !password}>
              {isSubmitting ? "削除中..." : "削除する"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UserDeleteDialog;
