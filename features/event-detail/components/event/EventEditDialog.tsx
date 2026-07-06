import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import { useUpdateEvent } from "@/features/event-detail/hooks/useEventMutations";
import { isPasswordError } from "@/features/event-detail/api/errors";
import { EventEditFormSchema, type EventEditFormData } from "@/features/event-detail/schema";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateEvent = useUpdateEvent(eventId);

  const form = useForm<EventEditFormData>({
    resolver: zodResolver(EventEditFormSchema),
    defaultValues: { title: "", comment: "", password: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ title: data.title, comment: data.comment ?? "", password: "" });
    }
  }, [open]);

  const onSubmit = async (values: EventEditFormData) => {
    setIsSubmitting(true);

    try {
      await updateEvent.mutateAsync({
        eventId: data.id,
        password: values.password,
        title: values.title,
        comment: values.comment,
      });

      toast.success("イベントを更新しました", { position: "top-center" });
      onOpenChange(false);
    } catch (error) {
      if (isPasswordError(error)) {
        form.setError("password", { message: "パスワードが正しくありません" });
      } else {
        console.error("Failed to update event:", error);
        toast.error("更新に失敗しました", { position: "top-center" });
      }
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader className="mb-5">
            <DialogTitle className="flex flex-col justify-center items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Edit className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">イベントを編集する</span>
            </DialogTitle>
            <DialogDescription className="text-center">タイトル・コメントを編集し、編集用パスワードを入力してください</DialogDescription>
          </DialogHeader>

          <FieldGroup className="mb-5">
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>タイトル<span className="text-destructive">*</span></FieldLabel>
                  <Input {...field} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="comment"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>コメント</FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      rows={4}
                      className="min-h-15 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">{field.value.length}/30</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>編集用パスワード<span className="text-destructive">*</span></FieldLabel>
                  <Input {...field} placeholder="......." aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline">キャンセル</Button>}></DialogClose>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "保存中..." : "保存する"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EventEditDialog;
