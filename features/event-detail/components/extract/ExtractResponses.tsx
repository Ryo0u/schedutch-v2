import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useEvent } from "@/features/event-detail/hooks/useEvent";
import { useExtractSlots } from "./hooks/useExtractSlots";
import ParticipantSelector from "./ParticipantSelector";
import ExtractFilters from "./ExtractFilters";
import ExtractResultPanel from "./ExtractResultPanel";

function ExtractResponses({ eventId }: { eventId: string }) {
  const { data } = useEvent(eventId);
  const extract = useExtractSlots({
    candidates: data?.candidates ?? [],
    users: data?.users ?? [],
  });

  if (!data) return null;

  return (
    <Card className="shadow-md shadow-primary/10 ring-primary/20">
      <CardHeader>
        <CardTitle className="text-xl font-black">予定抽出</CardTitle>
        <CardDescription>
          回答した参加者の予定から条件に合った日程を抽出することができます
        </CardDescription>
      </CardHeader>
      <Separator/>
      <CardContent className="flex flex-col sm:flex-row gap-5">
        <div className="flex-1 flex flex-col">
          <ParticipantSelector
            users={data.users}
            selectedUserIds={extract.selectedUserIds}
            selectedHeadcounts={extract.selectedHeadcounts}
            onTabChange={extract.handleTabChange}
            onToggleUser={extract.toggleUserId}
            onToggleHeadcount={extract.toggleHeadcount}
          />

          <Separator className="mb-5"/>

          <div className="flex-2 mb-5">
            <ExtractFilters
              includeMaybe={extract.includeMaybe}
              onIncludeMaybeChange={extract.setIncludeMaybe}
              isDurationEnabled={extract.isDurationEnabled}
              onIsDurationEnabledChange={extract.setIsDurationEnabled}
              minDuration={extract.minDuration}
              onMinDurationChange={extract.setMinDuration}
              isDateRangeEnabled={extract.isDateRangeEnabled}
              onIsDateRangeEnabledChange={extract.setIsDateRangeEnabled}
              dateRange={extract.dateRange}
              onStartDateChange={extract.handleStartDateChange}
              onEndDateChange={extract.handleEndDateChange}
              availableDates={extract.availableDates}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={extract.handleReset} className="flex-1">条件をリセット</Button>
            <Button
              onClick={extract.handleExtractSlots}
              disabled={extract.activeTab === "people" ? extract.selectedUserIds.size === 0 : extract.selectedHeadcounts.size === 0}
              className="flex-2"
            >
              抽出する
            </Button>
          </div>
        </div>

        <div className="flex-1">
          <ExtractResultPanel slots={extract.availableSlots} />
        </div>
      </CardContent>
    </Card>
  )
}

export default ExtractResponses
