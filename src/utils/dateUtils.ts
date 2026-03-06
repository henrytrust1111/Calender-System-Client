export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const fromDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const formatMonthTitle = (date: Date): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(date);

export const isSameMonth = (left: Date, right: Date): boolean =>
  left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
