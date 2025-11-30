import dayjs, { Dayjs } from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

interface DaysHeaderProps {
  week: Dayjs[]; // Array of 7 days
  selectedDate?: Dayjs;
  onDateSelect?: (date: Dayjs) => void;
}

export const DaysHeader = ({
  week,
  selectedDate: controlledSelectedDate,
  onDateSelect,
}: DaysHeaderProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [internalSelectedDate, setInternalSelectedDate] = useState(dayjs());
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const selectedDate = controlledSelectedDate ?? internalSelectedDate;

  const handleDateSelect = (date: Dayjs) => {
    if (onDateSelect) {
      onDateSelect(date);
    } else {
      setInternalSelectedDate(date);
    }
  };

  const checkScrollIndicators = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 120;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollIndicators();

    container.addEventListener("scroll", checkScrollIndicators);
    window.addEventListener("resize", checkScrollIndicators);

    return () => {
      container.removeEventListener("scroll", checkScrollIndicators);
      window.removeEventListener("resize", checkScrollIndicators);
    };
  }, [checkScrollIndicators]);

  return (
    <div className="relative flex items-center w-full border border-gray-300  overflow-hidden h-full">
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 z-10 h-full px-1 bg-gradient-to-r from-white via-white to-transparent"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {week.map((date) => {
          const isSelected = date.isSame(selectedDate, "day");
          const isToday = date.isSame(dayjs(), "day");

          return (
            <Button
              key={date.format("YYYY-MM-DD")}
              variant="ghost"
              onClick={() => handleDateSelect(date)}
              className={`
                flex-shrink-0 flex flex-col items-center justify-center 
                w-60 h-full rounded-none border-r border-gray-200 last:border-r-0
                transition-colors p-0 text-center gap-px
                ${
                  isSelected
                    ? "bg-blue-100 text-blue-600 hover:bg-blue-100"
                    : "hover:bg-gray-50"
                }
                ${isToday && !isSelected ? "font-semibold" : ""}
              `}
            >
              <span className="text-xs uppercase tracking-wide opacity-70">
                {date.format("dddd")}
              </span>
              <span className="text-xs">{date.format("YYYY-MM-DD")}</span>
            </Button>
          );
        })}
      </div>

      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 z-10 h-full px-1 bg-gradient-to-l from-white via-white to-transparent"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      )}
    </div>
  );
};
