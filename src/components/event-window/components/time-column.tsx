import { ROW_HEIGHT, TIME_COLUMN_WIDTH, TIME_SLOTS } from "../constants";

export const TimeColumn = () => {
  return (
    <div
      className="flex-shrink-0 bg-gray-50 sticky left-0 z-10"
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
  );
};
