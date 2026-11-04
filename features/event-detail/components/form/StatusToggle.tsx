import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { RESPONSE_STATUSES, STATUS_META } from '@/features/event-detail/lib/status';
import type { ResponseStatus } from '@/features/event-detail/types';

interface StatusToggleProps {
  value: ResponseStatus;
  onChange: (status: ResponseStatus) => void;
  className?: string;
}

function StatusToggle({ value, onChange, className }: StatusToggleProps) {
  return (
    <div className={cn('sticky top-0 left-0 z-40 mb-2 flex justify-start', className)}>
      <ToggleGroup
        size="sm"
        spacing={2}
        variant="outline"
        value={[value]}
        onValueChange={(groupValue) => {
          const next = groupValue[0] as ResponseStatus | undefined;
          if (next) onChange(next);
        }}
      >
        {RESPONSE_STATUSES.map((status) => {
          const meta = STATUS_META[status];
          return (
            <ToggleGroupItem
              key={status}
              value={status}
              className={cn('bg-background', value === status && meta.toggleActiveClass)}
            >
              <span className="sm:hidden">{meta.symbol}</span>
              <span className="hidden sm:inline">
                {meta.label}（{meta.symbol}）
              </span>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    </div>
  );
}

export default StatusToggle;
