import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldError } from "@/components/ui/field";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { useDeleteEvent } from "@/features/event-detail/hooks/useEventMutations";
import { usePasswordConfirm } from "@/features/event-detail/hooks/usePasswordConfirm";

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

  useEffect(() => {
    if (!open) {
      // ダイアログが閉じられたら、ステートを初期値に戻す
      setPassword("");
      setErrorMsg(null);
    }
  }, [open, setErrorMsg]);

  const handleDelete = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const success = await run(() => deleteEvent.mutateAsync({ eventId: data.id, password }));
      if (success) {
        toast.success("イベントを削除しました", {position: 'top-center'})
        router.push("/")
      }
    } catch (error) {
      toast.error("イベントの削除に失敗しました", {position: 'top-center'})
      console.log("failed to delete event", error)
      onOpenChange(false);
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleDelete}>
          <DialogHeader className="mb-5">
            <DialogTitle className="flex flex-col justify-center items-center gap-3 text-destructive">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <Trash2 className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">イベントを削除する</span>
            </DialogTitle>
            <DialogDescription className="text-center">編集用パスワードを入力してください</DialogDescription>
          </DialogHeader>
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
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline">キャンセル</Button>}></DialogClose>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>{isSubmitting ? "削除中..." : "削除する"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EventDeleteDialog