'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  parseResponseDraft,
  responseDraftKey,
  serializeResponseDraft,
  type ResponseDraft,
} from '@/features/event-detail/lib/responseDraft';

/** 回答グリッドのドラッグ中に書き込みが連続するため、一定時間まとめてから保存する */
const SAVE_DEBOUNCE_MS = 500;

/**
 * 未送信の回答を sessionStorage に一時保存する。
 *
 * タブを閉じるまでが寿命なので、共有端末に入力が残り続けない。
 * ストレージが使えない環境（プライベートモード・容量超過）でも入力を止めないよう、
 * 例外は握らずログに出したうえで通常フローを継続する。
 */
export function useResponseDraft(eventId: string) {
  const key = responseDraftKey(eventId);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<ResponseDraft | null>(null);

  const cancelPendingSave = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    pendingRef.current = null;
  }, []);

  const write = useCallback(
    (draft: ResponseDraft) => {
      try {
        sessionStorage.setItem(key, serializeResponseDraft(draft));
      } catch (error) {
        console.error('Failed to save response draft:', error);
      }
    },
    [key],
  );

  const load = useCallback(
    (candidateIds: string[]): ResponseDraft | null => {
      try {
        const raw = sessionStorage.getItem(key);
        return raw === null ? null : parseResponseDraft(raw, candidateIds);
      } catch (error) {
        console.error('Failed to load response draft:', error);
        return null;
      }
    },
    [key],
  );

  const save = useCallback(
    (draft: ResponseDraft) => {
      pendingRef.current = draft;

      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        if (pendingRef.current !== null) {
          write(pendingRef.current);
          pendingRef.current = null;
        }
      }, SAVE_DEBOUNCE_MS);
    },
    [write],
  );

  /** debounce 待ちの内容を即座に書き込む（ダイアログを閉じる直前など） */
  const flush = useCallback(() => {
    const pending = pendingRef.current;
    cancelPendingSave();

    if (pending !== null) {
      write(pending);
    }
  }, [cancelPendingSave, write]);

  const clear = useCallback(() => {
    cancelPendingSave();

    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear response draft:', error);
    }
  }, [cancelPendingSave, key]);

  // アンマウント時に debounce のタイマーを残さない
  useEffect(() => cancelPendingSave, [cancelPendingSave]);

  return useMemo(() => ({ load, save, flush, clear }), [load, save, flush, clear]);
}
