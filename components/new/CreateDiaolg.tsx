interface CreatedDialogProps {
  open: boolean;
  onChangeOpen: (open: boolean) => void;
  eventId: string | null;
}

function CreatedDialog({ open, onChangeOpen, eventId}: CreatedDialogProps) {
  return (
    <div></div>
  )
}

export default CreatedDialog