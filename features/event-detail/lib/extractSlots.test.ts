import { describe, it, expect } from 'vitest';
import { extractSlots } from './extractSlots';
import { SLOT_INTERVAL_MS } from '@/lib/constants';
import type { ResponseStatus } from '@/features/event-detail/types';

// JST 2024-03-15 09:00 を基点に、30分刻みのタイムスタンプを作るヘルパー
const BASE_MS = new Date('2024-03-15T00:00:00.000Z').getTime();
const slot = (n: number) => BASE_MS + n * SLOT_INTERVAL_MS;
const slotISO = (n: number) => new Date(slot(n)).toISOString();

type TestResponse = { time: string; status: ResponseStatus };
const makeUser = (id: string, name: string, responses: TestResponse[]) => ({
  id,
  name,
  responses: responses.map((r, i) => ({
    id: `${id}-r${i}`,
    user_id: id,
    candidate_id: 'c1',
    ...r,
  })),
});

type ExtractSlotsParams = Parameters<typeof extractSlots>[0];
const run = (
  users: ExtractSlotsParams['users'],
  opts: Partial<Omit<ExtractSlotsParams, 'users'>> = {},
) =>
  extractSlots({
    users,
    includeMaybe: false,
    conditions: [],
    participantsFilter: () => true,
    ...opts,
  });

describe('extractSlots', () => {
  it('連続してok回答のあるコマを1つの塊に結合する', () => {
    const user = makeUser('u1', '太郎', [
      { time: slotISO(0), status: 'ok' },
      { time: slotISO(1), status: 'ok' },
      { time: slotISO(2), status: 'ok' },
    ]);

    const blocks = run([user]);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual({
      start: slot(0),
      end: slot(2),
      participants: [{ id: 'u1', name: '太郎', status: 'ok' }],
    });
  });

  it('時間が飛んでいるコマは別の塊になる', () => {
    const user = makeUser('u1', '太郎', [
      { time: slotISO(0), status: 'ok' },
      { time: slotISO(2), status: 'ok' },
    ]);

    const blocks = run([user]);

    expect(blocks).toHaveLength(2);
    expect(blocks.map((b) => [b.start, b.end])).toEqual([
      [slot(0), slot(0)],
      [slot(2), slot(2)],
    ]);
  });

  it('参加者の構成が変わると連続していても塊が分かれる', () => {
    const u1 = makeUser('u1', '太郎', [
      { time: slotISO(0), status: 'ok' },
      { time: slotISO(1), status: 'ok' },
    ]);
    const u2 = makeUser('u2', '花子', [
      { time: slotISO(0), status: 'ng' },
      { time: slotISO(1), status: 'ok' },
    ]);

    const blocks = run([u1, u2]);

    expect(blocks).toHaveLength(2);
    expect(blocks[0]?.participants.map((p) => p.name)).toEqual(['太郎']);
    expect(blocks[1]?.participants.map((p) => p.name)).toEqual(['太郎', '花子']);
  });

  describe('includeMaybe', () => {
    const user = makeUser('u1', '太郎', [
      { time: slotISO(0), status: 'ok' },
      { time: slotISO(1), status: 'maybe' },
    ]);

    it('falseならmaybeは参加扱いにしない', () => {
      const blocks = run([user], {
        conditions: [{ type: 'PARTICIPANTS', userIds: ['u1'] }],
      });
      expect(blocks).toHaveLength(1);
      expect(blocks[0]?.end).toBe(slot(0));
    });

    it('trueならmaybeも参加扱いになるが、statusが違うため塊は分かれる', () => {
      const blocks = run([user], {
        includeMaybe: true,
        conditions: [{ type: 'PARTICIPANTS', userIds: ['u1'] }],
      });
      expect(blocks).toHaveLength(2);
      expect(blocks[1]?.participants).toEqual([{ id: 'u1', name: '太郎', status: 'maybe' }]);
    });
  });

  describe('PARTICIPANTS条件', () => {
    it('指定した全員が参加可能なコマのみ残る', () => {
      const u1 = makeUser('u1', '太郎', [
        { time: slotISO(0), status: 'ok' },
        { time: slotISO(1), status: 'ok' },
      ]);
      const u2 = makeUser('u2', '花子', [
        { time: slotISO(0), status: 'ng' },
        { time: slotISO(1), status: 'ok' },
      ]);

      const blocks = run([u1, u2], {
        conditions: [{ type: 'PARTICIPANTS', userIds: ['u1', 'u2'] }],
      });

      expect(blocks).toHaveLength(1);
      expect(blocks[0]?.start).toBe(slot(1));
    });
  });

  describe('HEADCOUNTS条件', () => {
    it('参加可能人数が指定リストに含まれるコマのみ残る', () => {
      const u1 = makeUser('u1', '太郎', [
        { time: slotISO(0), status: 'ok' },
        { time: slotISO(1), status: 'ok' },
      ]);
      const u2 = makeUser('u2', '花子', [
        { time: slotISO(0), status: 'ng' },
        { time: slotISO(1), status: 'ok' },
      ]);

      const blocks = run([u1, u2], {
        conditions: [{ type: 'HEADCOUNTS', counts: [2] }],
      });

      expect(blocks).toHaveLength(1);
      expect(blocks[0]?.start).toBe(slot(1));
    });
  });

  describe('DATERANGE条件', () => {
    it('範囲外のコマを除外する（境界は含む）', () => {
      const user = makeUser('u1', '太郎', [
        { time: slotISO(0), status: 'ok' },
        { time: slotISO(1), status: 'ok' },
        { time: slotISO(2), status: 'ok' },
      ]);

      const blocks = run([user], {
        conditions: [{ type: 'DATERANGE', start: slot(1), end: slot(2) }],
      });

      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toMatchObject({ start: slot(1), end: slot(2) });
    });
  });

  describe('DURATION条件', () => {
    it('塊の長さ（end側のコマ幅込み）が閾値未満の塊を除外する', () => {
      const user = makeUser('u1', '太郎', [
        { time: slotISO(0), status: 'ok' }, // 30分の塊
        { time: slotISO(2), status: 'ok' }, // 60分の塊
        { time: slotISO(3), status: 'ok' },
      ]);

      const blocks = run([user], {
        conditions: [{ type: 'DURATION', minMinutes: 60 }],
      });

      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toMatchObject({ start: slot(2), end: slot(3) });
    });
  });

  it('participantsFilterで塊の参加者リストから除外できる（コマの抽出には影響しない）', () => {
    const u1 = makeUser('u1', '太郎', [{ time: slotISO(0), status: 'ok' }]);
    const u2 = makeUser('u2', '花子', [{ time: slotISO(0), status: 'ok' }]);

    const blocks = run([u1, u2], {
      conditions: [{ type: 'HEADCOUNTS', counts: [2] }],
      participantsFilter: (u) => u.id === 'u1',
    });

    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.participants).toEqual([{ id: 'u1', name: '太郎', status: 'ok' }]);
  });

  it('同姓同名でも別ユーザーが入れ替わるコマは塊を結合しない', () => {
    // slot(0)はu1のみ、slot(1)はu2のみ参加可能（名前はどちらも「太郎」）
    const u1 = makeUser('u1', '太郎', [
      { time: slotISO(0), status: 'ok' },
      { time: slotISO(1), status: 'ng' },
    ]);
    const u2 = makeUser('u2', '太郎', [
      { time: slotISO(0), status: 'ng' },
      { time: slotISO(1), status: 'ok' },
    ]);

    const blocks = run([u1, u2]);

    expect(blocks).toHaveLength(2);
    expect(blocks[0]?.participants).toEqual([{ id: 'u1', name: '太郎', status: 'ok' }]);
    expect(blocks[1]?.participants).toEqual([{ id: 'u2', name: '太郎', status: 'ok' }]);
  });

  it('回答が空なら空の結果を返す', () => {
    expect(run([makeUser('u1', '太郎', [])])).toEqual([]);
  });
});
