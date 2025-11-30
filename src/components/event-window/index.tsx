import { useLocalStorage } from "@/hooks/useLocalstorage";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CreateEventBanner } from "./create-event-banner";
import { CreateEventModal } from "./create-event-modal";
import { EventOverlay } from "./event-overlay";
import type {
  CellPosition,
  ClashInfo,
  Event,
  SelectedRange,
  Selection,
  SerializedEvent,
  Venue,
} from "./types";

const VENUES: Venue[] = [
  { id: 1, name: "Venue 1" },
  { id: 2, name: "Venue 2" },
  { id: 3, name: "Venue 3" },
  { id: 4, name: "Venue 4" },
  { id: 5, name: "Venue 5" },
];

const generateTimeSlots = () => {
  const slots = [];
  const startOfDay = dayjs().startOf("day");

  for (let i = 0; i < 96; i++) {
    slots.push(startOfDay.add(i * 15, "minute"));
  }

  return slots;
};

const TIME_SLOTS = generateTimeSlots();
const TIME_COLUMN_WIDTH = 80;
const ROW_HEIGHT = 40;
const EVENTS_STORAGE_KEY = "event-timetable-events";

type EventsByDate = {
  [date: string]: Event[];
};

type SerializedEventsByDate = {
  [date: string]: SerializedEvent[];
};

// Serialize events by date for localStorage
const serializeEventsByDate = (eventsByDate: EventsByDate): string => {
  const serialized: SerializedEventsByDate = {};

  Object.keys(eventsByDate).forEach((date) => {
    serialized[date] = eventsByDate[date].map((event) => ({
      id: event.id,
      name: event.name,
      venueIds: event.venues.map((v) => v.id),
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      selection: event.selection,
    }));
  });

  return JSON.stringify(serialized);
};

// Deserialize events by date from localStorage
const deserializeEventsByDate = (data: string): EventsByDate => {
  try {
    const serialized: SerializedEventsByDate = JSON.parse(data);
    const eventsByDate: EventsByDate = {};

    Object.keys(serialized).forEach((date) => {
      eventsByDate[date] = serialized[date].map((item) => ({
        id: item.id,
        name: item.name,
        venues: VENUES.filter((v) => item.venueIds.includes(v.id)),
        startTime: dayjs(item.startTime),
        endTime: dayjs(item.endTime),
        selection: item.selection,
      }));
    });

    return eventsByDate;
  } catch {
    return {};
  }
};

export const EventWindow = ({ selectedDate }: { selectedDate: Dayjs }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const venueHeaderRef = useRef<HTMLDivElement>(null);
  const venueHeaderItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  const [venueWidths, setVenueWidths] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<CellPosition | null>(null);
  const [dragEnd, setDragEnd] = useState<CellPosition | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventName, setEventName] = useState("");

  // Persisted events by date with custom serialization
  const [eventsByDate, setEventsByDate] = useLocalStorage<EventsByDate>(
    EVENTS_STORAGE_KEY,
    {},
    {
      serializer: serializeEventsByDate,
      deserializer: deserializeEventsByDate,
    }
  );

  // Get events for the selected date
  const dateKey = selectedDate.format("YYYY-MM-DD");
  const events = useMemo(
    () => eventsByDate[dateKey] || [],
    [eventsByDate, dateKey]
  );

  // Update events for the selected date
  const setEvents = useCallback(
    (updater: (prev: Event[]) => Event[]) => {
      setEventsByDate((prev) => {
        const currentEvents = prev[dateKey] || [];
        const newEvents = updater(currentEvents);
        return {
          ...prev,
          [dateKey]: newEvents,
        };
      });
    },
    [dateKey, setEventsByDate]
  );

  // Selected event for preview/editing
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Clash detection
  const [clashInfo, setClashInfo] = useState<ClashInfo | null>(null);

  const measureVenueWidths = useCallback(() => {
    const widths = venueHeaderItemsRef.current
      .filter(Boolean)
      .map((el) => el!.offsetWidth);

    if (widths.length > 0) {
      setVenueWidths(widths);
    }
  }, []);

  useEffect(() => {
    measureVenueWidths();

    window.addEventListener("resize", measureVenueWidths);
    return () => window.removeEventListener("resize", measureVenueWidths);
  }, [measureVenueWidths]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (venueHeaderRef.current) {
      venueHeaderRef.current.scrollLeft = container.scrollLeft;
    }
  };

  const handleVenueHeaderScroll = () => {
    const header = venueHeaderRef.current;
    if (!header) return;

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = header.scrollLeft;
    }
  };

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

  // Check for clashing events
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

  const getCellEvent = useCallback(
    (rowIndex: number, colIndex: number): Event | null => {
      return (
        events.find(
          (event) =>
            rowIndex >= event.selection.startRow &&
            rowIndex <= event.selection.endRow &&
            colIndex >= event.selection.startCol &&
            colIndex <= event.selection.endCol
        ) || null
      );
    },
    [events]
  );

  const handleMouseDown = (rowIndex: number, colIndex: number) => {
    const existingEvent = getCellEvent(rowIndex, colIndex);

    if (existingEvent) {
      setSelectedEvent(existingEvent);
      setSelection(null);
      return;
    }

    setSelectedEvent(null);
    setIsDragging(true);
    setDragStart({ rowIndex, colIndex });
    setDragEnd({ rowIndex, colIndex });
    setSelection(null);
    setClashInfo(null);
  };

  const handleMouseEnter = (rowIndex: number, colIndex: number) => {
    if (isDragging) {
      setDragEnd({ rowIndex, colIndex });
    }
  };

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
  const handleTouchStart = (
    rowIndex: number,
    colIndex: number,
    e: React.TouchEvent
  ) => {
    e.preventDefault();
    const existingEvent = getCellEvent(rowIndex, colIndex);

    if (existingEvent) {
      setSelectedEvent(existingEvent);
      setSelection(null);
      return;
    }

    setSelectedEvent(null);
    setIsDragging(true);
    setDragStart({ rowIndex, colIndex });
    setDragEnd({ rowIndex, colIndex });
    setSelection(null);
    setClashInfo(null);
  };

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

  const getSelectedRangeInfo = useCallback((): SelectedRange | null => {
    if (!selection) return null;

    const selectedVenues = VENUES.slice(
      selection.startCol,
      selection.endCol + 1
    );
    const startTime = TIME_SLOTS[selection.startRow];
    const endTime = TIME_SLOTS[selection.endRow].add(15, "minute");

    return {
      venues: selectedVenues,
      startTime,
      endTime,
    };
  }, [selection]);

  const handleOpenModal = () => {
    if (clashInfo?.hasClash) return;

    setEventName("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEventName("");
  };

  const handleCreateEvent = () => {
    if (!eventName.trim() || !selection) return;

    const rangeInfo = getSelectedRangeInfo();
    if (!rangeInfo) return;

    const newEvent: Event = {
      id: crypto.randomUUID(),
      name: eventName.trim(),
      venues: rangeInfo.venues,
      startTime: rangeInfo.startTime,
      endTime: rangeInfo.endTime,
      selection: selection,
    };

    setEvents((prev) => [...prev, newEvent]);
    setSelection(null);
    setClashInfo(null);
    setSelectedEvent(newEvent);
    handleCloseModal();
  };

  const getEventOverlayStyle = (event: Event) => {
    const startColOffset = venueWidths
      .slice(0, event.selection.startCol)
      .reduce((sum, w) => sum + w, 0);

    const width = venueWidths
      .slice(event.selection.startCol, event.selection.endCol + 1)
      .reduce((sum, w) => sum + w, 0);

    const top = event.selection.startRow * ROW_HEIGHT;
    const height =
      (event.selection.endRow - event.selection.startRow + 1) * ROW_HEIGHT;

    return {
      left: startColOffset,
      top,
      width,
      height,
    };
  };

  const selectedRangeInfo = getSelectedRangeInfo();
  const totalGridWidth = venueWidths.reduce((sum, width) => sum + width, 0);

  return (
    <div className="relative w-full h-full bg-white flex flex-col overflow-hidden">
      {/* Selection Info Panel */}
      {selectedRangeInfo && (
        <CreateEventBanner
          selectedRangeInfo={selectedRangeInfo}
          clashInfo={clashInfo}
          setSelection={setSelection}
          setClashInfo={setClashInfo}
          handleOpenModal={handleOpenModal}
        />
      )}

      {/* Sticky Venue Header Row */}
      <div className="sticky top-0 z-10 flex border-b border-gray-300 flex-shrink-0 bg-white">
        <div
          className="flex-shrink-0 bg-gray-50 border-r border-gray-300"
          style={{ width: TIME_COLUMN_WIDTH }}
        />

        <div
          ref={venueHeaderRef}
          onScroll={handleVenueHeaderScroll}
          className="flex overflow-x-auto scrollbar-hide"
          style={{
            width: `calc(100% - ${TIME_COLUMN_WIDTH}px)`,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {VENUES.map((venue, index) => (
            <div
              key={venue.id}
              ref={(el) => {
                venueHeaderItemsRef.current[index] = el;
              }}
              className="flex-1 px-2 py-3 min-w-80 text-center font-medium text-sm text-gray-700 border-r border-gray-300 bg-gray-50 truncate"
              title={venue.name}
            >
              {venue.name}
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex flex-1 overflow-auto select-none"
      >
        {/* Time column - sticky on left */}
        <div
          className="flex-shrink-0  bg-gray-50 sticky left-0 z-10"
          style={{ width: TIME_COLUMN_WIDTH }}
        >
          {TIME_SLOTS.map((time) => (
            <div
              key={time.format("HH:mm")}
              className="flex items-center justify-end pr-2 text-xs text-gray-500 border-b border-r border-gray-200"
              style={{ height: ROW_HEIGHT }}
            >
              <span className="-mt-2">{time.format("h:mm A")}</span>
            </div>
          ))}
        </div>

        {/* Main grid with events overlay */}
        <div className="relative flex-1">
          {venueWidths.length > 0 && (
            <div
              ref={gridRef}
              style={{
                width: totalGridWidth,
                height: TIME_SLOTS.length * ROW_HEIGHT,
              }}
            >
              {TIME_SLOTS.map((time, rowIndex) => (
                <div key={time.format("HH:mm")} className="flex">
                  {VENUES.map((venue, colIndex) => {
                    const isInDragSelection = isCellInDragSelection(
                      rowIndex,
                      colIndex
                    );
                    const isSelected = isCellSelected(rowIndex, colIndex);
                    const cellEvent = getCellEvent(rowIndex, colIndex);
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
                        key={`${venue.id}-${time.format("HH:mm")}`}
                        data-cell
                        data-row={rowIndex}
                        data-col={colIndex}
                        className={`
                          flex-shrink-0 border-r border-b border-gray-200
                          cursor-pointer transition-colors relative
                          ${
                            rowIndex % 4 === 0
                              ? "border-t border-t-gray-300"
                              : ""
                          }
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
                          width: venueWidths[colIndex],
                          height: ROW_HEIGHT,
                        }}
                        onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                        onMouseEnter={() =>
                          handleMouseEnter(rowIndex, colIndex)
                        }
                        onMouseUp={handleMouseUp}
                        onTouchStart={(e) =>
                          handleTouchStart(rowIndex, colIndex, e)
                        }
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      />
                    );
                  })}
                </div>
              ))}

              {/* Event Overlays */}
              {events.map((event) => {
                const style = getEventOverlayStyle(event);
                const isSelected = selectedEvent?.id === event.id;

                return (
                  <EventOverlay
                    event={event}
                    style={style}
                    isSelected={isSelected}
                    setSelectedEvent={setSelectedEvent}
                    setSelection={setSelection}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CreateEventModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        selectedRangeInfo={selectedRangeInfo}
        eventName={eventName}
        setEventName={setEventName}
        handleCreateEvent={handleCreateEvent}
        handleCloseModal={handleCloseModal}
      />
    </div>
  );
};
