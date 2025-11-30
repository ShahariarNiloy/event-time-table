import { useCallback, useEffect, useState } from "react";
import type { CellPosition, ClashInfo, Event, Selection } from "../types";

interface UseDragSelectionProps {
  events: Event[];
  getCellEvent: (rowIndex: number, colIndex: number) => Event | null;
  onEventSelect: (event: Event | null) => void;
}

export const useDragSelection = ({
  events,
  getCellEvent,
  onEventSelect,
}: UseDragSelectionProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<CellPosition | null>(null);
  const [dragEnd, setDragEnd] = useState<CellPosition | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [clashInfo, setClashInfo] = useState<ClashInfo | null>(null);

  const getNormalizedSelection = useCallback(
    (start: CellPosition, end: CellPosition): Selection => {
      return {
        startRow: Math.min(start.rowIndex, end.rowIndex),
        endRow: Math.max(start.rowIndex, end.rowIndex),
        startCol: Math.min(start.colIndex, end.colIndex),
        endCol: Math.max(start.colIndex, end.colIndex),
      };
    },
    []
  );

  const checkForClash = useCallback(
    (newSelection: Selection, excludeEventId?: string): ClashInfo => {
      const clashingEvents = events.filter((event) => {
        if (excludeEventId && event.id === excludeEventId) return false;

        const rowOverlap =
          newSelection.startRow <= event.selection.endRow &&
          newSelection.endRow >= event.selection.startRow;

        const colOverlap =
          newSelection.startCol <= event.selection.endCol &&
          newSelection.endCol >= event.selection.startCol;

        return rowOverlap && colOverlap;
      });

      return {
        hasClash: clashingEvents.length > 0,
        clashingEvents,
      };
    },
    [events]
  );

  const isCellInDragSelection = useCallback(
    (rowIndex: number, colIndex: number): boolean => {
      if (!isDragging || !dragStart || !dragEnd) return false;

      const sel = getNormalizedSelection(dragStart, dragEnd);
      return (
        rowIndex >= sel.startRow &&
        rowIndex <= sel.endRow &&
        colIndex >= sel.startCol &&
        colIndex <= sel.endCol
      );
    },
    [isDragging, dragStart, dragEnd, getNormalizedSelection]
  );

  const isCellSelected = useCallback(
    (rowIndex: number, colIndex: number): boolean => {
      if (!selection) return false;

      return (
        rowIndex >= selection.startRow &&
        rowIndex <= selection.endRow &&
        colIndex >= selection.startCol &&
        colIndex <= selection.endCol
      );
    },
    [selection]
  );

  const handleMouseDown = useCallback(
    (rowIndex: number, colIndex: number) => {
      const existingEvent = getCellEvent(rowIndex, colIndex);

      if (existingEvent) {
        onEventSelect(existingEvent);
        setSelection(null);
        return;
      }

      onEventSelect(null);
      setIsDragging(true);
      setDragStart({ rowIndex, colIndex });
      setDragEnd({ rowIndex, colIndex });
      setSelection(null);
      setClashInfo(null);
    },
    [getCellEvent, onEventSelect]
  );

  const handleMouseEnter = useCallback(
    (rowIndex: number, colIndex: number) => {
      if (isDragging) {
        setDragEnd({ rowIndex, colIndex });
      }
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging && dragStart && dragEnd) {
      const newSelection = getNormalizedSelection(dragStart, dragEnd);
      setSelection(newSelection);

      const clash = checkForClash(newSelection);
      setClashInfo(clash);
    }
    setIsDragging(false);
  }, [isDragging, dragStart, dragEnd, getNormalizedSelection, checkForClash]);

  // Touch handlers
  const handleTouchStart = useCallback(
    (rowIndex: number, colIndex: number, e: React.TouchEvent) => {
      e.preventDefault();
      const existingEvent = getCellEvent(rowIndex, colIndex);

      if (existingEvent) {
        onEventSelect(existingEvent);
        setSelection(null);
        return;
      }

      onEventSelect(null);
      setIsDragging(true);
      setDragStart({ rowIndex, colIndex });
      setDragEnd({ rowIndex, colIndex });
      setSelection(null);
      setClashInfo(null);
    },
    [getCellEvent, onEventSelect]
  );

  const getCellFromTouch = useCallback((touch: React.Touch) => {
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return null;

    const cellElement = element.closest("[data-cell]");
    if (!cellElement) return null;

    const rowIndex = parseInt(cellElement.getAttribute("data-row") || "-1");
    const colIndex = parseInt(cellElement.getAttribute("data-col") || "-1");

    if (rowIndex === -1 || colIndex === -1) return null;

    return { rowIndex, colIndex };
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();

      const touch = e.touches[0];
      const cell = getCellFromTouch(touch);

      if (cell) {
        setDragEnd(cell);
      }
    },
    [isDragging, getCellFromTouch]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (isDragging && dragStart && dragEnd) {
        const newSelection = getNormalizedSelection(dragStart, dragEnd);
        setSelection(newSelection);

        const clash = checkForClash(newSelection);
        setClashInfo(clash);
      }
      setIsDragging(false);
    },
    [isDragging, dragStart, dragEnd, getNormalizedSelection, checkForClash]
  );

  // Global event listeners
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };

    const handleGlobalTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        if (dragStart && dragEnd) {
          const newSelection = getNormalizedSelection(dragStart, dragEnd);
          setSelection(newSelection);
          const clash = checkForClash(newSelection);
          setClashInfo(clash);
        }
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("touchend", handleGlobalTouchEnd);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchend", handleGlobalTouchEnd);
    };
  }, [
    isDragging,
    handleMouseUp,
    dragStart,
    dragEnd,
    getNormalizedSelection,
    checkForClash,
  ]);

  const clearSelection = useCallback(() => {
    setSelection(null);
    setClashInfo(null);
  }, []);

  return {
    selection,
    clashInfo,
    isCellInDragSelection,
    isCellSelected,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    clearSelection,
    setSelection,
    setClashInfo,
  };
};
