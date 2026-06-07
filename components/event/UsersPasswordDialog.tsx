"use client"

import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import bcrypt from "bcryptjs";
import type { User } from "@/lib/types";

interface UsersPasswordDialogProps {
  data: {
    user: Pick<User, "id" | "name" | "password_digest">;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

function UsersPasswordDialog({ data, open, onOpenChange, onConfirm }: UsersPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsChecking(true);
    setErrorMsg(null);

    const isMatch = await bcrypt.compare(password, data.user.password_digest);
    if (isMatch) {
      onConfirm();
    } else {
      setErrorMsg("パスワードが間違っています");
    }

    setIsChecking(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPassword("");
      setErrorMsg(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-5">
            <DialogTitle className="text-center text-xl font-bold">パスワードを確認</DialogTitle>
            <DialogDescription className="text-center">
              {data.user.name} さんのパスワードを入力してください
            </DialogDescription>
          </DialogHeader>

          <Field className="mb-5" data-invalid={!!errorMsg}>
            <FieldLabel>パスワード</FieldLabel>
            <Input
              autoFocus
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrorMsg(null); }}
              aria-invalid={!!errorMsg}
            />
            {errorMsg && <FieldError errors={[{ message: errorMsg }]} />}
          </Field>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline">キャンセル</Button>} />
            <Button type="submit" disabled={isChecking || !password}>
              {isChecking ? "確認中..." : "確認する"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UsersPasswordDialog;
