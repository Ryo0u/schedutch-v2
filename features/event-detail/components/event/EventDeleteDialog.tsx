import { Input } from '@/components/ui/input';
import { Field, FieldError } from '@/components/ui/field';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useDeleteEvent } from '@/features/event-detail/hooks/useEventMutations';
import { usePasswordConfirm } from '@/features/event-detail/hooks/usePasswordConfirm';
import DeleteDialogShell from '@/features/event-detail/components/shared/DeleteDialogShell';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: {
    id: string;
  };
}

function EventDeleteDialog({ open, onOpenChange, data }: DialogProps) {
  const router = useRouter();
  const deleteEvent = useDeleteEvent();
  const { password, setPassword, isSubmitting, errorMsg, canSubmit, confirm } = usePasswordConfirm({
    open,
  });

  const handleDelete = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const success = await confirm(() => deleteEvent.mutateAsync({ eventId: data.id, password }));
    if (success) {
      toast.success('イベントを削除しました', { position: 'top-center' });
      router.push('/');
    }
  };

  return (
    <DeleteDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="イベントを削除する"
      description="編集用パスワードを入力してください"
      onSubmit={handleDelete}
      isSubmitting={isSubmitting}
      submitDisabled={!canSubmit}
    >
      <Field className="mb-5">
        <Input
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="......."
          aria-invalid={!!errorMsg}
        />
        {errorMsg && <FieldError errors={[{ message: errorMsg }]} />}
      </Field>
    </DeleteDialogShell>
  );
}

export default EventDeleteDialog;
