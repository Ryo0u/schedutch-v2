'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onStoreChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', onStoreChange);
  return () => mql.removeEventListener('change', onStoreChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;

// SSR時はアニメーションあり（false）扱い。クライアントで実測値に置き換わる
const getServerSnapshot = () => false;

/** OSの「視差効果を減らす」設定を購読する */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
