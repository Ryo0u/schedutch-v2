import { describe, it, expect } from 'vitest';
import {
  classifyError,
  isPasswordError,
  isNotFoundError,
  createPasswordMismatchError,
  createNotFoundError,
  toErrorMessage,
} from './rpcErrors';

/** postgrest-js が返すエラーオブジェクトの形（message / details / hint / code）を模す */
function postgrestError(code: string) {
  return { message: 'error', details: '', hint: '', code };
}

describe('classifyError', () => {
  it('PWD01 をパスワード不一致に分類する', () => {
    expect(classifyError(postgrestError('PWD01'))).toBe('password-mismatch');
  });

  it('RPC の NTF01 と select の PGRST116 を未存在に分類する', () => {
    expect(classifyError(postgrestError('NTF01'))).toBe('not-found');
    expect(classifyError(postgrestError('PGRST116'))).toBe('not-found');
  });

  it('CNF01 を競合に分類する', () => {
    expect(classifyError(postgrestError('CNF01'))).toBe('conflict');
  });

  it('fetch 失敗時の空文字 code を通信エラーに分類する', () => {
    expect(
      classifyError({ message: 'TypeError: Failed to fetch', details: '', hint: '', code: '' }),
    ).toBe('network');
  });

  it('errcode 指定なしの RAISE EXCEPTION（P0001）を想定外に分類する', () => {
    expect(classifyError(postgrestError('P0001'))).toBe('unexpected');
  });

  it('code を持たないエラー（非 JSON 応答・通常の Error・非オブジェクト）を想定外に分類する', () => {
    expect(classifyError({ message: '<html>Bad Gateway</html>' })).toBe('unexpected');
    expect(classifyError(new Error('boom'))).toBe('unexpected');
    expect(classifyError('boom')).toBe('unexpected');
    expect(classifyError(null)).toBe('unexpected');
    expect(classifyError(undefined)).toBe('unexpected');
  });
});

describe('toErrorMessage', () => {
  const fallback = '予定の追加に失敗しました';

  it('競合は RPC のメッセージをそのまま返す', () => {
    expect(
      toErrorMessage(
        { message: '既に登録されている予定と時間が重なっています', code: 'CNF01' },
        fallback,
      ),
    ).toBe('既に登録されている予定と時間が重なっています');
  });

  it('メッセージを持たない競合は既定の文言を返す', () => {
    expect(toErrorMessage({ code: 'CNF01' }, fallback)).toBe(
      '他の人の更新と競合しました。最新の状態を確認してください',
    );
  });

  it('未存在・通信エラーは分類ごとの文言を返し、操作名の文言は使わない', () => {
    expect(toErrorMessage(postgrestError('NTF01'), fallback)).toBe(
      '対象が見つかりませんでした。削除された可能性があります',
    );
    expect(toErrorMessage(postgrestError(''), fallback)).toBe(
      '通信に失敗しました。接続を確認して、もう一度お試しください',
    );
  });

  it('想定外のエラーは RPC のメッセージを見せず操作名の文言を返す', () => {
    expect(
      toErrorMessage({ message: '保存に失敗しました: 不正な候補日', code: 'P0001' }, fallback),
    ).toBe(fallback);
  });
});

describe('isPasswordError / isNotFoundError', () => {
  it('分類結果に一致するときだけ true を返す', () => {
    expect(isPasswordError(postgrestError('PWD01'))).toBe(true);
    expect(isPasswordError(postgrestError('NTF01'))).toBe(false);
    expect(isNotFoundError(postgrestError('NTF01'))).toBe(true);
    expect(isNotFoundError(postgrestError('PWD01'))).toBe(false);
  });
});

describe('createPasswordMismatchError / createNotFoundError', () => {
  it('生成した例外が対応する分類に載る', () => {
    expect(classifyError(createPasswordMismatchError())).toBe('password-mismatch');
    expect(classifyError(createNotFoundError('イベントが見つかりませんでした'))).toBe('not-found');
  });
});
