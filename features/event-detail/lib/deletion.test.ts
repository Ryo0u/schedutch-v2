import { describe, it, expect } from 'vitest';
import { getEventDeletionInfo } from './deletion';

const now = new Date('2026-08-29T00:00:00.000Z');

describe('getEventDeletionInfo', () => {
  it('回答者ゼロなら作成日時から60日後が削除日', () => {
    const info = getEventDeletionInfo(
      { createdAt: '2026-08-01T00:00:00.000Z', userUpdatedAts: [] },
      now,
    );
    expect(info?.deletionDate.toISOString()).toBe('2026-09-30T00:00:00.000Z');
    expect(info?.daysLeft).toBe(32);
  });

  it('回答者ありなら最新の updated_at から30日後が削除日', () => {
    const info = getEventDeletionInfo(
      {
        createdAt: '2026-01-01T00:00:00.000Z',
        userUpdatedAts: ['2026-08-10T00:00:00.000Z', '2026-08-20T00:00:00.000Z'],
      },
      now,
    );
    expect(info?.deletionDate.toISOString()).toBe('2026-09-19T00:00:00.000Z');
    expect(info?.daysLeft).toBe(21);
  });

  it('回答者ありのとき作成日時は無視する（古くても最終アクティビティ基準）', () => {
    const info = getEventDeletionInfo(
      { createdAt: '2020-01-01T00:00:00.000Z', userUpdatedAts: ['2026-08-25T00:00:00.000Z'] },
      now,
    );
    expect(info?.deletionDate.toISOString()).toBe('2026-09-24T00:00:00.000Z');
  });

  it('期限を過ぎていれば daysLeft は 0 以下', () => {
    const info = getEventDeletionInfo(
      { createdAt: '2026-01-01T00:00:00.000Z', userUpdatedAts: [] },
      now,
    );
    expect(info?.daysLeft).toBeLessThanOrEqual(0);
  });

  it('createdAt が無く回答者もいなければ null', () => {
    expect(getEventDeletionInfo({ createdAt: null, userUpdatedAts: [] }, now)).toBeNull();
  });

  it('createdAt が無くても回答者がいれば計算できる', () => {
    const info = getEventDeletionInfo(
      { createdAt: null, userUpdatedAts: ['2026-08-25T00:00:00.000Z'] },
      now,
    );
    expect(info?.deletionDate.toISOString()).toBe('2026-09-24T00:00:00.000Z');
  });
});
