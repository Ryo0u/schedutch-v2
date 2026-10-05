'use client';

import { useState } from 'react';
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import { classifyError, isNotFoundError, toErrorMessage } from '@/lib/rpcErrors';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      /** unexpected（ユーザーに対処できない失敗）のときにトーストへ出す、操作名を含む文言 */
      errorMessage: string;
    };
  }
}

function createQueryClient() {
  const queryClient: QueryClient = new QueryClient({
    // mutation の失敗通知はここに集約する。各 mutation hook は meta.errorMessage で操作名だけを宣言する
    mutationCache: new MutationCache({
      onError: (error, _variables, _onMutateResult, mutation) => {
        const kind = classifyError(error);
        // パスワード不一致は各フォームが入力欄のエラーとして表示する
        if (kind === 'password-mismatch') return;

        console.error('mutation failed', error);
        toast.error(toErrorMessage(error, mutation.meta?.errorMessage ?? '操作に失敗しました'), {
          position: 'top-center',
        });
        // 削除済み・競合はいま見えている内容が古いので取り直す。
        // イベント自体が消えていれば再取得が PGRST116 になり、not-found 画面に切り替わる
        if (kind === 'not-found' || kind === 'conflict') {
          queryClient.invalidateQueries();
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        // 未存在は再試行しても結果が変わらず、既定の 3 回分（約 7 秒）not-found 表示が遅れるため即座に失敗させる。
        // mutation の retry は既定の 0 のまま。RPC は POST で、応答だけ失われた場合に再送すると二重作成になる
        retry: (failureCount, error) => !isNotFoundError(error) && failureCount < 3,
      },
    },
  });
  return queryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
