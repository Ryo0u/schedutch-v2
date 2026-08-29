'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useEvent } from '@/features/event-detail/hooks/useEvent';
import { useExtractSlots } from './hooks/useExtractSlots';

type ExtractSlotsContextValue = ReturnType<typeof useExtractSlots>;

const ExtractSlotsContext = createContext<ExtractSlotsContextValue | null>(null);

// ExtractPanel(抽出UI)と ResponsesInfo(表)は兄弟のため、抽出状態を Context で共有する
export function ExtractSlotsProvider({
  eventId,
  children,
}: {
  eventId: string;
  children: ReactNode;
}) {
  const { data } = useEvent(eventId);
  const extract = useExtractSlots({
    candidates: data?.candidates ?? [],
    users: data?.users ?? [],
  });

  return <ExtractSlotsContext.Provider value={extract}>{children}</ExtractSlotsContext.Provider>;
}

export function useExtractSlotsContext(): ExtractSlotsContextValue {
  const context = useContext(ExtractSlotsContext);
  if (!context) {
    throw new Error('useExtractSlotsContext は ExtractSlotsProvider の内側で使用してください');
  }
  return context;
}
