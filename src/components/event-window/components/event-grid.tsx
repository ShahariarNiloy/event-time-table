import { useRef } from "react";
import { ROW_HEIGHT, TIME_SLOTS, VENUES } from "../constants";
import type { ClashInfo, Event, Selection } from "../types";
import { getEventOverlayStyle } from "../utils";
import { EventOverlay } from "./event-overlay";
import { GridCell } from "./grid-cell";

interface EventGridProps {
  venueWidths: number[];
  totalGridWidth: number;
  events: Event[];
  selectedEvent: Event | null;
  clashInfo: ClashInfo | null;
  isCellInDragSelection: (rowIndex: number, colIndex: number) => boolean;
  isCellSelected: (rowIndex: number, colIndex: number) => boolean;
  getCellEvent: (rowIndex: number, colIndex: number) => Event | null;
  onMouseDown: (rowIndex: number, colIndex: number) => void;
  onMouseEnter: (rowIndex: number, colIndex: number) => void;
  onMouseUp: () => void;
  onTouchStart: (
    rowIndex: number,
    colIndex: number,
    e: React.TouchEvent
  ) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  setSelectedEvent: (event: Event | null) => void;
  setSelection: (selection: Selection | null) => void;
}

export const EventGrid = ({
  venueWidths,
  totalGridWidth,
  events,
  selectedEvent,
  clashInfo,
  isCellInDragSelection,
  isCellSelected,
  getCellEvent,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  setSelectedEvent,
  setSelection,
}: EventGridProps) => {
  const gridRef = useRef<HTMLDivElement>(null);

  if (venueWidths.length === 0) return null;

  return (
    <div
      ref={gridRef}
      style={{
        width: totalGridWidth,
        height: TIME_SLOTS.length * ROW_HEIGHT,
      }}
    >
      {TIME_SLOTS.map((time, rowIndex) => (
        <div key={time.format("HH:mm")} className="flex">
          {VENUES.map((venue, colIndex) => (
            <GridCell
              key={`${venue.id}-${time.format("HH:mm")}`}
              rowIndex={rowIndex}
              colIndex={colIndex}
              venueId={venue.id}
              timeKey={time.format("HH:mm")}
              width={venueWidths[colIndex]}
              isInDragSelection={isCellInDragSelection(rowIndex, colIndex)}
              isSelected={isCellSelected(rowIndex, colIndex)}
              cellEvent={getCellEvent(rowIndex, colIndex)}
              clashInfo={clashInfo}
              onMouseDown={() => onMouseDown(rowIndex, colIndex)}
              onMouseEnter={() => onMouseEnter(rowIndex, colIndex)}
              onMouseUp={onMouseUp}
              onTouchStart={(e) => onTouchStart(rowIndex, colIndex, e)}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            />
          ))}
        </div>
      ))}

      {/* Event Overlays */}
      {events.map((event) => {
        const style = getEventOverlayStyle(event, venueWidths, ROW_HEIGHT);
        const isSelected = selectedEvent?.id === event.id;

        return (
          <EventOverlay
            key={event.id}
            event={event}
            style={style}
            isSelected={isSelected}
            setSelectedEvent={setSelectedEvent}
            setSelection={setSelection}
          />
        );
      })}
    </div>
  );
};
