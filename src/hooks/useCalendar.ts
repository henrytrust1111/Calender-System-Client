import { useCallback, useMemo, useState } from "react";
import { CalendarDay, generateCalendar } from "../utils/calendarUtils";
import { formatMonthTitle } from "../utils/dateUtils";

interface UseCalendarResult {
  currentMonth: Date;
  days: CalendarDay[];
  monthTitle: string;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
}

export const useCalendar = (): UseCalendarResult => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const days = useMemo(
    () => generateCalendar(currentMonth.getFullYear(), currentMonth.getMonth()),
    [currentMonth]
  );

  const monthTitle = useMemo(() => formatMonthTitle(currentMonth), [currentMonth]);

  return { currentMonth, days, monthTitle, goToPreviousMonth, goToNextMonth };
};
