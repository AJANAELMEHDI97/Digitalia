import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";

export interface Appointment {
  id: string;
  cm_user_id: string;
  lawyer_user_id: string;
  law_firm_id: string | null;
  scheduled_at: string;
  duration_minutes: number;
  type: string;
  status: string;
  created_at: string;
  cm_name: string;
  lawyer_name: string;
  firm_name: string | null;
}

export interface CMStatus {
  user_id: string;
  full_name: string;
  is_online: boolean;
  last_activity_at: string | null;
  last_action_type: string | null;
  next_appointment_at: string | null;
}

export function useAdminAppointments(filter: "today" | "week" | "all", cmFilter: string | null) {
  const now = new Date();
  const todayStart = startOfDay(now).toISOString();
  const todayEnd = endOfDay(now).toISOString();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }).toISOString();

  return useQuery({
    queryKey: ["admin-appointments", filter, cmFilter],
    queryFn: async () => {
      // Fetch appointments
      let query = supabase.from("admin_cm_appointments").select("*");

      if (filter === "today") {
        query = query.gte("scheduled_at", todayStart).lte("scheduled_at", todayEnd);
      } else if (filter === "week") {
        query = query.gte("scheduled_at", weekStart).lte("scheduled_at", weekEnd);
      }

      if (cmFilter) {
        query = query.eq("cm_user_id", cmFilter);
      }

      query = query.order("scheduled_at", { ascending: true });

      const { data: appointments, error } = await query;
      if (error) throw error;

      if (!appointments || appointments.length === 0) {
        return { appointments: [] as Appointment[], todayCount: 0, weekCount: 0, missedCount: 0 };
      }

      // Get unique user IDs for profiles
      const userIds = [...new Set([
        ...appointments.map(a => a.cm_user_id),
        ...appointments.map(a => a.lawyer_user_id),
      ])];
      const firmIds = [...new Set(appointments.map(a => a.law_firm_id).filter(Boolean))] as string[];

      const [profilesRes, firmsRes] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name").in("user_id", userIds),
        firmIds.length > 0
          ? supabase.from("law_firms").select("id, name").in("id", firmIds)
          : Promise.resolve({ data: [] }),
      ]);

      const profileMap = new Map((profilesRes.data || []).map(p => [p.user_id, p.full_name || "Inconnu"]));
      const firmMap = new Map(((firmsRes as any).data || []).map((f: any) => [f.id, f.name]));

      const enriched: Appointment[] = appointments.map(a => ({
        ...a,
        cm_name: profileMap.get(a.cm_user_id) || "CM inconnu",
        lawyer_name: profileMap.get(a.lawyer_user_id) || "Avocat inconnu",
        firm_name: a.law_firm_id ? (firmMap.get(a.law_firm_id) as string) || null : null,
      }));

      // Counts (always unfiltered for indicators)
      const [todayRes, weekRes, missedRes] = await Promise.all([
        supabase.from("admin_cm_appointments").select("id", { count: "exact", head: true })
          .gte("scheduled_at", todayStart).lte("scheduled_at", todayEnd),
        supabase.from("admin_cm_appointments").select("id", { count: "exact", head: true })
          .gte("scheduled_at", weekStart).lte("scheduled_at", weekEnd),
        supabase.from("admin_cm_appointments").select("id", { count: "exact", head: true })
          .eq("status", "missed"),
      ]);

      return {
        appointments: enriched,
        todayCount: todayRes.count || 0,
        weekCount: weekRes.count || 0,
        missedCount: missedRes.count || 0,
      };
    },
    staleTime: 30_000,
  });
}

export function useAdminCMStatus() {
  return useQuery({
    queryKey: ["admin-cm-status"],
    queryFn: async () => {
      // Get all CMs
      const { data: cmRoles, error: rolesErr } = await supabase
        .from("user_roles_simple")
        .select("user_id")
        .eq("role", "community_manager");
      if (rolesErr) throw rolesErr;
      if (!cmRoles || cmRoles.length === 0) return [] as CMStatus[];

      const cmIds = cmRoles.map(r => r.user_id);

      // Fetch profiles, last activity, next appointments in parallel
      const [profilesRes, logsRes, appointmentsRes] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name").in("user_id", cmIds),
        supabase.from("cm_activity_logs")
          .select("cm_user_id, created_at, action_type")
          .in("cm_user_id", cmIds)
          .order("created_at", { ascending: false }),
        supabase.from("admin_cm_appointments")
          .select("cm_user_id, scheduled_at")
          .in("cm_user_id", cmIds)
          .eq("status", "upcoming")
          .gt("scheduled_at", new Date().toISOString())
          .order("scheduled_at", { ascending: true }),
      ]);

      const profileMap = new Map((profilesRes.data || []).map(p => [p.user_id, p.full_name || "CM"]));

      // Latest log per CM
      const latestLog = new Map<string, { created_at: string; action_type: string }>();
      for (const log of (logsRes.data || [])) {
        if (!latestLog.has(log.cm_user_id)) {
          latestLog.set(log.cm_user_id, { created_at: log.created_at, action_type: log.action_type });
        }
      }

      // Next appointment per CM
      const nextAppt = new Map<string, string>();
      for (const appt of (appointmentsRes.data || [])) {
        if (!nextAppt.has(appt.cm_user_id)) {
          nextAppt.set(appt.cm_user_id, appt.scheduled_at);
        }
      }

      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

      return cmIds.map((id): CMStatus => {
        const log = latestLog.get(id);
        return {
          user_id: id,
          full_name: profileMap.get(id) || "CM",
          is_online: log ? new Date(log.created_at) > fiveMinAgo : false,
          last_activity_at: log?.created_at || null,
          last_action_type: log?.action_type || null,
          next_appointment_at: nextAppt.get(id) || null,
        };
      });
    },
    staleTime: 30_000,
  });
}
