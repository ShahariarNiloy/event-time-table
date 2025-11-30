import type { Dayjs } from "dayjs";

export interface Venue {
  id: number;
  name: string;
}

export interface CellPosition {
  rowIndex: number;
  colIndex: number;
}

export interface Selection {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
}

export interface SelectedRange {
  venues: Venue[];
  startTime: Dayjs;
  endTime: Dayjs;
}

export interface Event {
  id: string;
  name: string;
  venues: Venue[];
  startTime: Dayjs;
  endTime: Dayjs;
  selection: Selection;
}

export interface SerializedEvent {
  id: string;
  name: string;
  venueIds: number[];
  startTime: string;
  endTime: string;
  selection: Selection;
}

export interface ClashInfo {
  hasClash: boolean;
  clashingEvents: Event[];
}

export interface EventsByDate {
  [date: string]: Event[];
}

export interface SerializedEventsByDate {
  [date: string]: SerializedEvent[];
}
