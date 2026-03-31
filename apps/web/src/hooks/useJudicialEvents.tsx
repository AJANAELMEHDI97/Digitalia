import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isWithinInterval, startOfMonth, endOfMonth, parseISO } from "date-fns";

export interface JudicialEvent {
  id: string;
  date: string;
  end_date: string | null;
  title: string;
  description: string | null;
  thematic: string;
  sensitivity: "opportune" | "surveiller" | "eviter" | null;
  sensitivity_reason: string | null;
  speaking_guidance: string | null;
  linked_trends: string[] | null;
  source: string | null;
  created_at: string;
}

export type JudicialEventSensitivity = "opportune" | "surveiller" | "eviter" | "all";

export function useJudicialEvents() {
  const [events, setEvents] = useState<JudicialEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("judicial_events")
        .select("*")
        .order("date", { ascending: true });

      if (fetchError) throw fetchError;
      
      setEvents((data || []) as JudicialEvent[]);
    } catch (err) {
      console.error("Error fetching judicial events:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch judicial events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Get events for a specific month
  const getEventsForMonth = useMemo(() => {
    return (year: number, month: number) => {
      const monthStart = startOfMonth(new Date(year, month - 1));
      const monthEnd = endOfMonth(new Date(year, month - 1));

      return events.filter(event => {
        const eventDate = parseISO(event.date);
        const eventEndDate = event.end_date ? parseISO(event.end_date) : eventDate;

        // Event is in month if it starts, ends, or spans the month
        return (
          isWithinInterval(eventDate, { start: monthStart, end: monthEnd }) ||
          isWithinInterval(eventEndDate, { start: monthStart, end: monthEnd }) ||
          (eventDate <= monthStart && eventEndDate >= monthEnd)
        );
      });
    };
  }, [events]);

  // Get events by thematic
  const getEventsByThematic = useMemo(() => {
    return (thematic: string) => {
      return events.filter(e => e.thematic === thematic);
    };
  }, [events]);

  // Get events by sensitivity
  const getEventsBySensitivity = useMemo(() => {
    return (sensitivity: JudicialEventSensitivity) => {
      if (sensitivity === "all") return events;
      return events.filter(e => e.sensitivity === sensitivity);
    };
  }, [events]);

  // Get upcoming events
  const getUpcomingEvents = useMemo(() => {
    return (limit: number = 5) => {
      const now = new Date();
      return events
        .filter(e => parseISO(e.date) >= now)
        .slice(0, limit);
    };
  }, [events]);

  // Get thematics
  const thematics = useMemo(() => {
    return [...new Set(events.map(e => e.thematic))];
  }, [events]);

  return {
    events,
    loading,
    error,
    getEventsForMonth,
    getEventsByThematic,
    getEventsBySensitivity,
    getUpcomingEvents,
    thematics,
    refetch: fetchEvents
  };
}
