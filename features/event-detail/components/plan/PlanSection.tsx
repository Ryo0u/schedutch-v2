'use client';

import { Check, Copy, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { useEvent } from '@/features/event-detail/hooks/useEvent';
import { usePlans } from '@/features/event-detail/hooks/usePlans';
import { formatPlans } from '@/features/event-detail/lib/plans';
import PlanList from './PlanList';
import PlanCreateDialog from './PlanCreateDialog';
import PlanDeleteDialog from './PlanDeleteDialog';
import { usePlanDialogs } from './hooks/usePlanDialogs';

function PlanSection({ eventId }: { eventId: string }) {
  const { data: plans } = usePlans(eventId);
  // ▲（未定）表示は予定側に持たず、回答から都度判定する
  const { data: event } = useEvent(eventId);
  const users = event?.users ?? [];
  const { copied, copy } = useCopyToClipboard();
  const { startCreate, startDelete, createPlan, deletePlan } = usePlanDialogs();

  if (!plans) return null;

  return (
    <Card className="shadow-primary/10 ring-primary/20 shadow-md">
      <CardHeader>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <CardTitle className="text-foreground text-xl font-black tracking-tight">
              開催予定
            </CardTitle>
            <CardDescription className="text-muted-foreground bg-muted rounded-full px-2 py-1 text-xs">
              {plans.length} 件
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={plans.length === 0}
              onClick={() => copy(formatPlans(plans, users))}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              まとめをコピー
            </Button>
            <Button size="sm" onClick={startCreate}>
              <Plus className="h-4 w-4" />
              予定を追加
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        {plans.length === 0 ? (
          <div className="bg-muted/10 mx-6 rounded-xl border-2 border-dashed py-10 text-center">
            <p className="text-muted-foreground mb-4 text-sm">
              まだ開催予定がありません。予定抽出の「候補一覧」からも追加できます
            </p>
          </div>
        ) : (
          <PlanList eventId={eventId} plans={plans} users={users} onDelete={startDelete} />
        )}
      </CardContent>

      <PlanCreateDialog eventId={eventId} {...createPlan} />

      {deletePlan.plan && (
        <PlanDeleteDialog
          eventId={eventId}
          data={{ plan: deletePlan.plan }}
          open={deletePlan.open}
          onOpenChange={deletePlan.onOpenChange}
        />
      )}
    </Card>
  );
}

export default PlanSection;
