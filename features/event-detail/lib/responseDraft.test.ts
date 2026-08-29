import { describe, it, expect } from 'vitest';
import {
  parseResponseDraft,
  responseDraftKey,
  serializeResponseDraft,
  type ResponseDraft,
} from './responseDraft';

const draft: ResponseDraft = {
  name: '田中',
  comment: '午後がいいです',
  responses: [
    { candidate_id: 'c1', time: new Date('2024-03-15T00:00:00.000Z'), status: 'ok' },
    { candidate_id: 'c2', time: new Date('2024-03-16T01:30:00.000Z'), status: 'ng' },
  ],
};

describe('responseDraftKey', () => {
  it('eventIdごとに異なるキーを返す', () => {
    expect(responseDraftKey('e1')).not.toBe(responseDraftKey('e2'));
  });
});

describe('serializeResponseDraft / parseResponseDraft', () => {
  it('保存して復元すると元の値に戻る', () => {
    const restored = parseResponseDraft(serializeResponseDraft(draft), ['c1', 'c2']);

    expect(restored).toEqual(draft);
  });

  it('パスワードは保存しない', () => {
    expect(serializeResponseDraft(draft)).not.toContain('password');
  });

  it('timeはISO文字列で保存する（実行環境のTZに依存しない）', () => {
    const saved = JSON.parse(serializeResponseDraft(draft));

    expect(saved.responses[0].time).toBe('2024-03-15T00:00:00.000Z');
  });

  it('壊れたJSONはnullを返す', () => {
    expect(parseResponseDraft('{', ['c1'])).toBeNull();
  });

  it('版数が違う下書きはnullを返す', () => {
    const stale = JSON.stringify({ version: 0, name: '', comment: '', responses: [] });

    expect(parseResponseDraft(stale, ['c1'])).toBeNull();
  });

  it('想定外の形をしていればnullを返す', () => {
    const broken = JSON.stringify({ version: 1, name: '田中' });

    expect(parseResponseDraft(broken, ['c1'])).toBeNull();
  });

  it('未知のstatusを含む下書きはnullを返す', () => {
    const broken = JSON.stringify({
      version: 1,
      name: '',
      comment: '',
      responses: [{ candidate_id: 'c1', time: '2024-03-15T00:00:00.000Z', status: 'unknown' }],
    });

    expect(parseResponseDraft(broken, ['c1'])).toBeNull();
  });

  it('現在の候補日に無いcandidate_idを含む下書きはnullを返す', () => {
    expect(parseResponseDraft(serializeResponseDraft(draft), ['c1'])).toBeNull();
  });

  it('timeが日付として解釈できない下書きはnullを返す', () => {
    const broken = JSON.stringify({
      version: 1,
      name: '',
      comment: '',
      responses: [{ candidate_id: 'c1', time: 'not-a-date', status: 'ok' }],
    });

    expect(parseResponseDraft(broken, ['c1'])).toBeNull();
  });

  it('回答が空の下書きも復元できる', () => {
    const empty: ResponseDraft = { name: '', comment: '', responses: [] };

    expect(parseResponseDraft(serializeResponseDraft(empty), [])).toEqual(empty);
  });
});
