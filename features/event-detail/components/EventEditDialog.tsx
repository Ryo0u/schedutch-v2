import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Edit } from "lucide-react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EventEditDialog({ open, onOpenChange }: DialogProps) {
  const [password, setPassword ] = useState<string>("")
  
  const handleSubmit = () => {
    console.log(password)
    onOpenChange(false);
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-5">
            <DialogTitle className="flex flex-col justify-center items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Edit className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">イベントを編集する</span>
            </DialogTitle>
            <DialogDescription className="text-center">編集用パスワードを入力してください</DialogDescription>
          </DialogHeader>
          <Field className="mb-5">
            <Input
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="......."
              />
          </Field>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline">キャンセル</Button>}></DialogClose>
            <Button type="submit">編集に進む</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EventEditDialog