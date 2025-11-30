import type { FC } from "react";
import type { Event } from "../types";

type EventOverlayProps = {
  event: Event;
  style: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  isSelected: boolean;
  setSelectedEvent: (event: Event | null) => void;
  setSelection: (selection: null) => void;
};

export const EventOverlay: FC<EventOverlayProps> = ({
  event,
  style,
  isSelected,
  setSelectedEvent,
  setSelection,
}) => {
  return (
    <div
      key={event.id}
      className={`event-overlay absolute rounded-md border-2 transition-all cursor-pointer ${
        isSelected
          ? `bg-blue-500 shadow-lg ring-2 ring-offset-1`
          : `bg-blue-500 border-transparent hover:border-gray-400`
      }`}
      style={{
        left: style.left,
        top: style.top,
        width: style.width,
        height: style.height,
        borderColor: isSelected ? undefined : "transparent",
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedEvent(isSelected ? null : event);
        setSelection(null);
      }}
    >
      <div className={`p-2 h-full flex flex-col justify-center items-center`}>
        <span className="text-xs opacity-75">
          {event.startTime.format("h:mm A")} - {event.endTime.format("h:mm A")}
        </span>
        <span className="font-semibold text-sm truncate">{event.name}</span>
      </div>
    </div>
  );
};
