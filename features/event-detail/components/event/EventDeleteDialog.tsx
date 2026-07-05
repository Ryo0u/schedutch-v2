import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldError } from "@/components/ui/field";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { useDeleteEvent } from "@/features/event-detail/hooks/useEventMutations";
import { isPasswordError } from "@/features/event-detail/api/eventApi";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: {
    id: string;
  }
}

function EventDeleteDialog({ open, onOpenChange, data }: DialogProps) {
  const [ password, setPassword ] = useState<string>("");
  const [ isDeleting, setIsDeleting ] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const deleteEvent = useDeleteEvent();
  
  useEffect(() => {
    if (!open) {
      // ダイアログが閉じられたら、ステートを初期値に戻す
      setPassword("");
      setErrorMsg(null);
      setIsDeleting(false);
    }
  }, [open]);
  
  const handleDelete = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDeleting(true);
    setErrorMsg(null);

    try {
      await deleteEvent.mutateAsync({ eventId: data.id, password });

      toast.success("イベントを削除しました", {position: 'top-center'})
      router.push("/")
    } catch (error) {
      if (isPasswordError(error)) {
        setErrorMsg("パスワードが正しくありません");
      } else {
        toast.error("イベントの削除に失敗しました", {position: 'top-center'})
        console.log("failed to delete event", error)
        onOpenChange(false);
      }
    }

    setIsDeleting(false);
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
            <Button type="submit" variant="destructive" disabled={isDeleting}>{isDeleting ? "削除中..." : "削除する"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EventDeleteDialog