import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel, FieldSet } from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useDeleteUser } from '@/features/event-detail/hooks/useEventMutations';
import { usePasswordConfirm } from '@/features/event-detail/hooks/usePasswordConfirm';
import { useResetOnClose } from '@/features/event-detail/hooks/useResetOnClose';
import DeleteDialogShell from '@/features/event-detail/components/shared/DeleteDialogShell';

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

function UserDeletePickerDialog({ eventId, data, open, onOpenChange }: DialogProps) {
  const [userId, setUserId] = useState('');
  const deleteUser = useDeleteUser(eventId);
  const { password, setPassword, isSubmitting, errorMsg, confirm } = usePasswordConfirm({
    open,
    errorMessage: '参加者の削除に失敗しました',
  });

  useResetOnClose(open, () => setUserId(''));

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;

    const success = await confirm(() => deleteUser.mutateAsync({ userId, password }));
    if (success) {
      toast.success('参加者を削除しました', { position: 'top-center' });
      onOpenChange(false);
    }
  };

  return (
    <DeleteDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="参加者を削除する"
      description={
        <>
          編集用パスワードを入力し
          <br />
          削除する参加者を選択してください
        </>
      }
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitDisabled={!password || !userId}
    >
      <FieldSet className="mb-5 w-full">
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
          <FieldLabel>参加者一覧</FieldLabel>
        </Field>

        <RadioGroup value={userId} onValueChange={setUserId}>
          {data.users.length > 0 ? (
            data.users.map((user) => (
              <Field data-invalid={!!errorMsg} orientation="horizontal" key={user.id}>
                <RadioGroupItem
                  value={user.id}
                  id={`user-delete-${user.id}`}
                  aria-invalid={!!errorMsg}
                />
                <FieldLabel htmlFor={`user-delete-${user.id}`}>{user.name}</FieldLabel>
              </Field>
            ))
          ) : (
            <div className="bg-muted/20 rounded-lg border-2 border-dashed py-3 text-center">
              <p className="text-muted-foreground text-sm">参加者がまだいません</p>
            </div>
          )}
        </RadioGroup>

        {errorMsg && <FieldError errors={[{ message: errorMsg }]} />}
      </FieldSet>
    </DeleteDialogShell>
  );
}

export default UserDeletePickerDialog;
