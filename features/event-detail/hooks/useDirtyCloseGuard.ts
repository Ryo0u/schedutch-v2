'use client';

import { useState } from 'react';
import type { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

type DialogOpenChangeHandler = NonNullable<DialogPrimitive.Root.Props['onOpenChange']>;

interface UseDirtyCloseGuardOptions {
  /** 未保存の変更があるか（react-hook-form の formState.isDirty を渡す） */
  isDirty: boolean;
  onOpenChange: (open: boolean) => void;
  /** 破棄が確定したときに入力をクリアする処理 */
  onDiscard: () => void;
}

/**
 * 未保存の入力があるダイアログを、誤操作で閉じてしまわないようにする。
 *
 * 背景クリックによる dismiss は呼び出し側で `disablePointerDismissal` を渡して無効化し、
 * ここでは Esc・閉じるボタン・キャンセルボタン経由の close を確認ダイアログに差し替える。
 */
export function useDirtyCloseGuard({
  isDirty,
  onOpenChange,
  onDiscard,
}: UseDirtyCloseGuardOptions) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleOpenChange: DialogOpenChangeHandler = (open, eventDetails) => {
    if (!open && isDirty) {
      // Base UI 側の close 処理（フォーカス復帰・アンマウント）ごと止め、確認ダイアログに委ねる
      eventDetails.cancel();
      setIsConfirmOpen(true);
      return;
    }

    onOpenChange(open);
  };

  /** フッターのキャンセルボタンなど、Base UI の close イベントを経由しない閉じ要求 */
  const requestClose = () => {
    if (isDirty) {
      setIsConfirmOpen(true);
      return;
    }

    onOpenChange(false);
  };

  const confirmDiscard = () => {
    setIsConfirmOpen(false);
    onDiscard();
    onOpenChange(false);
  };

  return {
    handleOpenChange,
    requestClose,
    confirm: {
      open: isConfirmOpen,
      onOpenChange: setIsConfirmOpen,
      onDiscard: confirmDiscard,
    },
  };
}
