import { useCallback, useEffect, useRef, useState } from "react";

export const useVenueWidths = () => {
  const venueHeaderItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [venueWidths, setVenueWidths] = useState<number[]>([]);

  const measureVenueWidths = useCallback(() => {
    const widths = venueHeaderItemsRef.current
      .filter(Boolean)
      .map((el) => el!.offsetWidth);

    if (widths.length > 0) {
      setVenueWidths(widths);
    }
  }, []);

  useEffect(() => {
    measureVenueWidths();

    window.addEventListener("resize", measureVenueWidths);
    return () => window.removeEventListener("resize", measureVenueWidths);
  }, [measureVenueWidths]);

  const setVenueRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      venueHeaderItemsRef.current[index] = el;
    },
    []
  );

  const totalGridWidth = venueWidths.reduce((sum, width) => sum + width, 0);

  return {
    venueWidths,
    setVenueRef,
    totalGridWidth,
  };
};
