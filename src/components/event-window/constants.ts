import dayjs from "dayjs";
import type { Venue } from "./types";

export const VENUES: Venue[] = [
  { id: 1, name: "Venue 1" },
  { id: 2, name: "Venue 2" },
  { id: 3, name: "Venue 3" },
  { id: 4, name: "Venue 4" },
  { id: 5, name: "Venue 5" },
];

export const TIME_COLUMN_WIDTH = 80;
export const ROW_HEIGHT = 40;
export const EVENTS_STORAGE_KEY = "event-timetable-events";

export const generateTimeSlots = () => {
  const slots = [];
  const startOfDay = dayjs().startOf("day");

  for (let i = 0; i < 96; i++) {
    slots.push(startOfDay.add(i * 15, "minute"));
  }

  return slots;
};

export const TIME_SLOTS = generateTimeSlots();
