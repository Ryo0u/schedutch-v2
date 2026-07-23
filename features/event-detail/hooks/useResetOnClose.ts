import { useEffect, useRef } from "react";

/**
 * ダイアログが閉じた（open: true → false）タイミングで onReset を実行する。
 * onReset を依存配列に含めると呼び出し側の再レンダー毎に発火してしまうため、ref 経由で最新値を参照する。
 */
export function useResetOnOpen(open: boolean, onReset: () => void) {
  const onResetRef = useRef(onReset);

  useEffect(() => {
    onResetRef.current = onReset;
  });

  useEffect(() => {
    if (!open) {
      onResetRef.current();
    }
  }, [open]);
}
