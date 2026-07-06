"use client"

import { useState } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { User } from "@/features/event-detail/types";
import { useDeleteUser } from "@/features/event-detail/hooks/useEventMutations";
import { usePasswordConfirm } from "@/features/event-detail/hooks/usePasswordConfirm";
import { useResetOnOpen } from "@/features/event-detail/hooks/useResetOnOpen";
import DeleteDialogShell from "@/features/event-detail/components/shared/DeleteDialogShell";

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

  useResetOnOpen(open, () => {
    setPassword("");
    setErrorMsg(null);
  });

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
    <DeleteDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="回答を削除する"
      description={<>{data.user.name} さんの回答を削除するための<br/>パスワードを入力してください</>}
      onSubmit={handleDelete}
      isSubmitting={isSubmitting}
      submitDisabled={!password}
    >
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
    </DeleteDialogShell>
  );
}

export default UserDeleteDialog;
