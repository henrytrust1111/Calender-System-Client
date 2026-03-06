import { isSameMonth, toDateKey } from "./dateUtils";

export interface CalendarDay {
  date: string;
  isCurrentMonth: boolean;
}

export const generateCalendar = (year: number, month: number): CalendarDay[] => {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());

  const gridEnd = new Date(monthEnd);
  gridEnd.setDate(monthEnd.getDate() + (6 - monthEnd.getDay()));

  const days: CalendarDay[] = [];
  const cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    days.push({
      date: toDateKey(cursor),
      isCurrentMonth: isSameMonth(cursor, monthStart)
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  if (days.length < 35) {
    const last = new Date(fromDateKey(days[days.length - 1].date));
    while (days.length < 35) {
      last.setDate(last.getDate() + 1);
      days.push({
        date: toDateKey(last),
        isCurrentMonth: isSameMonth(last, monthStart)
      });
    }
  } else if (days.length > 35 && days.length < 42) {
    const last = new Date(fromDateKey(days[days.length - 1].date));
    while (days.length < 42) {
      last.setDate(last.getDate() + 1);
      days.push({
        date: toDateKey(last),
        isCurrentMonth: isSameMonth(last, monthStart)
      });
    }
  }

  return days;
};

const fromDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};
