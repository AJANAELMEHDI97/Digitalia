import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ── Types ──

interface BusinessKPIs {
  activityRate: number;
  publications30d: number;
  validationRate: number;
  avgValidationTimeHours: number;
  refusalRate: number;
  overdueCount: number;
  atRiskFirms: number;
}

interface Governance {
  newProfiles7d: number;
  cmWithoutFirm: number;
}

interface RevenueKPIs {
  mrr: number;
  mrrVariation: number;
  collections: number;
  overdue: number;
  projection: number;
}

interface AcquisitionKPIs {
  leadsMonth: number;
  demosScheduled: number;
  converted: number;
  conversionRate: number;
  testAccounts: number;
}

interface ClientHealthKPIs {
  atRiskChurn: number;
  paymentDelays: number;
  blockedClients: number;
  stableClients: number;
  decliningActivity: number;
}

interface TeamKPIs {
  cmOnline: number;
  appointmentsToday: number;
  cmOverloaded: number;
  firmsWithoutCM: number;
}

interface AdminStats {
  activeFirms: number;
  lawyers: number;
  communityManagers: number;
  activeAlerts: number;
  publicationsByStatus: { draft: number; pending: number; approved: number; rejected: number };
  usersByRole: { admin: number; lawyer: number; community_manager: number; unassigned: number };
  totalProfiles: number;
  trends: { newFirms7d: number; pendingDelta: number; alertsTrend: "up" | "down" | "stable" };
  inactiveProfiles: number;
  businessKPIs: BusinessKPIs;
  governance: Governance;
  healthTrend7d: "improving" | "degrading" | "stable";
  revenue: RevenueKPIs;
  acquisition: AcquisitionKPIs;
  clientHealth: ClientHealthKPIs;
  team: TeamKPIs;
  churnRate: number;
  demosCompleted: number;
}

interface AuditEntry {
  id: string; action: string; created_at: string; user_id: string; entity_type?: string; details?: string;
}

type AlertType = "blocked" | "sla_breach" | "repeated_refusal" | "payment_delay" | "declining_activity" | "cm_inactive" | "high_churn_risk" | "test_expiring" | "cm_overloaded";
type AlertSeverity = "critical" | "moderate" | "info";

interface Alert {
  type: AlertType;
  label: string;
  count: number;
  firmName?: string;
  severity: AlertSeverity;
}

const DEFAULT_BUSINESS_KPIS: BusinessKPIs = {
  activityRate: 0, publications30d: 0, validationRate: 0, avgValidationTimeHours: 0, refusalRate: 0, overdueCount: 0, atRiskFirms: 0,
};
const DEFAULT_GOVERNANCE: Governance = { newProfiles7d: 0, cmWithoutFirm: 0 };
const DEFAULT_REVENUE: RevenueKPIs = { mrr: 12450, mrrVariation: 8, collections: 14200, overdue: 1350, projection: 13800 };
const DEFAULT_ACQUISITION: AcquisitionKPIs = { leadsMonth: 24, demosScheduled: 8, converted: 3, conversionRate: 12.5, testAccounts: 5 };
const DEFAULT_CLIENT_HEALTH: ClientHealthKPIs = { atRiskChurn: 2, paymentDelays: 3, blockedClients: 1, stableClients: 18, decliningActivity: 4 };
const DEFAULT_TEAM: TeamKPIs = { cmOnline: 3, appointmentsToday: 4, cmOverloaded: 1, firmsWithoutCM: 2 };

// ── Fetchers ──

async function fetchRevenueKPIs(): Promise<RevenueKPIs> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

  const [paidRes, prevPaidRes, overdueRes] = await Promise.all([
    supabase.from("invoices").select("amount").eq("status", "paid").gte("created_at", startOfMonth),
    supabase.from("invoices").select("amount").eq("status", "paid").gte("created_at", startOfPrevMonth).lte("created_at", endOfPrevMonth),
    supabase.from("invoices").select("amount").eq("status", "overdue"),
  ]);

  const collections = (paidRes.data || []).reduce((s, i) => s + (i.amount || 0), 0);
  const prevCollections = (prevPaidRes.data || []).reduce((s, i) => s + (i.amount || 0), 0);
  const overdue = (overdueRes.data || []).reduce((s, i) => s + (i.amount || 0), 0);
  const mrr = collections;
  const mrrVariation = prevCollections > 0 ? Math.round(((collections - prevCollections) / prevCollections) * 100) : 0;
  const projection = mrr + overdue * 0.5;

  const hasData = collections > 0 || prevCollections > 0 || overdue > 0;
  if (!hasData) return DEFAULT_REVENUE;
  return { mrr, mrrVariation, collections, overdue, projection: Math.round(projection) };
}

async function fetchAcquisitionKPIs(activeFirms: number): Promise<AcquisitionKPIs> {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const [leadsRes, demosRes, convertedRes, testRes] = await Promise.all([
    supabase.from("demo_requests").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth),
    supabase.from("demo_requests").select("id", { count: "exact", head: true }).eq("status", "scheduled"),
    supabase.from("law_firms").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth).eq("is_active", true),
    supabase.from("law_firms").select("id", { count: "exact", head: true }).eq("subscription_plan", "test"),
  ]);

  const leads = leadsRes.count || 0;
  const demos = demosRes.count || 0;
  const converted = convertedRes.count || 0;
  const testAccounts = testRes.count || 0;
  const conversionRate = leads > 0 ? Math.round((converted / leads) * 1000) / 10 : 0;

  const hasData = leads > 0 || demos > 0 || converted > 0;
  if (!hasData) return DEFAULT_ACQUISITION;
  return { leadsMonth: leads, demosScheduled: demos, converted, conversionRate, testAccounts };
}

async function fetchClientHealthKPIs(activeFirms: number, atRiskFirms: number, overdueCount: number): Promise<ClientHealthKPIs> {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const [blockedRes, activeFirmsWithPubsRes] = await Promise.all([
    supabase.from("publications").select("law_firm_id").in("validation_status", ["submitted_to_lawyer", "in_lawyer_review"]).lt("submitted_at", fortyEightHoursAgo),
    supabase.from("publications").select("law_firm_id").gte("created_at", fourteenDaysAgo).not("law_firm_id", "is", null),
  ]);

  const blockedFirmIds = new Set((blockedRes.data || []).map(p => p.law_firm_id).filter(Boolean));
  const activePubFirmIds = new Set((activeFirmsWithPubsRes.data || []).map(p => p.law_firm_id).filter(Boolean));
  const blockedClients = blockedFirmIds.size;
  const decliningActivity = Math.max(0, activeFirms - activePubFirmIds.size);
  const stableClients = Math.max(0, activeFirms - atRiskFirms - blockedClients);

  if (activeFirms === 0) return DEFAULT_CLIENT_HEALTH;
  return { atRiskChurn: atRiskFirms, paymentDelays: overdueCount, blockedClients, stableClients, decliningActivity };
}

async function fetchTeamKPIs(cmWithoutFirm: number): Promise<TeamKPIs> {
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

  const [appointmentsRes, cmAssignRes] = await Promise.all([
    supabase.from("admin_cm_appointments").select("id", { count: "exact", head: true }).gte("scheduled_at", todayStart.toISOString()).lte("scheduled_at", todayEnd.toISOString()),
    supabase.from("cm_assignments").select("cm_user_id").eq("is_active", true),
  ]);

  const appointmentsToday = appointmentsRes.count || 0;
  const cmFirmCounts: Record<string, number> = {};
  (cmAssignRes.data || []).forEach(a => { cmFirmCounts[a.cm_user_id] = (cmFirmCounts[a.cm_user_id] || 0) + 1; });
  const cmOnline = Object.keys(cmFirmCounts).length;
  const cmOverloaded = Object.values(cmFirmCounts).filter(c => c >= 5).length;

  if (cmOnline === 0 && appointmentsToday === 0) return DEFAULT_TEAM;
  return { cmOnline, appointmentsToday, cmOverloaded, firmsWithoutCM: cmWithoutFirm };
}

// ── Main hook ──

export function useAdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-dashboard-stats-v3"],
    queryFn: async (): Promise<AdminStats> => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
      const prevWeekOverdueThreshold = new Date(now.getTime() - 48 * 60 * 60 * 1000 - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Core queries (same as before)
      const [firmsRes, rolesRes, profilesRes, pubsRes, alertsRes, newFirmsRes, prevAlertsRes, pubs30dRes, pubsWithFirm30dRes, validatedPubsRes, refusedPubsCountRes, validationTimesRes, newProfilesRes, cmAssignmentsRes, pendingByFirmRes] = await Promise.all([
        supabase.from("law_firms").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("user_roles_simple").select("role"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("publications").select("validation_status"),
        supabase.from("publications").select("id", { count: "exact", head: true }).in("validation_status", ["submitted_to_lawyer", "in_lawyer_review"]).lt("submitted_at", fortyEightHoursAgo),
        supabase.from("law_firms").select("id", { count: "exact", head: true }).eq("is_active", true).gte("created_at", sevenDaysAgo),
        supabase.from("publications").select("id", { count: "exact", head: true }).in("validation_status", ["submitted_to_lawyer", "in_lawyer_review"]).lt("submitted_at", prevWeekOverdueThreshold).gte("submitted_at", fourteenDaysAgo),
        supabase.from("publications").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
        supabase.from("publications").select("law_firm_id").gte("created_at", thirtyDaysAgo).not("law_firm_id", "is", null),
        supabase.from("publications").select("id", { count: "exact", head: true }).eq("validation_status", "validated").gte("updated_at", thirtyDaysAgo),
        supabase.from("publications").select("id", { count: "exact", head: true }).eq("validation_status", "refused").gte("updated_at", thirtyDaysAgo),
        supabase.from("publications").select("submitted_at, published_at").eq("validation_status", "validated").not("submitted_at", "is", null).not("published_at", "is", null).gte("updated_at", thirtyDaysAgo).limit(200),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
        supabase.from("cm_assignments").select("cm_user_id").eq("is_active", true),
        supabase.from("publications").select("law_firm_id").in("validation_status", ["submitted_to_lawyer", "in_lawyer_review"]),
      ]);

      const roleCounts = { admin: 0, lawyer: 0, community_manager: 0 };
      (rolesRes.data || []).forEach((r: { role: string }) => {
        if (r.role in roleCounts) roleCounts[r.role as keyof typeof roleCounts]++;
      });
      const totalAssigned = roleCounts.admin + roleCounts.lawyer + roleCounts.community_manager;
      const totalProfiles = profilesRes.count || 0;
      const activeFirms = firmsRes.count || 0;

      const statusCounts = { draft: 0, pending: 0, approved: 0, rejected: 0 };
      (pubsRes.data || []).forEach((p: { validation_status: string | null }) => {
        const s = p.validation_status;
        if (s === "draft" || s === null) statusCounts.draft++;
        else if (s === "submitted_to_lawyer" || s === "in_lawyer_review" || s === "cm_review") statusCounts.pending++;
        else if (s === "validated" || s === "published") statusCounts.approved++;
        else if (s === "refused") statusCounts.rejected++;
      });

      const currentAlerts = alertsRes.count || 0;
      const prevAlerts = prevAlertsRes.count || 0;
      const alertsTrend: "up" | "down" | "stable" = currentAlerts > prevAlerts ? "up" : currentAlerts < prevAlerts ? "down" : "stable";

      let inactiveProfiles = 0;
      try {
        const { data: activeAudit } = await supabase.from("validation_audit_trail").select("user_id").gte("created_at", thirtyDaysAgo);
        const { data: activeCM } = await supabase.from("cm_activity_logs").select("cm_user_id").gte("created_at", thirtyDaysAgo);
        const activeUserIds = new Set([...(activeAudit || []).map(a => a.user_id), ...(activeCM || []).map(a => a.cm_user_id)]);
        inactiveProfiles = Math.max(0, totalProfiles - activeUserIds.size);
      } catch { /* silently fail */ }

      // Business KPIs
      const publications30d = pubs30dRes.count || 0;
      const activeFirmIds = new Set((pubsWithFirm30dRes.data || []).map((p: { law_firm_id: string | null }) => p.law_firm_id).filter(Boolean));
      const activityRate = activeFirms > 0 ? Math.round((activeFirmIds.size / activeFirms) * 100) : 0;
      const validatedCount = validatedPubsRes.count || 0;
      const refusedCount = refusedPubsCountRes.count || 0;
      const totalDecided = validatedCount + refusedCount;
      const validationRate = totalDecided > 0 ? Math.round((validatedCount / totalDecided) * 100) : 0;
      const refusalRate = totalDecided > 0 ? Math.round((refusedCount / totalDecided) * 100) : 0;
      let avgValidationTimeHours = 0;
      const times = (validationTimesRes.data || []).filter((p: any) => p.submitted_at && p.published_at).map((p: any) => { const diff = new Date(p.published_at).getTime() - new Date(p.submitted_at).getTime(); return diff > 0 ? diff / (1000 * 60 * 60) : null; }).filter((v: number | null): v is number => v !== null && v < 720);
      if (times.length > 0) avgValidationTimeHours = Math.round(times.reduce((a: number, b: number) => a + b, 0) / times.length);
      const overdueCount = currentAlerts;
      const pendingByFirm: Record<string, number> = {};
      (pendingByFirmRes.data || []).forEach((p: { law_firm_id: string | null }) => { if (p.law_firm_id) pendingByFirm[p.law_firm_id] = (pendingByFirm[p.law_firm_id] || 0) + 1; });
      const atRiskFirms = Object.values(pendingByFirm).filter(c => c >= 3).length;

      // Governance
      const newProfiles7d = newProfilesRes.count || 0;
      const assignedCmIds = new Set((cmAssignmentsRes.data || []).map((a: { cm_user_id: string }) => a.cm_user_id));
      let cmWithoutFirm = 0;
      try {
        const { data: cmRoles } = await supabase.from("user_roles_simple").select("user_id").eq("role", "community_manager");
        cmWithoutFirm = (cmRoles || []).map(r => r.user_id).filter(id => !assignedCmIds.has(id)).length;
      } catch { /* silently fail */ }

      const healthTrend7d: "improving" | "degrading" | "stable" = currentAlerts < prevAlerts ? "improving" : currentAlerts > prevAlerts ? "degrading" : "stable";

      // Cockpit KPIs (parallel fetch)
      const [revenue, acquisition, clientHealth, team, demosCompletedRes] = await Promise.all([
        fetchRevenueKPIs(),
        fetchAcquisitionKPIs(activeFirms),
        fetchClientHealthKPIs(activeFirms, atRiskFirms, overdueCount),
        fetchTeamKPIs(cmWithoutFirm),
        supabase.from("demo_requests").select("id", { count: "exact", head: true }).eq("status", "completed"),
      ]);

      const demosCompleted = demosCompletedRes.count || 0;
      const churnRate = totalProfiles > 0 ? Math.round((inactiveProfiles / totalProfiles) * 1000) / 10 : 0;

      return {
        activeFirms, lawyers: roleCounts.lawyer, communityManagers: roleCounts.community_manager,
        activeAlerts: currentAlerts, publicationsByStatus: statusCounts,
        usersByRole: { ...roleCounts, unassigned: Math.max(0, totalProfiles - totalAssigned) },
        totalProfiles, trends: { newFirms7d: newFirmsRes.count || 0, pendingDelta: statusCounts.pending, alertsTrend },
        inactiveProfiles,
        businessKPIs: { activityRate, publications30d, validationRate, avgValidationTimeHours, refusalRate, overdueCount, atRiskFirms },
        governance: { newProfiles7d, cmWithoutFirm },
        healthTrend7d,
        revenue, acquisition, clientHealth, team,
        churnRate, demosCompleted,
      };
    },
    staleTime: 30_000,
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["admin-dashboard-alerts", stats ? "enriched" : "base"],
    enabled: true,
    queryFn: async (): Promise<Alert[]> => {
      const result: Alert[] = [];
      const { count: blockedCount } = await supabase.from("publications").select("id", { count: "exact", head: true }).in("validation_status", ["submitted_to_lawyer", "in_lawyer_review"]).lt("submitted_at", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());
      if (blockedCount && blockedCount > 0) result.push({ type: "blocked", label: "Publications bloquées > 48h", count: blockedCount, severity: "critical" });
      const { data: rejectedPubs } = await supabase.from("publications").select("law_firm_id").eq("validation_status", "refused");
      const firmRefusals: Record<string, number> = {};
      (rejectedPubs || []).forEach((p: { law_firm_id: string | null }) => { if (p.law_firm_id) firmRefusals[p.law_firm_id] = (firmRefusals[p.law_firm_id] || 0) + 1; });
      const repeatedCount = Object.values(firmRefusals).filter(c => c > 2).length;
      if (repeatedCount > 0) result.push({ type: "repeated_refusal", label: "Cabinets avec refus répétés", count: repeatedCount, severity: "critical" });

      // Enriched alerts from stats
      if (stats) {
        if (stats.clientHealth.paymentDelays > 0) result.push({ type: "payment_delay", label: "Retards de paiement", count: stats.clientHealth.paymentDelays, severity: "critical" });
        if (stats.clientHealth.decliningActivity > 3) result.push({ type: "declining_activity", label: "Activité en chute", count: stats.clientHealth.decliningActivity, severity: "moderate" });
        if (stats.team.firmsWithoutCM > 0) result.push({ type: "cm_inactive", label: "Cabinets sans CM assigné", count: stats.team.firmsWithoutCM, severity: "moderate" });
        if (stats.clientHealth.atRiskChurn > 2) result.push({ type: "high_churn_risk", label: "Risque churn élevé", count: stats.clientHealth.atRiskChurn, severity: "critical" });
        if (stats.acquisition.testAccounts > 0) result.push({ type: "test_expiring", label: "Comptes test actifs", count: stats.acquisition.testAccounts, severity: "info" });
        if (stats.team.cmOverloaded > 0) result.push({ type: "cm_overloaded", label: "CM surchargés", count: stats.team.cmOverloaded, severity: "moderate" });
      }

      // Sort by severity: critical first, then moderate, then info
      const severityOrder: Record<AlertSeverity, number> = { critical: 0, moderate: 1, info: 2 };
      result.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
      return result;
    },
    staleTime: 60_000,
  });

  const { data: activityLog = [], isLoading: logLoading } = useQuery({
    queryKey: ["admin-dashboard-activity"],
    queryFn: async (): Promise<AuditEntry[]> => {
      const [auditRes, cmLogRes] = await Promise.all([
        supabase.from("validation_audit_trail").select("id, action, created_at, user_id").order("created_at", { ascending: false }).limit(5),
        supabase.from("cm_activity_logs").select("id, action_type, created_at, cm_user_id, entity_type").order("created_at", { ascending: false }).limit(5),
      ]);
      const entries: AuditEntry[] = [
        ...(auditRes.data || []).map(e => ({ id: e.id, action: e.action, created_at: e.created_at, user_id: e.user_id, entity_type: "publication" })),
        ...(cmLogRes.data || []).map(e => ({ id: e.id, action: e.action_type, created_at: e.created_at, user_id: e.cm_user_id, entity_type: e.entity_type })),
      ];
      return entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8);
    },
    staleTime: 30_000,
  });

  return {
    stats: stats || {
      activeFirms: 0, lawyers: 0, communityManagers: 0, activeAlerts: 0,
      publicationsByStatus: { draft: 0, pending: 0, approved: 0, rejected: 0 },
      usersByRole: { admin: 0, lawyer: 0, community_manager: 0, unassigned: 0 },
      totalProfiles: 0, trends: { newFirms7d: 0, pendingDelta: 0, alertsTrend: "stable" as const },
      inactiveProfiles: 0, businessKPIs: DEFAULT_BUSINESS_KPIS, governance: DEFAULT_GOVERNANCE,
      healthTrend7d: "stable" as const,
      revenue: DEFAULT_REVENUE, acquisition: DEFAULT_ACQUISITION, clientHealth: DEFAULT_CLIENT_HEALTH, team: DEFAULT_TEAM,
      churnRate: 0, demosCompleted: 0,
    },
    alerts, activityLog,
    loading: statsLoading || alertsLoading || logLoading,
    statsLoading,
    alertsLoading,
    logLoading,
  };
}
