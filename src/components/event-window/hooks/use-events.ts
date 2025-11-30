import { useLocalStorage } from "@/hooks/use-localstorage";
import type { Dayjs } from "dayjs";
import { useCallback, useMemo } from "react";
import { EVENTS_STORAGE_KEY, TIME_SLOTS, VENUES } from "../constants";
import type { Event, EventsByDate, SelectedRange, Selection } from "../types";
import { deserializeEventsByDate, serializeEventsByDate } from "../utils";

export const useEvents = (selectedDate: Dayjs) => {
  const [eventsByDate, setEventsByDate] = useLocalStorage<EventsByDate>(
    EVENTS_STORAGE_KEY,
    {},
    {
      serializer: serializeEventsByDate,
      deserializer: deserializeEventsByDate,
    }
  );

  const dateKey = selectedDate.format("YYYY-MM-DD");

  const events = useMemo(
    () => eventsByDate[dateKey] || [],
    [eventsByDate, dateKey]
  );

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

  const createEvent = useCallback(
    (name: string, selection: Selection, rangeInfo: SelectedRange): Event => {
      const newEvent: Event = {
        id: crypto.randomUUID(),
        name: name.trim(),
        venues: rangeInfo.venues,
        startTime: rangeInfo.startTime,
        endTime: rangeInfo.endTime,
        selection: selection,
      };

      setEvents((prev) => [...prev, newEvent]);
      return newEvent;
    },
    [setEvents]
  );

  const deleteEvent = useCallback(
    (eventId: string) => {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    },
    [setEvents]
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

  const getSelectedRangeInfo = useCallback(
    (selection: Selection | null): SelectedRange | null => {
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
    },
    []
  );

  return {
    events,
    createEvent,
    deleteEvent,
    getCellEvent,
    getSelectedRangeInfo,
  };
};
