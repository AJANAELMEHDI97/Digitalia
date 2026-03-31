import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, parse, isAfter, isBefore, addMonths } from "date-fns";
import { fr } from "date-fns/locale";

export interface KeyDate {
  id: string;
  month_day: string; // Format MM-DD
  title: string;
  description: string | null;
  importance: "high" | "medium" | "low" | null;
  speaking_opportunities: string[] | null;
  recommended_platforms: string[] | null;
  category: string;
  is_recurring: boolean;
  created_at: string;
  // Computed field for current year
  date?: Date;
}

export function useKeyDates() {
  const [keyDates, setKeyDates] = useState<KeyDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKeyDates = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("key_dates")
        .select("*")
        .order("month_day", { ascending: true });

      if (fetchError) throw fetchError;
      
      setKeyDates((data || []) as KeyDate[]);
    } catch (err) {
      console.error("Error fetching key dates:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch key dates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeyDates();
  }, []);

  // Get key dates for a specific month/year with computed dates
  const getKeyDatesForMonth = useMemo(() => {
    return (year: number, month: number) => {
      const monthStr = String(month).padStart(2, "0");
      
      return keyDates
        .filter(kd => kd.month_day.startsWith(monthStr + "-"))
        .map(kd => {
          const [mm, dd] = kd.month_day.split("-");
          return {
            ...kd,
            date: new Date(year, parseInt(mm) - 1, parseInt(dd))
          };
        })
        .sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));
    };
  }, [keyDates]);

  // Get upcoming key dates (next N days)
  const getUpcomingKeyDates = useMemo(() => {
    return (limit: number = 3) => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const nextYear = currentYear + 1;

      const allDatesWithYear = keyDates.flatMap(kd => {
        const [mm, dd] = kd.month_day.split("-");
        const thisYearDate = new Date(currentYear, parseInt(mm) - 1, parseInt(dd));
        const nextYearDate = new Date(nextYear, parseInt(mm) - 1, parseInt(dd));

        const dates: (KeyDate & { date: Date })[] = [];
        
        if (isAfter(thisYearDate, now)) {
          dates.push({ ...kd, date: thisYearDate });
        }
        if (kd.is_recurring) {
          dates.push({ ...kd, date: nextYearDate });
        }

        return dates;
      });

      return allDatesWithYear
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, limit);
    };
  }, [keyDates]);

  // Get key dates by category
  const getKeyDatesByCategory = useMemo(() => {
    return (category: string) => {
      return keyDates.filter(kd => kd.category === category);
    };
  }, [keyDates]);

  // Get categories
  const categories = useMemo(() => {
    return [...new Set(keyDates.map(kd => kd.category))];
  }, [keyDates]);

  return {
    keyDates,
    loading,
    error,
    getKeyDatesForMonth,
    getUpcomingKeyDates,
    getKeyDatesByCategory,
    categories,
    refetch: fetchKeyDates
  };
}
