import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TIME_OPTIONS } from '@/lib/constants';

interface TimeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
  ariaInvalid?: boolean;
  groupLabel?: string;
}

function TimeSelect({ value, onValueChange, id, ariaInvalid, groupLabel }: TimeSelectProps) {
  const options = TIME_OPTIONS.map((time) => (
    <SelectItem key={time} value={time}>{time}</SelectItem>
  ));

  return (
    <Select value={value} onValueChange={(val) => val && onValueChange(val)}>
      <SelectTrigger id={id} aria-invalid={ariaInvalid}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {groupLabel ? (
          <SelectGroup>
            <SelectLabel>{groupLabel}</SelectLabel>
            {options}
          </SelectGroup>
        ) : (
          options
        )}
      </SelectContent>
    </Select>
  );
}

export default TimeSelect;
