'use client';

import { useState } from 'react';
import type { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

type DialogOpenChangeHandler = NonNullable<DialogPrimitive.Root.Props['onOpenChange']>;

interface UseDirtyCloseGuardOptions {
  /** 未保存の変更があるか（react-hook-form の formState.isDirty を渡す） */
  isDirty: boolean;
  onOpenChange: (open: boolean) => void;
  /** 破棄が確定したときの後始末（下書きの削除など）。閉じればフォームは破棄されるので、入力を戻す必要はない */
  onDiscard?: () => void;
}

/**
 * 未保存の入力があるダイアログを、誤操作で閉じてしまわないようにする。
 *
 * 背景クリックによる dismiss は、呼び出し側で `disablePointerDismissal` を渡して無効化する。
 * どの経路に確認ダイアログを挟むかは呼び出し側の配線で決まる。
 * - `handleOpenChange` を Dialog に渡すと、Esc と閉じるボタンも確認を挟む（UserEditDialog）
 * - `requestClose` だけを使えば、確認はそのボタン経由に限られる（ResponsesForm。
 *   Esc と閉じるボタンは下書きが残るため確認せずに閉じてよい）
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
    onDiscard?.();
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
