import { formatJSTCandidateDateLabel, formatJSTDate, formatJSTTime } from '@/lib/datetime';
import { STATUS_META } from '@/features/event-detail/lib/status';
import { SLOT_INTERVAL_MS } from '@/lib/constants';
import type { Candidate, Plan, User } from '@/features/event-detail/types';

/**
 * 開催予定を示す斜線パターン。ベタ塗りだと回答の色より主張が強くなるため、
 * 「押さえ済み」を表す薄い斜線で重ねる。予定一覧のグリッドと凡例で共用する。
 */
export const PLAN_STRIPE_CLASS =
  'bg-[repeating-linear-gradient(45deg,var(--color-primary)_0_2px,transparent_2px_6px)] opacity-60';

type FormattablePlan = Pick<Plan, 'start_time' | 'end_time' | 'memo' | 'participants'>;
type RespondingUser = Pick<User, 'id' | 'responses'>;

/**
 * 予定のメンバーのうち、その時間帯に ▲（未定）で回答している人の id を返す。
 *
 * 予定側にフラグを持たせず毎回 responses から求めるため、後から回答が
 * ok に変われば ▲ も自動で外れる。予定は複数コマにまたがるので、
 * 1 コマでも未定なら未定として扱う。
 */
export function findMaybeParticipantIds(
  plan: Pick<Plan, 'start_time' | 'end_time' | 'participants'>,
  users: RespondingUser[],
): Set<string> {
  const start = new Date(plan.start_time).getTime();
  const end = new Date(plan.end_time).getTime();
  const memberIds = new Set(plan.participants.map((p) => p.id));

  const maybeIds = users
    .filter(
      (user) =>
        memberIds.has(user.id) &&
        user.responses.some((response) => {
          const time = new Date(response.time).getTime();
          return response.status === 'maybe' && start <= time && time < end;
        }),
    )
    .map((user) => user.id);

  return new Set(maybeIds);
}

/** メンバー名の並び。未定で回答している人には ▲ を付ける */
function formatParticipants(
  participants: FormattablePlan['participants'],
  maybeIds: Set<string>,
): string {
  return participants
    .map((p) => (maybeIds.has(p.id) ? `${p.name}(${STATUS_META.maybe.symbol})` : p.name))
    .join(', ');
}

/**
 * 開催予定を共有用のテキストに整形する。
 * 日付でグループ化し、時間帯とメンバー・メモを1行にまとめる。
 */
export function formatPlans(plans: FormattablePlan[], users: RespondingUser[]): string {
  const lines: string[] = [];

  const grouped = plans.reduce(
    (acc, plan) => {
      const dateKey = formatJSTDate(plan.start_time, { month: 'numeric', day: 'numeric' });
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(plan);
      return acc;
    },
    {} as Record<string, FormattablePlan[]>,
  );

  Object.entries(grouped).forEach(([date, daysPlans]) => {
    lines.push(date);
    daysPlans.forEach((plan) => {
      const start = formatJSTTime(plan.start_time);
      const end = formatJSTTime(plan.end_time);
      const names = formatParticipants(plan.participants, findMaybeParticipantIds(plan, users));
      const memo = plan.memo ? ` / ${plan.memo}` : '';
      lines.push(`${start} - ${end} : ${names}${memo}`);
    });
    lines.push('');
  });

  return lines.join('\n');
}

/** 一覧・削除ダイアログで使う "8月4日(火) 13:00 - 15:00" 形式のラベル */
export function formatPlanDateTimeLabel(plan: Pick<Plan, 'start_time' | 'end_time'>): string {
  const date = formatJSTCandidateDateLabel(plan.start_time);
  return `${date} ${formatJSTTime(plan.start_time)} - ${formatJSTTime(plan.end_time)}`;
}

/** 予定の時間帯に含まれる 30 分コマの開始時刻（ミリ秒）を列挙する */
function listSlotTimes(startMs: number, endMs: number): number[] {
  const times: number[] = [];
  for (let time = startMs; time < endMs; time += SLOT_INTERVAL_MS) {
    times.push(time);
  }
  return times;
}

/**
 * その時間帯の全コマを ok / maybe で回答している参加者の id を返す。
 *
 * 予定に入れられるメンバーをここに絞ることで、回答では不参加なのに
 * 予定には入っている、という食い違いが起きないようにする。
 * ▲（未定）を許すのは抽出の `includeMaybe` と揃えるため。
 */
export function findAvailableParticipantIds(
  users: RespondingUser[],
  startMs: number,
  endMs: number,
): Set<string> {
  const slots = listSlotTimes(startMs, endMs);
  if (slots.length === 0) return new Set();

  const availableIds = users
    .filter((user) => {
      const statusByTime = new Map(
        user.responses.map((r) => [new Date(r.time).getTime(), r.status]),
      );
      return slots.every((time) => {
        const status = statusByTime.get(time);
        return status === 'ok' || status === 'maybe';
      });
    })
    .map((user) => user.id);

  return new Set(availableIds);
}

/** 既に登録されている予定と時間帯が重なるか */
export function hasOverlappingPlan(
  plans: Pick<Plan, 'start_time' | 'end_time'>[],
  startMs: number,
  endMs: number,
): boolean {
  return plans.some(
    (plan) =>
      new Date(plan.start_time).getTime() < endMs && startMs < new Date(plan.end_time).getTime(),
  );
}

/** 時刻 Select の選択肢。既存の予定に覆われている時刻は選べない */
export type PlanTimeOption = { value: string; label: string; disabled: boolean };

/** その候補日の時間帯に入っている予定を、開始時刻の昇順で返す */
export function listPlansInCandidate<T extends Pick<Plan, 'start_time' | 'end_time'>>(
  plans: T[],
  candidate: Pick<Candidate, 'start_time' | 'end_time'>,
): T[] {
  const start = new Date(candidate.start_time).getTime();
  const end = new Date(candidate.end_time).getTime();

  return plans
    .filter(
      (plan) =>
        new Date(plan.start_time).getTime() < end && start < new Date(plan.end_time).getTime(),
    )
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
}

/**
 * 候補日の中で選べる開始・終了時刻を返す。
 * 選択肢を候補日の範囲そのものにすることで、回答が存在しない時間を選べなくする。
 * 既存の予定の内側にある時刻は、選ぶと必ず重なるため無効にする。
 */
export function listPlanTimeOptions(
  candidate: Pick<Candidate, 'start_time' | 'end_time'>,
  plans: Pick<Plan, 'start_time' | 'end_time'>[] = [],
): { startOptions: PlanTimeOption[]; endOptions: PlanTimeOption[] } {
  const start = new Date(candidate.start_time).getTime();
  const end = new Date(candidate.end_time).getTime();
  const ranges = plans.map((plan) => ({
    start: new Date(plan.start_time).getTime(),
    end: new Date(plan.end_time).getTime(),
  }));

  const points: number[] = [];
  for (let time = start; time <= end; time += SLOT_INTERVAL_MS) {
    points.push(time);
  }

  const toOption = (time: number, disabled: boolean): PlanTimeOption => ({
    value: new Date(time).toISOString(),
    label: formatJSTTime(time),
    disabled,
  });

  // 開始は既存予定の [start, end)、終了は (start, end] に入っていると必ず重なる
  return {
    startOptions: points.slice(0, -1).map((t) =>
      toOption(
        t,
        ranges.some((r) => r.start <= t && t < r.end),
      ),
    ),
    endOptions: points.slice(1).map((t) =>
      toOption(
        t,
        ranges.some((r) => r.start < t && t <= r.end),
      ),
    ),
  };
}
