import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';
import { useEvent } from '@/features/event-detail/hooks/useEvent';
import { useExtractSlotsContext } from './ExtractSlotsContext';
import ParticipantSelector from './ParticipantSelector';
import ExtractFilters from './ExtractFilters';
import ExtractBlockList from './ExtractBlockList';

function ExtractPanel({ eventId }: { eventId: string }) {
  const { data } = useEvent(eventId);
  const extract = useExtractSlotsContext();

  if (!data) return null;

  return (
    <Card className="shadow-primary/10 ring-primary/20 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-black">予定抽出</CardTitle>
        <CardDescription>
          回答した参加者の予定から条件に合った日程を抽出することができます
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-5 sm:flex-row">
        <div className="flex flex-1 flex-col">
          <ParticipantSelector
            users={data.users}
            activeTab={extract.activeTab}
            selectedUserIds={extract.selectedUserIds}
            selectedHeadcounts={extract.selectedHeadcounts}
            onTabChange={extract.handleTabChange}
            onToggleUser={extract.toggleUserId}
            onToggleHeadcount={extract.toggleHeadcount}
          />

          <Separator className="mb-5" />

          <div className="mb-5 flex-2">
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
            <Button variant="outline" onClick={extract.handleReset} className="flex-1">
              条件をリセット
            </Button>
            <Button
              onClick={extract.handleExtractSlots}
              disabled={
                extract.activeTab === 'people'
                  ? extract.selectedUserIds.size === 0
                  : extract.selectedHeadcounts.size === 0
              }
              className="flex-2"
            >
              抽出する
            </Button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <div className="border-input rounded-md border">
            <div className="text-muted-foreground border-b px-3 py-2 text-sm">抽出結果</div>
            <ExtractBlockList eventId={eventId} />
          </div>
          <Field orientation="horizontal" className="justify-start gap-2">
            <Checkbox
              id="highlight-toggle"
              checked={extract.isHighlightEnabled}
              onCheckedChange={(checked) => extract.setIsHighlightEnabled(!!checked)}
            />
            <FieldLabel htmlFor="highlight-toggle" className="cursor-pointer text-sm">
              抽出結果を予定一覧にハイライト表示する
            </FieldLabel>
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}

export default ExtractPanel;
