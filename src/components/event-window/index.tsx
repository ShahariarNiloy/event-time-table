import type { Dayjs } from "dayjs";
import { useState } from "react";

import { useDragSelection } from "./hooks/use-drag-selection";
import { useEvents } from "./hooks/use-events";
import { useScrollSync } from "./hooks/use-scroll-sync";
import { useVenueWidths } from "./hooks/use-venue-widths";

import { CreateEventBanner } from "./components/create-event-banner";
import { CreateEventModal } from "./components/create-event-modal";
import { EventGrid } from "./components/event-grid";
import { TimeColumn } from "./components/time-column";
import { VenueHeader } from "./components/venue-header";

import type { Event } from "./types";

interface EventWindowProps {
  selectedDate: Dayjs;
}

export const EventWindow = ({ selectedDate }: EventWindowProps) => {
  // Hooks
  const { venueWidths, setVenueRef, totalGridWidth } = useVenueWidths();

  const {
    scrollContainerRef,
    venueHeaderRef,
    handleScroll,
    handleVenueHeaderScroll,
  } = useScrollSync();

  const {
    events,
    createEvent,
    getCellEvent,
    getSelectedRangeInfo,
    deleteEvent,
  } = useEvents(selectedDate);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const {
    selection,
    clashInfo,
    isCellInDragSelection,
    isCellSelected,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    clearSelection,
    setSelection,
    setClashInfo,
  } = useDragSelection({
    events,
    getCellEvent,
    onEventSelect: setSelectedEvent,
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventName, setEventName] = useState("");

  const selectedRangeInfo = getSelectedRangeInfo(selection);

  const handleOpenModal = () => {
    if (clashInfo?.hasClash) return;
    setEventName("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEventName("");
  };

  const handleCreateEvent = () => {
    if (!eventName.trim() || !selection || !selectedRangeInfo) return;

    const newEvent = createEvent(eventName, selection, selectedRangeInfo);
    clearSelection();
    setSelectedEvent(newEvent);
    handleCloseModal();
  };

  return (
    <div className="relative w-full h-full bg-white flex flex-col overflow-hidden">
      {/* Selection Info Panel */}
      {selectedRangeInfo && (
        <CreateEventBanner
          selectedRangeInfo={selectedRangeInfo}
          clashInfo={clashInfo}
          setSelection={setSelection}
          setClashInfo={setClashInfo}
          handleOpenModal={handleOpenModal}
        />
      )}

      {/* Sticky Venue Header Row */}
      <VenueHeader
        venueHeaderRef={venueHeaderRef}
        onScroll={handleVenueHeaderScroll}
        setVenueRef={setVenueRef}
      />

      {/* Scrollable Content Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex flex-1 overflow-auto select-none"
      >
        {/* Time column */}
        <TimeColumn />

        {/* Main grid with events overlay */}
        <div className="relative flex-1">
          <EventGrid
            venueWidths={venueWidths}
            totalGridWidth={totalGridWidth}
            events={events}
            selectedEvent={selectedEvent}
            clashInfo={clashInfo}
            isCellInDragSelection={isCellInDragSelection}
            isCellSelected={isCellSelected}
            getCellEvent={getCellEvent}
            onMouseDown={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            setSelectedEvent={setSelectedEvent}
            setSelection={setSelection}
            onDeleteEvent={deleteEvent}
          />
        </div>
      </div>

      <CreateEventModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        selectedRangeInfo={selectedRangeInfo}
        eventName={eventName}
        setEventName={setEventName}
        handleCreateEvent={handleCreateEvent}
        handleCloseModal={handleCloseModal}
      />
    </div>
  );
};
