import { TIME_COLUMN_WIDTH, VENUES } from "../constants";

interface VenueHeaderProps {
  venueHeaderRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  setVenueRef: (index: number) => (el: HTMLDivElement | null) => void;
}

export const VenueHeader = ({
  venueHeaderRef,
  onScroll,
  setVenueRef,
}: VenueHeaderProps) => {
  return (
    <div className="sticky top-0 z-10 flex border-b border-gray-300 flex-shrink-0 bg-white">
      <div
        className="flex-shrink-0 bg-gray-50 border-r border-gray-300"
        style={{ width: TIME_COLUMN_WIDTH }}
      />

      <div
        ref={venueHeaderRef}
        onScroll={onScroll}
        className="flex overflow-x-auto scrollbar-hide"
        style={{
          width: `calc(100% - ${TIME_COLUMN_WIDTH}px)`,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {VENUES.map((venue, index) => (
          <div
            key={venue.id}
            ref={setVenueRef(index)}
            className="flex-1 px-2 py-3 min-w-80 text-center font-medium text-sm text-gray-700 border-r border-gray-300 bg-gray-50 truncate"
            title={venue.name}
          >
            {venue.name}
          </div>
        ))}
      </div>
    </div>
  );
};
