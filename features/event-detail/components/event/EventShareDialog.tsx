import { Check, Copy, Share2 } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EventShareDialog({ open, onOpenChange }: DialogProps) {
  const { copied, copy } = useCopyToClipboard();

  const eventUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
          <DialogHeader className="">
            <DialogTitle className="flex flex-col justify-center items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Share2 className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">イベントを共有する</span>
            </DialogTitle>
            <DialogDescription className="text-center">イベントのURLを参加者に共有してください</DialogDescription>
          </DialogHeader>
          
          <Field className="flex p-3 overflow-x-auto">
            <InputGroup>
            <InputGroupInput
              readOnly
              value={eventUrl}
              className="pr-10 text-xs font-mono select-all"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="イベントURLをコピー"
                onClick={() => copy(eventUrl)}
                className="h-full px-3"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          </Field>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline">キャンセル</Button>}></DialogClose>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EventShareDialog