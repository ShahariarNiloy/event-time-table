import { ROW_HEIGHT } from "../constants";
import type { ClashInfo, Event } from "../types";

interface GridCellProps {
  rowIndex: number;
  colIndex: number;
  venueId: number;
  timeKey: string;
  width: number;
  isInDragSelection: boolean;
  isSelected: boolean;
  cellEvent: Event | null;
  clashInfo: ClashInfo | null;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  onMouseUp: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export const GridCell = ({
  rowIndex,
  colIndex,
  venueId,
  timeKey,
  width,
  isInDragSelection,
  isSelected,
  cellEvent,
  clashInfo,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: GridCellProps) => {
  const hasClash =
    isSelected &&
    clashInfo?.hasClash &&
    clashInfo.clashingEvents.some(
      (e) =>
        rowIndex >= e.selection.startRow &&
        rowIndex <= e.selection.endRow &&
        colIndex >= e.selection.startCol &&
        colIndex <= e.selection.endCol
    );

  return (
    <div
      key={`${venueId}-${timeKey}`}
      data-cell
      data-row={rowIndex}
      data-col={colIndex}
      className={`
        flex-shrink-0 border-r border-b border-gray-200
        cursor-pointer transition-colors relative
        ${rowIndex % 4 === 0 ? "border-t border-t-gray-300" : ""}
        ${
          hasClash
            ? "bg-red-200"
            : isInDragSelection
            ? "bg-blue-200"
            : isSelected
            ? "bg-blue-100"
            : cellEvent
            ? "bg-blue-500 rounded-md p-1"
            : "hover:bg-gray-50"
        }
      `}
      style={{
        width,
        height: ROW_HEIGHT,
      }}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    />
  );
};
