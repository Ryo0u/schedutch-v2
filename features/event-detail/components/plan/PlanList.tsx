import PlanRow from './PlanRow';
import { findMaybeParticipantIds } from '@/features/event-detail/lib/plans';
import type { Plan, User } from '@/features/event-detail/types';

interface PlanListProps {
  eventId: string;
  plans: Plan[];
  users: Pick<User, 'id' | 'responses'>[];
  onDelete: (plan: Plan) => void;
}

/**
 * 予定の一覧。
 * sm 未満では表を横スクロールさせるとメモ列が読めなくなるため、
 * 1件 = 1ブロックの縦積み表示に切り替える。
 */
function PlanList({ eventId, plans, users, onDelete }: PlanListProps) {
  return (
    <>
      <table className="hidden w-full table-fixed border-collapse sm:table">
        <thead>
          <tr className="text-muted-foreground border-border border-y text-left text-xs">
            <th className="w-52 p-3 font-medium">日時</th>
            <th className="p-3 font-medium">メンバー</th>
            <th className="w-1/4 p-3 font-medium">メモ</th>
            <th className="w-16 p-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {plans.map((plan) => (
            <PlanRow
              key={plan.id}
              eventId={eventId}
              plan={plan}
              maybeParticipantIds={findMaybeParticipantIds(plan, users)}
              variant="table"
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>

      <div className="divide-border border-border divide-y border-y sm:hidden">
        {plans.map((plan) => (
          <PlanRow
            key={plan.id}
            eventId={eventId}
            plan={plan}
            maybeParticipantIds={findMaybeParticipantIds(plan, users)}
            variant="stacked"
            onDelete={onDelete}
          />
        ))}
      </div>
    </>
  );
}

export default PlanList;
