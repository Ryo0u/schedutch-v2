import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Field, FieldError } from "@/components/ui/field";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { useDeleteEvent } from "@/features/event-detail/hooks/useEventMutations";
import { usePasswordConfirm } from "@/features/event-detail/hooks/usePasswordConfirm";
import { useResetOnClose } from "@/features/event-detail/hooks/useResetOnClose";
import DeleteDialogShell from "@/features/event-detail/components/shared/DeleteDialogShell";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: {
    id: string;
  }
}

function EventDeleteDialog({ open, onOpenChange, data }: DialogProps) {
  const [ password, setPassword ] = useState<string>("");
  const router = useRouter();
  const deleteEvent = useDeleteEvent();
  const { isSubmitting, errorMsg, setErrorMsg, run } = usePasswordConfirm();

  useResetOnClose(open, () => {
    setPassword("");
    setErrorMsg(null);
  });

  const handleDelete = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const success = await run(() => deleteEvent.mutateAsync({ eventId: data.id, password }));
      if (success) {
        toast.success("イベントを削除しました", {position: 'top-center'})
        router.push("/")
      }
    } catch (error) {
      console.error("failed to delete event", error)
      toast.error("イベントの削除に失敗しました", {position: 'top-center'})
    }
  }

  return (
    <DeleteDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="イベントを削除する"
      description="編集用パスワードを入力してください"
      onSubmit={handleDelete}
      isSubmitting={isSubmitting}
    >
      <Field className="mb-5">
        <Input
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="......."
          aria-invalid={!!errorMsg}
        />
        {errorMsg && <FieldError errors={[{ message: errorMsg }]}/>}
      </Field>
    </DeleteDialogShell>
  )
}

export default EventDeleteDialog