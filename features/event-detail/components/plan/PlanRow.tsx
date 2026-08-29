import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { STATUS_META } from '@/features/event-detail/lib/status';
import { formatPlanDateTimeLabel } from '@/features/event-detail/lib/plans';
import PlanMemoForm from './PlanMemoForm';
import type { Plan } from '@/features/event-detail/types';

interface PlanRowProps {
  eventId: string;
  plan: Plan;
  /** その時間帯に ▲（未定）で回答しているメンバーの id */
  maybeParticipantIds: Set<string>;
  /** table: sm 以上の表の1行 / stacked: sm 未満の縦積み1ブロック */
  variant: 'table' | 'stacked';
  onDelete: (plan: Plan) => void;
}

function MemberBadges({
  participants,
  maybeParticipantIds,
}: {
  participants: Plan['participants'];
  maybeParticipantIds: Set<string>;
}) {
  if (participants.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {participants.map((p) => (
        <span
          key={p.id}
          className="bg-muted text-foreground rounded-full px-2 py-0.5 text-xs font-medium"
        >
          {p.name}
          {maybeParticipantIds.has(p.id) && (
            <span className="text-yellow-600"> ({STATUS_META.maybe.symbol})</span>
          )}
        </span>
      ))}
    </div>
  );
}

function PlanRow({ eventId, plan, maybeParticipantIds, variant, onDelete }: PlanRowProps) {
  const dateTime = formatPlanDateTimeLabel(plan);

  const deleteButton = (
    <Button
      variant="ghost"
      size="sm"
      aria-label={`${dateTime} の予定を削除`}
      onClick={() => onDelete(plan)}
    >
      <Trash2 className="text-destructive h-4 w-4" />
    </Button>
  );

  if (variant === 'stacked') {
    return (
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-bold tracking-tight">{dateTime}</span>
          {deleteButton}
        </div>
        <MemberBadges participants={plan.participants} maybeParticipantIds={maybeParticipantIds} />
        <PlanMemoForm eventId={eventId} plan={plan} />
      </div>
    );
  }

  return (
    <tr className="hover:bg-muted/40 transition-colors">
      <td className="p-3 align-top text-sm font-bold whitespace-nowrap">{dateTime}</td>
      <td className="p-3 align-top">
        <MemberBadges participants={plan.participants} maybeParticipantIds={maybeParticipantIds} />
      </td>
      <td className="p-3 align-top">
        <PlanMemoForm eventId={eventId} plan={plan} />
      </td>
      <td className="p-3 align-top">{deleteButton}</td>
    </tr>
  );
}

export default PlanRow;
