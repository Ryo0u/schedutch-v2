import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { FieldGroup } from '@/components/ui/field';
import TextField from '@/components/form/TextField';
import TextareaCounterField from '@/components/form/TextareaCounterField';
import { Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateEvent } from '@/features/event-detail/hooks/useEventMutations';
import { isPasswordError } from '@/features/event-detail/api/errors';
import { EVENT_COMMENT_MAX_LENGTH } from '@/lib/validation';
import { eventEditFormSchema, type EventEditFormData } from '@/features/event-detail/schema';

interface DialogProps {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: {
    id: string;
    title: string;
    comment: string;
  };
}

function EventEditDialog({ eventId, open, onOpenChange, data }: DialogProps) {
  const updateEvent = useUpdateEvent(eventId);

  const form = useForm<EventEditFormData>({
    resolver: zodResolver(eventEditFormSchema),
    defaultValues: { title: '', comment: '', password: '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({ title: data.title, comment: data.comment ?? '', password: '' });
    }
  }, [open, data.title, data.comment, form]);

  const onSubmit = async (values: EventEditFormData) => {
    try {
      await updateEvent.mutateAsync({
        eventId: data.id,
        password: values.password,
        title: values.title,
        comment: values.comment,
      });

      toast.success('イベントを更新しました', { position: 'top-center' });
      onOpenChange(false);
    } catch (error) {
      if (isPasswordError(error)) {
        form.setError('password', { message: 'パスワードが正しくありません' });
      } else {
        console.error('Failed to update event:', error);
        toast.error('更新に失敗しました', { position: 'top-center' });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader className="mb-5">
            <DialogTitle className="flex flex-col items-center justify-center gap-3">
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                <Edit className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">イベントを編集する</span>
            </DialogTitle>
            <DialogDescription className="text-center">
              タイトル・コメントを編集し、編集用パスワードを入力してください
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="mb-5">
            <TextField control={form.control} name="title" label="タイトル" required />
            <TextareaCounterField
              control={form.control}
              name="comment"
              label="コメント"
              rows={4}
              maxLength={EVENT_COMMENT_MAX_LENGTH}
            />
            <TextField
              control={form.control}
              name="password"
              label="編集用パスワード"
              required
              placeholder="......."
            />
          </FieldGroup>

          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="outline">
                  キャンセル
                </Button>
              }
            ></DialogClose>
            <Button type="submit" disabled={updateEvent.isPending}>
              {updateEvent.isPending ? '保存中...' : '保存する'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EventEditDialog;
