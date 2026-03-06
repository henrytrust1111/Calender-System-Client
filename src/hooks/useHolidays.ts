import { useEffect, useMemo, useState } from "react";
import { holidayService } from "../services/holidayService";
import { Holiday } from "../types/holiday.types";

interface UseHolidaysResult {
  holidaysByDate: Record<string, Holiday[]>;
  loading: boolean;
  error: string | null;
}

export const useHolidays = (currentMonth: Date, countryCode = "US"): UseHolidaysResult => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadHolidays = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await holidayService.getPublicHolidays(
          currentMonth.getFullYear(),
          countryCode
        );
        if (!cancelled) {
          setHolidays(data);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load public holidays.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadHolidays();

    return () => {
      cancelled = true;
    };
  }, [countryCode, currentMonth]);

  const holidaysByDate = useMemo(() => {
    return holidays.reduce<Record<string, Holiday[]>>((acc, holiday) => {
      if (!acc[holiday.date]) {
        acc[holiday.date] = [];
      }
      acc[holiday.date].push(holiday);
      return acc;
    }, {});
  }, [holidays]);

  return { holidaysByDate, loading, error };
};
