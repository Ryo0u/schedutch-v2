'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export function useCopyToClipboard(resetDelayMs = 1000) {
  const [copied, setCopied] = useState(false);

  // writeText は非セキュアコンテキスト（HTTP）や権限拒否で reject するため、
  // 成功したときだけ copied を立てる
  const copy = (text: string) => {
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), resetDelayMs);
      })
      .catch((error) => {
        console.error('failed to copy to clipboard', error);
        toast.error('コピーに失敗しました', { position: 'top-center' });
      });
  };

  return { copied, copy };
}
