import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface EventAuthPassProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: "eventEdit" | "eventDelete" | "usersDelete" | null;
}

function EventAuthPass({ open, onOpenChange, action }: EventAuthPassProps) {
  return (
    <></>
  )
}

export default EventAuthPass