import { useCallback, useState } from "react";
import type { ResponseStatus } from "@/features/event-detail/types";
import type { ResponseFormValue } from "@/features/event-detail/schema";

type DraggableField = ResponseFormValue;

/**
 * ResponsesFieldsのドラッグ塗り入力を集約する。
 * PC（mouse）とスマホ（touch）どちらも内部の単一 applyToSlot(index) 経由で更新する。
 */
export function useResponseDrag<T extends DraggableField>(
  fields: T[],
  update: (index: number, value: T) => void,
  currentState: ResponseStatus
) {
  const [isDragging, setIsDragging] = useState(false);

  const applyToSlot = useCallback(
    (index: number) => {
      const field = fields[index];
      if (!field) return;
      update(index, { ...field, status: currentState });
    },
    [fields, update, currentState]
  );

  const stopDragging = () => setIsDragging(false);

  const containerHandlers = {
    onMouseUp: stopDragging,
    onMouseLeave: stopDragging,
    onTouchEnd: stopDragging,
    onTouchCancel: stopDragging,
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    if (!touch) return;
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const tdElement = element?.closest("[data-index]");
    if (!tdElement) return;

    applyToSlot(Number(tdElement.getAttribute("data-index")));
  };

  const cellHandlers = (index: number) => ({
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      applyToSlot(index);
    },
    onMouseEnter: () => {
      if (isDragging) applyToSlot(index);
    },
    onTouchStart: () => {
      setIsDragging(true);
      applyToSlot(index);
    },
  });

  return { containerHandlers, handleTouchMove, cellHandlers };
}
