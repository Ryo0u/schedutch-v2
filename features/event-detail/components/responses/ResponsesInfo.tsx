import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TIME_OPTIONS } from "@/lib/constants";
import { jstHHMM } from "@/lib/utils";
import { useEvent } from "@/features/event-detail/hooks/useEvent";
import CandidateSection from "./CandidateSection";

interface ResponsesInfoProps {
  eventId: string;
}

function ResponsesInfo({ eventId }: ResponsesInfoProps) {
  const { data } = useEvent(eventId);
  if (!data) return null;

  // 全候補の時間範囲の和集合で表示列を絞る
  const globalStart = data.candidates
    .map((c) => jstHHMM(c.start_time))
    .reduce((a, b) => (a < b ? a : b), "23:59");
  const globalEnd = data.candidates
    .map((c) => jstHHMM(c.end_time))
    .reduce((a, b) => (a > b ? a : b), "00:00");
  const displayedTimes = TIME_OPTIONS.filter((t) => t >= globalStart && t < globalEnd);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-black">予定一覧</CardTitle>
      </CardHeader>

      <Separator />

      <CardContent>
        <div className="w-full overflow-x-auto">
          <table className="min-w-max mx-auto">
            {data.candidates.map((candidate) => (
              <CandidateSection
                key={candidate.id}
                candidate={candidate}
                users={data.users}
                displayedTimes={displayedTimes}
              />
            ))}
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default ResponsesInfo;
