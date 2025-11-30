import { clsx, type ClassValue } from "clsx";
import dayjs, { Dayjs } from "dayjs";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getWeekDays = (
  startDate: Dayjs = dayjs().startOf("week")
): Dayjs[] => {
  return Array.from({ length: 7 }, (_, i) => startDate.add(i, "day"));
};
