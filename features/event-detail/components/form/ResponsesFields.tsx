import { type Control, type FieldValues, useFieldArray } from 'react-hook-form';
import { useState } from 'react';
import { ChevronLeft, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeviceType } from '@/hooks/useDeviceType';
import { buildResponseSlotMap } from '@/features/event-detail/lib/responses';
import { useResponseDrag } from '@/features/event-detail/hooks/useResponseDrag';
import StatusToggle from './StatusToggle';
import ResponsesGridFields from './ResponsesGridFields';
import ResponsesDayFields from './ResponsesDayFields';
import CandidateDaySwitchActions from './CandidateDaySwitchActions';
import ResponsesOverviewList from './ResponsesOverviewList';
import type { Candidate, ResponseStatus } from '@/features/event-detail/types';
import type { ResponseFormValue } from '@/features/event-detail/schema';

type FormWithResponses = FieldValues & {
  responses: ResponseFormValue[];
};

interface ResponsesFieldsProps<T extends FormWithResponses> {
  control: Control<T>;
  data: {
    candidates: Pick<Candidate, 'id' | 'start_time' | 'end_time'>[];
  };
}

/**
 * 回答の入力欄。フォームの状態（responses）と塗り操作は共通にし、表示だけを画面幅で切り替える。
 * PC・タブレットは全日を見渡せる横グリッド、スマホはセルを大きく取れる 1 日ずつの縦表示。
 */
function ResponsesFields<T extends FormWithResponses>({ control, data }: ResponsesFieldsProps<T>) {
  const { fields, update } = useFieldArray({
    control: control as Control<FormWithResponses>,
    name: 'responses',
  });

  const [currentState, setCurrentState] = useState<ResponseStatus>('ok');
  const [activeCandidateId, setActiveCandidateId] = useState(data.candidates[0]?.id ?? '');
  // 1 日ずつの表示では他の日が見えないため、入力の途中でいつでも全日を見渡せるようにする
  const [overviewOpen, setOverviewOpen] = useState(false);
  const isMobile = useDeviceType() === 'mobile';

  const responseMap = buildResponseSlotMap(fields);
  const { containerHandlers, handleTouchMove, cellHandlers } = useResponseDrag(
    fields,
    update,
    currentState,
  );

  if (!isMobile) {
    return (
      <div className="w-full select-none" {...containerHandlers}>
        <StatusToggle value={currentState} onChange={setCurrentState} />
        <ResponsesGridFields
          candidates={data.candidates}
          responseMap={responseMap}
          cellHandlers={cellHandlers}
          onTouchMove={handleTouchMove}
        />
      </div>
    );
  }

  const hasMultipleDays = data.candidates.length > 1;

  if (overviewOpen) {
    return (
      <div className="space-y-3">
        <Button type="button" variant="outline" size="sm" onClick={() => setOverviewOpen(false)}>
          <ChevronLeft />
          入力に戻る
        </Button>
        <ResponsesOverviewList
          candidates={data.candidates}
          responseMap={responseMap}
          onSelectCandidate={(candidateId) => {
            setActiveCandidateId(candidateId);
            setOverviewOpen(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full select-none" {...containerHandlers}>
      {hasMultipleDays && (
        <CandidateDaySwitchActions
          candidates={data.candidates}
          activeId={activeCandidateId}
          onChange={setActiveCandidateId}
        />
      )}
      {/*
        「一覧を見る」は StatusToggle と同じ行に見せつつ、スクロールでは流す。
        高さ 0 の枠に置いて StatusToggle の行に重ね、追従させるのは StatusToggle だけにする
        （追従する領域が大きいとセルが見にくくなるため）
      */}
      {hasMultipleDays && (
        <div className="relative z-30 mt-3 h-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute top-0 left-0"
            onClick={() => setOverviewOpen(true)}
          >
            <List />
            一覧を見る
          </Button>
        </div>
      )}
      {/*
        左寄せだと追従中に左の時刻ラベルと重なるため右に寄せる。
        行の空白部分が「一覧を見る」のタップを遮らないよう、ボタン以外はタップを素通りさせる
      */}
      <StatusToggle
        value={currentState}
        onChange={setCurrentState}
        className="pointer-events-none justify-end *:pointer-events-auto"
      />
      <ResponsesDayFields
        candidateId={activeCandidateId}
        responseMap={responseMap}
        cellHandlers={cellHandlers}
        onTouchMove={handleTouchMove}
      />
    </div>
  );
}

export default ResponsesFields;
