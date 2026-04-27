import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "../ui/dialog";
import { Input } from "../ui/input";
import { Field, FieldError, FieldLabel, FieldSet } from "../ui/field";
import { Trash2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import bcrypt from "bcryptjs";
import { supabase } from "@/utils/supabase/client";
import { toast } from "sonner";

interface DialogProps {
  data: {
    password_digest: string;
    users: {
      id: string;
      name: string;
    }[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function UsersDeleteDialog({ data, open, onOpenChange, onSuccess }: DialogProps) {
  const [ password, setPassword ] = useState("");
  const [ userId, setUserId ] = useState("");
  const [ isDeleting, setIsDeleting ] = useState(false);
  const [ errorMsg, setErrorMsg ] = useState<string | null>(null);
  
  useEffect(() => {
    if (!open) {
      setPassword("");
      setUserId("");
    }
  }, [open])
  
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDeleting(true);
    
    const isMatch = await bcrypt.compare(password, data.password_digest)
    
    if (isMatch && userId) {
      try {
        const { error} =  await supabase.from("users").delete().eq("id", userId);
        if (error) throw error;
        
        toast.success("参加者を削除しました", {position: 'top-center'})
        onSuccess?.();
        
      } catch (error) {
        console.log("failed to delete user", error)
        toast.error("参加者の削除に失敗しました", {position: 'top-center'})
      }
      
      onOpenChange(false);
    } else {
      setErrorMsg("パスワードが間違っています")
    }
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
              <FieldLabel >参加者一覧</FieldLabel>
            </Field>
            
            <RadioGroup value={userId} onValueChange={setUserId}>
              {data.users.map((user) => (
                <Field data-invalid={!!errorMsg} orientation="horizontal" key={user.id}>
                  <RadioGroupItem value={user.id} id={user.id} aria-invalid={!!errorMsg}/>
                  <FieldLabel htmlFor={user.id}>{user.name}</FieldLabel>
                </Field>
              ))}
            </RadioGroup>
            
            {errorMsg && <FieldError errors={[{ message: errorMsg }]}/>}
          </FieldSet>
          
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline">キャンセル</Button>}></DialogClose>
            <Button type="submit" variant="destructive" disabled={isDeleting || !password || !userId}>削除する</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UsersDeleteDialog