import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { CopyIcon } from "lucide-react";

interface ExtractResultPanelProps {
  slots: string[];
}

function ExtractResultPanel({ slots }: ExtractResultPanelProps) {
  const text = slots.join('\n');

  return (
    <InputGroup>
      <InputGroupTextarea
        className="h-72 flex-none overflow-y-auto resize-none"
        readOnly
        value={text}
      />
        <InputGroupAddon align="block-start" className="border-b flex justify-between">
          <InputGroupText>抽出結果</InputGroupText>
          <InputGroupButton variant="ghost" size="icon-xs" aria-label="抽出結果をコピー" onClick={() => navigator.clipboard.writeText(text)}>
            <CopyIcon/>
          </InputGroupButton>
        </InputGroupAddon>
    </InputGroup>
  );
}

export default ExtractResultPanel;
