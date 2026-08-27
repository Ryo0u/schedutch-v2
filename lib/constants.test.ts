import { describe, it, expect } from 'vitest';
import { TIME_OPTIONS, SLOT_INTERVAL_MS, MS_PER_MINUTE } from './constants';

describe('TIME_OPTIONS', () => {
  it('SLOT_INTERVAL_MS 刻みで1日分を網羅する', () => {
    const intervalMinutes = SLOT_INTERVAL_MS / MS_PER_MINUTE;
    expect(TIME_OPTIONS.length).toBe((24 * 60) / intervalMinutes);
    expect(TIME_OPTIONS[0]).toBe('00:00');
    expect(TIME_OPTIONS.at(-1)).toBe('23:30');
  });

  it('"HH:MM"のゼロ埋めで昇順に並ぶ（文字列比較で時刻の前後を判定できる）', () => {
    expect(TIME_OPTIONS.every((time) => /^\d{2}:\d{2}$/.test(time))).toBe(true);
    expect([...TIME_OPTIONS].sort()).toEqual([...TIME_OPTIONS]);
  });
});
