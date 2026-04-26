import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "../ui/dialog";
import { Input } from "../ui/input";
import { Field } from "../ui/field";
import { Trash2 } from "lucide-react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function UsersDeleteDialog({ open, onOpenChange }: DialogProps) {
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
            <DialogTitle className="flex flex-col justify-center items-center gap-3 text-destructive">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <Trash2 className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">参加者を削除する</span>
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
          
          {/* ここに参加者を選ぶUIを追加する */}
          
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline">キャンセル</Button>}></DialogClose>
            <Button type="submit" variant="destructive">削除する</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UsersDeleteDialog