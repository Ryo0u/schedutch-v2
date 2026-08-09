'use client';

import { useState } from 'react';

export function useCopyToClipboard(resetDelayMs = 1000) {
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), resetDelayMs);
  };

  return { copied, copy };
}
