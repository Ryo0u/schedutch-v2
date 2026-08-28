import { describe, it, expect } from 'vitest';
import {
  formatPlans,
  findMaybeParticipantIds,
  findAvailableParticipantIds,
  hasOverlappingPlan,
  listPlanTimeOptions,
  listPlansInCandidate,
} from './plans';
import type { ResponseStatus } from './status';

// 時刻は UTC ISO 固定。JST 変換は formatJST* が行うため実行環境の TZ に依存しない
const plan = (
  start: string,
  end: string,
  memo: string,
  participants: { id: string; name: string }[],
) => ({
  start_time: start,
  end_time: end,
  memo,
  participants,
});

const TANAKA = { id: 'u1', name: '田中' };
const SATO = { id: 'u2', name: '佐藤' };
const SUZUKI = { id: 'u3', name: '鈴木' };

/** 30分刻みの回答を1件だけ持つユーザー */
const user = (id: string, responses: { time: string; status: ResponseStatus }[]) => ({
  id,
  responses: responses.map((r, i) => ({
    id: `r${id}${i}`,
    user_id: id,
    candidate_id: 'c1',
    time: r.time,
    status: r.status,
  })),
});

describe('findMaybeParticipantIds', () => {
  const target = plan('2026-08-04T04:00:00.000Z', '2026-08-04T06:00:00.000Z', '', [TANAKA, SATO]);

  it('予定の時間帯に maybe の回答があるメンバーを返す', () => {
    const users = [
      user('u1', [{ time: '2026-08-04T04:00:00.000Z', status: 'ok' }]),
      user('u2', [{ time: '2026-08-04T04:00:00.000Z', status: 'maybe' }]),
    ];

    expect(findMaybeParticipantIds(target, users)).toEqual(new Set(['u2']));
  });

  it('1コマでも maybe なら未定として扱う', () => {
    const users = [
      user('u2', [
        { time: '2026-08-04T04:00:00.000Z', status: 'ok' },
        { time: '2026-08-04T05:30:00.000Z', status: 'maybe' },
      ]),
    ];

    expect(findMaybeParticipantIds(target, users)).toEqual(new Set(['u2']));
  });

  it('予定の時間帯の外にある maybe は含めない', () => {
    const users = [
      // 終了時刻ちょうどのコマは予定に含まれない（end は排他）
      user('u2', [{ time: '2026-08-04T06:00:00.000Z', status: 'maybe' }]),
    ];

    expect(findMaybeParticipantIds(target, users)).toEqual(new Set());
  });

  it('メンバーでない人の maybe は含めない', () => {
    const users = [user('u3', [{ time: '2026-08-04T04:00:00.000Z', status: 'maybe' }])];

    expect(findMaybeParticipantIds(target, users)).toEqual(new Set());
  });
});

describe('formatPlans', () => {
  it('日付でグループ化し、時間帯とメンバーを並べる', () => {
    const result = formatPlans(
      [plan('2026-08-04T04:00:00.000Z', '2026-08-04T06:00:00.000Z', '', [TANAKA, SUZUKI])],
      [],
    );

    expect(result).toBe(['8/4', '13:00 - 15:00 : 田中, 鈴木', ''].join('\n'));
  });

  it('その時間帯に未定で回答しているメンバーには ▲ を付ける', () => {
    const result = formatPlans(
      [plan('2026-08-04T04:00:00.000Z', '2026-08-04T06:00:00.000Z', '', [TANAKA, SATO])],
      [
        user('u1', [{ time: '2026-08-04T04:00:00.000Z', status: 'ok' }]),
        user('u2', [{ time: '2026-08-04T04:00:00.000Z', status: 'maybe' }]),
      ],
    );

    expect(result).toContain('田中, 佐藤(▲)');
  });

  it('メモがあれば末尾に付け、空なら付けない', () => {
    const withMemo = formatPlans(
      [plan('2026-08-04T04:00:00.000Z', '2026-08-04T06:00:00.000Z', '場所は渋谷', [TANAKA])],
      [],
    );
    expect(withMemo).toContain('13:00 - 15:00 : 田中 / 場所は渋谷');

    const withoutMemo = formatPlans(
      [plan('2026-08-04T04:00:00.000Z', '2026-08-04T06:00:00.000Z', '', [TANAKA])],
      [],
    );
    expect(withoutMemo).toContain('13:00 - 15:00 : 田中\n');
  });

  it('同じ日の予定は1つの日付見出しにまとめ、別の日は分ける', () => {
    const result = formatPlans(
      [
        plan('2026-08-03T01:00:00.000Z', '2026-08-03T02:00:00.000Z', '', [TANAKA]),
        plan('2026-08-03T04:00:00.000Z', '2026-08-03T05:00:00.000Z', '', [SUZUKI]),
        plan('2026-08-04T04:00:00.000Z', '2026-08-04T05:00:00.000Z', '', [SATO]),
      ],
      [],
    );

    expect(result).toBe(
      [
        '8/3',
        '10:00 - 11:00 : 田中',
        '13:00 - 14:00 : 鈴木',
        '',
        '8/4',
        '13:00 - 14:00 : 佐藤',
        '',
      ].join('\n'),
    );
  });

  it('メンバーが空でも例外にならない', () => {
    const result = formatPlans(
      [plan('2026-08-04T04:00:00.000Z', '2026-08-04T06:00:00.000Z', '', [])],
      [],
    );
    expect(result).toContain('13:00 - 15:00 : ');
  });

  it('予定が0件なら空文字を返す', () => {
    expect(formatPlans([], [])).toBe('');
  });
});

describe('findAvailableParticipantIds', () => {
  const start = new Date('2026-08-04T04:00:00.000Z').getTime();
  const end = new Date('2026-08-04T05:00:00.000Z').getTime();

  it('全コマが ok / maybe の人だけ返す', () => {
    const users = [
      user('u1', [
        { time: '2026-08-04T04:00:00.000Z', status: 'ok' },
        { time: '2026-08-04T04:30:00.000Z', status: 'maybe' },
      ]),
      // 途中のコマが ng
      user('u2', [
        { time: '2026-08-04T04:00:00.000Z', status: 'ok' },
        { time: '2026-08-04T04:30:00.000Z', status: 'ng' },
      ]),
    ];

    expect(findAvailableParticipantIds(users, start, end)).toEqual(new Set(['u1']));
  });

  it('コマの回答が欠けている人は含めない', () => {
    const users = [user('u1', [{ time: '2026-08-04T04:00:00.000Z', status: 'ok' }])];

    expect(findAvailableParticipantIds(users, start, end)).toEqual(new Set());
  });

  it('開始と終了が同じなら誰も返さない', () => {
    const users = [user('u1', [{ time: '2026-08-04T04:00:00.000Z', status: 'ok' }])];

    expect(findAvailableParticipantIds(users, start, start)).toEqual(new Set());
  });
});

describe('hasOverlappingPlan', () => {
  const plans = [plan('2026-08-04T04:00:00.000Z', '2026-08-04T06:00:00.000Z', '', [])];
  const ms = (iso: string) => new Date(iso).getTime();

  it('一部でも重なっていれば true', () => {
    expect(
      hasOverlappingPlan(plans, ms('2026-08-04T05:00:00.000Z'), ms('2026-08-04T07:00:00.000Z')),
    ).toBe(true);
  });

  it('完全に含まれていても true', () => {
    expect(
      hasOverlappingPlan(plans, ms('2026-08-04T04:30:00.000Z'), ms('2026-08-04T05:00:00.000Z')),
    ).toBe(true);
  });

  it('境界が接するだけなら false', () => {
    expect(
      hasOverlappingPlan(plans, ms('2026-08-04T06:00:00.000Z'), ms('2026-08-04T07:00:00.000Z')),
    ).toBe(false);
    expect(
      hasOverlappingPlan(plans, ms('2026-08-04T03:00:00.000Z'), ms('2026-08-04T04:00:00.000Z')),
    ).toBe(false);
  });
});

describe('listPlansInCandidate', () => {
  const candidate = {
    start_time: '2026-08-04T04:00:00.000Z',
    end_time: '2026-08-04T06:00:00.000Z',
  };

  it('候補日の時間帯に重なる予定だけを開始時刻順で返す', () => {
    const inside = plan('2026-08-04T05:00:00.000Z', '2026-08-04T05:30:00.000Z', '', []);
    const earlier = plan('2026-08-04T04:00:00.000Z', '2026-08-04T04:30:00.000Z', '', []);
    const otherDay = plan('2026-08-03T04:00:00.000Z', '2026-08-03T05:00:00.000Z', '', []);

    expect(listPlansInCandidate([inside, otherDay, earlier], candidate)).toEqual([earlier, inside]);
  });
});

describe('listPlanTimeOptions', () => {
  const candidate = {
    start_time: '2026-08-04T04:00:00.000Z',
    end_time: '2026-08-04T05:30:00.000Z',
  };

  it('候補日の範囲を30分刻みで返し、開始からは末尾・終了からは先頭を除く', () => {
    const { startOptions, endOptions } = listPlanTimeOptions(candidate);

    expect(startOptions.map((o) => o.label)).toEqual(['13:00', '13:30', '14:00']);
    expect(endOptions.map((o) => o.label)).toEqual(['13:30', '14:00', '14:30']);
    expect(startOptions[0]?.value).toBe('2026-08-04T04:00:00.000Z');
    expect(startOptions.every((o) => !o.disabled)).toBe(true);
  });

  it('既存の予定の内側にある時刻は無効にする', () => {
    const existing = [plan('2026-08-04T04:00:00.000Z', '2026-08-04T04:30:00.000Z', '', [])];
    const { startOptions, endOptions } = listPlanTimeOptions(candidate, existing);

    // 開始は [start, end) が不可 → 13:00 だけ無効
    expect(startOptions.filter((o) => o.disabled).map((o) => o.label)).toEqual(['13:00']);
    // 終了は (start, end] が不可 → 13:30 だけ無効
    expect(endOptions.filter((o) => o.disabled).map((o) => o.label)).toEqual(['13:30']);
  });
});
