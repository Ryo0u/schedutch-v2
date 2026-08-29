'use client';

import { useSyncExternalStore } from 'react';

// 購読不要（クライアント判定はマウント後に一度確定すれば変化しない）
function subscribe() {
  return () => {};
}

const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * SSR/ハイドレーション前は false、クライアントでマウント後に true を返す。
 * SSR の初期値に依存したレイアウト（例: デバイス幅で分岐する要素）を、
 * ハイドレーション後まで遅延させたいときに使う。
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
