import { describe, it, expect } from 'vitest';
import { buildInitialResponses, toResponseInputs, buildResponseSlotMap } from './responses';

describe('buildInitialResponses', () => {
  it("候補日の範囲を30分刻みで展開する（end自体は含まない・statusは'ok'）", () => {
    const responses = buildInitialResponses([
      {
        id: 'c1',
        start_time: '2024-03-15T00:00:00.000Z',
        end_time: '2024-03-15T01:30:00.000Z',
      },
    ]);

    expect(responses.map((r) => r.time.toISOString())).toEqual([
      '2024-03-15T00:00:00.000Z',
      '2024-03-15T00:30:00.000Z',
      '2024-03-15T01:00:00.000Z',
    ]);
    expect(responses.every((r) => r.candidate_id === 'c1' && r.status === 'ok')).toBe(true);
  });

  it('複数候補をまたいで展開する', () => {
    const responses = buildInitialResponses([
      { id: 'c1', start_time: '2024-03-15T00:00:00.000Z', end_time: '2024-03-15T00:30:00.000Z' },
      { id: 'c2', start_time: '2024-03-16T00:00:00.000Z', end_time: '2024-03-16T01:00:00.000Z' },
    ]);

    expect(responses.map((r) => r.candidate_id)).toEqual(['c1', 'c2', 'c2']);
  });

  it('候補が空なら空配列を返す', () => {
    expect(buildInitialResponses([])).toEqual([]);
  });
});

describe('toResponseInputs', () => {
  it('timeをISO文字列に変換する', () => {
    const inputs = toResponseInputs([
      { candidate_id: 'c1', time: new Date('2024-03-15T00:00:00.000Z'), status: 'maybe' },
    ]);

    expect(inputs).toEqual([
      { candidate_id: 'c1', time: '2024-03-15T00:00:00.000Z', status: 'maybe' },
    ]);
  });
});

describe('buildResponseSlotMap', () => {
  it('「candidate_id-JST時刻」キーのマップに変換し、元配列のindexを付与する', () => {
    const fields = [
      { candidate_id: 'c1', time: new Date('2024-03-15T00:00:00.000Z') }, // JST 09:00
      { candidate_id: 'c1', time: new Date('2024-03-15T00:30:00.000Z') }, // JST 09:30
      { candidate_id: 'c2', time: new Date('2024-03-15T00:00:00.000Z') },
    ];

    const map = buildResponseSlotMap(fields);

    expect(Object.keys(map)).toEqual(['c1-09:00', 'c1-09:30', 'c2-09:00']);
    expect(map['c1-09:30']?.index).toBe(1);
    expect(map['c2-09:00']?.index).toBe(2);
  });
});
