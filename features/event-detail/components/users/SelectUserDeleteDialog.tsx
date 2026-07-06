import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel, FieldSet } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useDeleteUser } from "@/features/event-detail/hooks/useEventMutations";
import { usePasswordConfirm } from "@/features/event-detail/hooks/usePasswordConfirm";
import { useResetOnOpen } from "@/features/event-detail/hooks/useResetOnOpen";
import DeleteDialogShell from "@/features/event-detail/components/shared/DeleteDialogShell";

interface DialogProps {
  eventId: string;
  data: {
    users: {
      id: string;
      name: string;
    }[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SelectUserDeleteDialog({ eventId, data, open, onOpenChange }: DialogProps) {
  const [ password, setPassword ] = useState("");
  const [ userId, setUserId ] = useState("");
  const deleteUser = useDeleteUser(eventId);
  const { isSubmitting, errorMsg, setErrorMsg, run } = usePasswordConfirm();

  useResetOnOpen(open, () => {
    setPassword("");
    setUserId("");
    setErrorMsg(null);
  });

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;

    try {
      const success = await run(() => deleteUser.mutateAsync({ userId, password }));
      if (success) {
        toast.success("参加者を削除しました", {position: 'top-center'})
        onOpenChange(false);
      }
    } catch (error) {
      console.log("failed to delete user", error)
      toast.error("参加者の削除に失敗しました", {position: 'top-center'})
      onOpenChange(false);
    }
  }

  return (
    <DeleteDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="参加者を削除する"
      description={<>編集用パスワードを入力し<br/>削除する参加者を選択してください</>}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitDisabled={!password || !userId}
    >
      <FieldSet className="w-full mb-5">
        <Field data-invalid={!!errorMsg}>
          <FieldLabel>編集用パスワード</FieldLabel>
          <Input
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="......."
            aria-invalid={!!errorMsg}
            />
        </Field>

        <Field data-invalid={!!errorMsg}>
          <FieldLabel >参加者一覧</FieldLabel>
        </Field>

        <RadioGroup value={userId} onValueChange={setUserId}>
          {data.users.length > 0 ? (
            data.users.map((user) => (
              <Field data-invalid={!!errorMsg} orientation="horizontal" key={user.id}>
                <RadioGroupItem value={user.id} id={`user-delete-${user.id}`} aria-invalid={!!errorMsg}/>
                <FieldLabel htmlFor={`user-delete-${user.id}`}>{user.name}</FieldLabel>
              </Field>
            ))
          ): (
            <div className="py-3 text-center border-2 border-dashed rounded-lg bg-muted/20">
              <p className="text-sm text-muted-foreground">
                参加者がまだいません
              </p>
            </div>
          )}
        </RadioGroup>

        {errorMsg && <FieldError errors={[{ message: errorMsg }]}/>}
      </FieldSet>
    </DeleteDialogShell>
  )
}

export default SelectUserDeleteDialog
