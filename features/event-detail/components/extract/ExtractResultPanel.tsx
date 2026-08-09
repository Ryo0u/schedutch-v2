import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import { Check, Copy } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

interface ExtractResultPanelProps {
  slots: string[];
}

function ExtractResultPanel({ slots }: ExtractResultPanelProps) {
  const { copied, copy } = useCopyToClipboard();
  const text = slots.join('\n');

  return (
    <InputGroup>
      <InputGroupTextarea
        className="h-72 flex-none resize-none overflow-y-auto"
        readOnly
        value={text}
      />
      <InputGroupAddon align="block-start" className="flex justify-between border-b">
        <InputGroupText>抽出結果</InputGroupText>
        <InputGroupButton
          variant="ghost"
          size="icon-xs"
          aria-label="抽出結果をコピー"
          onClick={() => copy(text)}
        >
          {copied ? <Check /> : <Copy />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

export default ExtractResultPanel;
