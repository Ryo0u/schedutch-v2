'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isNotFoundError } from '@/lib/rpcErrors';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            // 未存在は再試行しても結果が変わらず、既定の 3 回分（約 7 秒）not-found 表示が遅れるため即座に失敗させる。
            // mutation の retry は既定の 0 のまま。RPC は POST で、応答だけ失われた場合に再送すると二重作成になる
            retry: (failureCount, error) => !isNotFoundError(error) && failureCount < 3,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
