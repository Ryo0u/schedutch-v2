import { describe, it, expect } from 'vitest';
import {
  classifyError,
  isPasswordError,
  isNotFoundError,
  createPasswordMismatchError,
  createNotFoundError,
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
