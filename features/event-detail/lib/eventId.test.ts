import { describe, it, expect } from 'vitest';
import { isValidEventId } from './eventId';

describe('isValidEventId', () => {
  it('uuid v4 形式を受け付ける', () => {
    expect(isValidEventId('3f2a1b4c-5d6e-4f70-8a9b-0c1d2e3f4a5b')).toBe(true);
  });

  it('version/variant ビットが RFC 外でも 16 進 8-4-4-4-12 なら受け付ける', () => {
    expect(isValidEventId('11111111-1111-1111-1111-111111111111')).toBe(true);
  });

  it('大文字の 16 進を受け付ける', () => {
    expect(isValidEventId('3F2A1B4C-5D6E-4F70-8A9B-0C1D2E3F4A5B')).toBe(true);
  });

  it('桁が足りない id を弾く', () => {
    expect(isValidEventId('11111111-1111-1111-1111-11111111111')).toBe(false);
  });

  it('16 進以外の文字を含む id を弾く', () => {
    expect(isValidEventId('1111111g-1111-1111-1111-111111111111')).toBe(false);
  });

  it('空文字を弾く', () => {
    expect(isValidEventId('')).toBe(false);
  });
});
