import dayjs from "dayjs";
import type { Event, EventsByDate, SerializedEventsByDate } from "./types";
import { VENUES } from "./constants";

export const serializeEventsByDate = (eventsByDate: EventsByDate): string => {
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

export const deserializeEventsByDate = (data: string): EventsByDate => {
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

export const getEventOverlayStyle = (
  event: Event,
  venueWidths: number[],
  rowHeight: number
) => {
  const startColOffset = venueWidths
    .slice(0, event.selection.startCol)
    .reduce((sum, w) => sum + w, 0);

  const width = venueWidths
    .slice(event.selection.startCol, event.selection.endCol + 1)
    .reduce((sum, w) => sum + w, 0);

  const top = event.selection.startRow * rowHeight;
  const height =
    (event.selection.endRow - event.selection.startRow + 1) * rowHeight;

  return {
    left: startColOffset,
    top,
    width,
    height,
  };
};
