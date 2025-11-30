import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { DaysHeader } from "./components/days-header";
import { EventWindow } from "./components/event-window";
import { getWeekDays } from "./lib/utils";

dayjs.extend(isoWeek);

function App() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [currentWeekStart, setCurrentWeekStart] = useState(
    dayjs().startOf("isoWeek")
  );
  const week = getWeekDays(currentWeekStart);

  const handlePreviousWeek = () => {
    const newWeekStart = currentWeekStart.subtract(1, "week");
    setCurrentWeekStart(newWeekStart);
    setSelectedDate(newWeekStart);
  };

  const handleNextWeek = () => {
    const newWeekStart = currentWeekStart.add(1, "week");
    setCurrentWeekStart(newWeekStart);
    setSelectedDate(newWeekStart);
  };

  return (
    <div>
      <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <h1 className="text-lg font-semibold">Event Time Table</h1>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousWeek}
            title="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-md border border-gray-200 min-w-[200px] text-center">
            {currentWeekStart.format("MMM D")} -{" "}
            {currentWeekStart.add(6, "day").format("MMM D, YYYY")}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextWeek}
            title="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <section className="h-14 w-full overflow-hidden sticky top-16 z-10">
        <DaysHeader
          week={week}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      </section>
      <section className="flex-1 overflow-auto h-[calc(100vh-8rem)]">
        <EventWindow selectedDate={selectedDate} />
      </section>
    </div>
  );
}

export default App;
