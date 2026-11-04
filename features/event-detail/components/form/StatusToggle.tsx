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
    // 左寄せだと追従中に左の日付・時刻ラベルと重なるため右に寄せる。
    // 行の空白部分が下のセルや同じ行のボタンへの操作を遮らないよう、ボタン以外は素通りさせる
    <div
      className={cn(
        'pointer-events-none sticky top-0 left-0 z-40 mb-2 flex justify-end *:pointer-events-auto',
        className,
      )}
    >
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
              className={cn(
                'bg-background text-muted-foreground',
                value === status && cn('shadow-sm', meta.toggleActiveClass),
              )}
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
