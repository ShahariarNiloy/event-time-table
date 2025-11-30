import { Trash2 } from "lucide-react";
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
  onDelete: (eventId: string) => void;
};

export const EventOverlay: FC<EventOverlayProps> = ({
  event,
  style,
  isSelected,
  setSelectedEvent,
  setSelection,
  onDelete,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(event.id);
    setSelectedEvent(null);
  };

  const isNearTop = style.top < 50;

  return (
    <div
      key={event.id}
      className={`event-overlay absolute rounded-md border-2 transition-all cursor-pointer group ${
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
      <div
        className={`p-2 h-full flex flex-col justify-center items-center relative`}
      >
        <span className="text-xs opacity-75">
          {event.startTime.format("h:mm A")} - {event.endTime.format("h:mm A")}
        </span>
        <span className="font-semibold text-sm truncate">{event.name}</span>

        {/* Delete button tooltip - shows on click (when selected) */}
        {isSelected && (
          <button
            onClick={handleDelete}
            className={`absolute left-1/2 transform -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md shadow-lg flex items-center gap-1.5 text-xs font-medium transition-colors z-50 ${
              isNearTop ? "top-full mt-2" : "-top-10"
            }`}
            title="Delete event"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
};
