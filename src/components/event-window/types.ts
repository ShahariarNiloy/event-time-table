import type { Dayjs } from "dayjs";

export type Venue = {
  id: number;
  name: string;
};

export type CellPosition = {
  rowIndex: number;
  colIndex: number;
};

export type Selection = {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
};

export type SelectedRange = {
  venues: Venue[];
  startTime: Dayjs;
  endTime: Dayjs;
};

// Serialized event for localStorage (dates as ISO strings)
export type SerializedEvent = {
  id: string;
  name: string;
  venueIds: number[];
  startTime: string;
  endTime: string;
  selection: Selection;
};

// Runtime event with Dayjs objects
export type Event = {
  id: string;
  name: string;
  venues: Venue[];
  startTime: Dayjs;
  endTime: Dayjs;
  selection: Selection;
};

export type ClashInfo = {
  hasClash: boolean;
  clashingEvents: Event[];
};
