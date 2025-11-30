import { useCallback, useRef } from "react";

export const useScrollSync = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const venueHeaderRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (venueHeaderRef.current) {
      venueHeaderRef.current.scrollLeft = container.scrollLeft;
    }
  }, []);

  const handleVenueHeaderScroll = useCallback(() => {
    const header = venueHeaderRef.current;
    if (!header) return;

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = header.scrollLeft;
    }
  }, []);

  return {
    scrollContainerRef,
    venueHeaderRef,
    handleScroll,
    handleVenueHeaderScroll,
  };
};
