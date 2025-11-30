import type { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import type { ClashInfo, SelectedRange } from "./types";

type CreateEventBannerProps = {
  selectedRangeInfo: SelectedRange;
  clashInfo: {
    hasClash: boolean;
    clashingEvents: { id: string; name: string }[];
  } | null;
  setSelection: (selection: null) => void;
  setClashInfo: Dispatch<SetStateAction<ClashInfo | null>>;
  handleOpenModal: () => void;
};

export const CreateEventBanner: React.FC<CreateEventBannerProps> = ({
  selectedRangeInfo,
  clashInfo,
  setSelection,
  setClashInfo,
  handleOpenModal,
}) => {
  return (
    <div
      className={`sticky top-0 z-20 border-b px-4 py-2 flex items-center justify-between ${
        clashInfo?.hasClash
          ? "bg-red-50 border-red-200"
          : "bg-blue-50 border-blue-200"
      }`}
    >
      <div className="text-sm">
        <span
          className={`font-medium ${
            clashInfo?.hasClash ? "text-red-800" : "text-blue-800"
          }`}
        >
          {clashInfo?.hasClash ? "⚠️ Clash Detected: " : "Selected: "}
        </span>
        <span
          className={clashInfo?.hasClash ? "text-red-700" : "text-blue-700"}
        >
          {selectedRangeInfo.venues.map((v) => v.name).join(", ")}
        </span>
        <span
          className={`mx-2 ${
            clashInfo?.hasClash ? "text-red-400" : "text-blue-400"
          }`}
        >
          |
        </span>
        <span
          className={clashInfo?.hasClash ? "text-red-700" : "text-blue-700"}
        >
          {selectedRangeInfo.startTime.format("h:mm A")} -{" "}
          {selectedRangeInfo.endTime.format("h:mm A")}
        </span>

        {clashInfo?.hasClash && (
          <span className="ml-2 text-red-600">
            Conflicts with:{" "}
            {clashInfo.clashingEvents.map((e) => e.name).join(", ")}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelection(null);
            setClashInfo(null);
          }}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleOpenModal}
          disabled={clashInfo?.hasClash}
        >
          Create Event
        </Button>
      </div>
    </div>
  );
};
