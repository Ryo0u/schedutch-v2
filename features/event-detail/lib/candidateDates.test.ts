import { describe, it, expect } from 'vitest';
import { buildCandidateDateMap, toCalendarDateKey } from './candidateDates';

describe('buildCandidateDateMap', () => {
  it('JST の年月日をキーにする（UTC では前日でも JST の日付で引ける）', () => {
    const map = buildCandidateDateMap([{ id: 'c1', start_time: '2024-03-14T15:00:00.000Z' }]);

    expect(map.get(toCalendarDateKey(new Date(2024, 2, 15)))?.id).toBe('c1');
    expect(map.has(toCalendarDateKey(new Date(2024, 2, 14)))).toBe(false);
  });

  it('候補日ごとにエントリを作る', () => {
    const map = buildCandidateDateMap([
      { id: 'c1', start_time: '2024-03-15T00:00:00.000Z' },
      { id: 'c2', start_time: '2024-03-16T00:00:00.000Z' },
    ]);

    expect([...map.values()].map((entry) => entry.id)).toEqual(['c1', 'c2']);
  });
});
