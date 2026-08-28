import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TIME_OPTIONS } from '@/lib/constants';
import { formatJSTTime } from '@/lib/datetime';
import { RESPONSE_STATUSES, STATUS_META } from '@/features/event-detail/lib/status';
import { useEvent } from '@/features/event-detail/hooks/useEvent';
import { usePlans } from '@/features/event-detail/hooks/usePlans';
import { PLAN_STRIPE_CLASS } from '@/features/event-detail/lib/plans';
import { useExtractSlotsContext } from '../extract/ExtractSlotsContext';
import CandidateSection from './CandidateSection';

interface ResponsesInfoProps {
  eventId: string;
}

function ResponsesInfo({ eventId }: ResponsesInfoProps) {
  const { data } = useEvent(eventId);
  const { data: plans } = usePlans(eventId);
  const { extractedBlocks, isHighlightEnabled } = useExtractSlotsContext();
  if (!data) return null;

  // 全候補の時間範囲の和集合で表示列を絞る。
  // インスタントのmin/maxは「最も早い日時」であって「最も早い時刻」ではないため、
  // JST時刻文字列に変換してから比較する（"HH:MM" のゼロ埋め固定長なので辞書順＝時刻順）。
  let displayedTimes: string[] = [];
  if (data.candidates.length > 0) {
    const globalStart = data.candidates
      .map((c) => formatJSTTime(c.start_time))
      .reduce((min, t) => (t < min ? t : min));
    const globalEnd = data.candidates
      .map((c) => formatJSTTime(c.end_time))
      .reduce((max, t) => (t > max ? t : max));
    displayedTimes = TIME_OPTIONS.filter((t) => t >= globalStart && t < globalEnd);
  }

  return (
    <Card className="shadow-primary/10 ring-primary/20 shadow-md">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-xl font-black">予定一覧</CardTitle>
          <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-xs">
            {RESPONSE_STATUSES.map((status) => (
              <span key={status} className="flex items-center gap-1.5">
                <span
                  className={`inline-block h-3 w-3 rounded-sm ${STATUS_META[status].legendDotClass}`}
                />
                {status === 'ok' ? '参加できる' : status === 'maybe' ? '未定' : '参加できない'}
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span
                className={`border-border inline-block h-3 w-3 rounded-sm border ${PLAN_STRIPE_CLASS}`}
              />
              開催予定
            </span>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent>
        <div className="w-full overflow-x-auto p-1.5 sm:p-3">
          <table className="mx-auto min-w-max">
            {data.candidates.map((candidate) => (
              <CandidateSection
                key={candidate.id}
                candidate={candidate}
                users={data.users}
                displayedTimes={displayedTimes}
                extractedBlocks={isHighlightEnabled ? extractedBlocks : []}
                plans={plans ?? []}
              />
            ))}
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default ResponsesInfo;
