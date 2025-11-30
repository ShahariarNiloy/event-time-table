import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FC } from "react";
import type { SelectedRange } from "../types";

type CreateEventModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  selectedRangeInfo: SelectedRange | null;
  eventName: string;
  setEventName: (name: string) => void;
  handleCreateEvent: () => void;
  handleCloseModal: () => void;
};

export const CreateEventModal: FC<CreateEventModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  selectedRangeInfo,
  eventName,
  setEventName,
  handleCreateEvent,
  handleCloseModal,
}) => {
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
          <DialogDescription>
            {selectedRangeInfo && (
              <span>
                {selectedRangeInfo.venues.map((v) => v.name).join(", ")} •{" "}
                {selectedRangeInfo.startTime.format("h:mm A")} -{" "}
                {selectedRangeInfo.endTime.format("h:mm A")}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="event-name">Event Name</Label>
            <Input
              id="event-name"
              placeholder="Enter event name..."
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && eventName.trim()) {
                  handleCreateEvent();
                }
              }}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button onClick={handleCreateEvent} disabled={!eventName.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
