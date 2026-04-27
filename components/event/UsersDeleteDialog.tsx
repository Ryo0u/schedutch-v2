import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "../ui/dialog";
import { Input } from "../ui/input";
import { Field, FieldLabel, FieldSet } from "../ui/field";
import { Trash2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface DialogProps {
  data: {
    users: {
      id: string;
      name: string;
    }[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function UsersDeleteDialog({ data, open, onOpenChange }: DialogProps) {
  const [ password, setPassword ] = useState<string>("")
  const [ userId, setUserId ] = useState("")
  
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(password,userId)
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
            <DialogDescription className="text-center">編集用パスワードを入力し<br/>削除する参加者を選択してください</DialogDescription>
          </DialogHeader>
          
          <FieldSet className="w-full mb-5">
            <Field>
              <FieldLabel>編集用パスワード</FieldLabel>
              <Input
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="......."
                />
            </Field>
            
            <FieldLabel>参加者一覧</FieldLabel>
              <RadioGroup value={userId} onValueChange={setUserId}>
                {data.users.map((user) => (
                  <Field orientation="horizontal" key={user.id}>
                    <RadioGroupItem value={user.id} id={user.id}/>
                    <FieldLabel htmlFor={user.id}>{user.name}</FieldLabel>
                  </Field>
                ))}
              </RadioGroup>
          </FieldSet>
          
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