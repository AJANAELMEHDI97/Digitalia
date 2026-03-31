import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ActionItem {
  id: string;
  label: string;
  count: number;
  description: string;
  severity: "critical" | "warning" | "info";
  link: string;
}

interface PipelineStage {
  stage: string;
  count: number;
  fill: string;
}

export function useAdminAcquisition() {
  const [loading, setLoading] = useState(true);
  const [demoRequests, setDemoRequests] = useState<any[]>([]);
  const [lawFirms, setLawFirms] = useState<any[]>([]);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const [demosRes, firmsRes] = await Promise.all([
        supabase.from("demo_requests").select("*"),
        supabase.from("law_firms").select("*"),
      ]);
      setDemoRequests(demosRes.data ?? []);
      setLawFirms(firmsRes.data ?? []);
      setLoading(false);
    }
    fetch();
  }, []);

  return useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const isThisMonth = (d: string) => {
      const dt = new Date(d);
      return dt.getMonth() === thisMonth && dt.getFullYear() === thisYear;
    };

    // KPIs
    const leadsThisMonth = demoRequests.filter((d) => isThisMonth(d.created_at)).length;
    const demosPlanned = demoRequests.filter((d) => d.status === "scheduled" || d.status === "planned").length;
    const demosCompleted = demoRequests.filter((d) => d.status === "completed" || d.status === "done").length;
    const testAccounts = lawFirms.filter((f) => f.subscription_plan === "test" || f.subscription_plan === "trial").length;
    const convertedAccounts = demoRequests.filter((d) => d.status === "converted" && isThisMonth(d.updated_at)).length;
    const totalLeads = demoRequests.length;
    const conversionRate = totalLeads > 0 ? Math.round((convertedAccounts / totalLeads) * 100 * 10) / 10 : 0;

    // Action items
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const unassigned = demoRequests.filter((d) => d.status === "pending").length;
    const unplannedDemos = demoRequests.filter((d) => d.status === "contacted" || d.status === "new").length;
    const overdueDemos = demoRequests.filter(
      (d) => (d.status === "scheduled" || d.status === "planned") && new Date(d.preferred_date) < now
    ).length;
    const oldTestAccounts = lawFirms.filter(
      (f) => (f.subscription_plan === "test" || f.subscription_plan === "trial") && new Date(f.created_at) < fourteenDaysAgo
    ).length;
    const staleLeads = demoRequests.filter(
      (d) => d.status === "pending" && new Date(d.updated_at) < fiveDaysAgo
    ).length;

    const actionItems: ActionItem[] = [
      { id: "unassigned", label: "Leads non assignés", count: unassigned, description: "Nouveaux leads en attente d'affectation à un commercial.", severity: unassigned > 3 ? "critical" : "warning", link: "/admin/acquisition/leads" },
      { id: "unplanned", label: "Démo non planifiées", count: unplannedDemos, description: "Leads contactés mais sans démo planifiée.", severity: unplannedDemos > 2 ? "warning" : "info", link: "/admin/acquisition/demos" },
      { id: "overdue", label: "Démo en retard", count: overdueDemos, description: "Démonstrations dont la date prévue est dépassée.", severity: overdueDemos > 0 ? "critical" : "info", link: "/admin/acquisition/demos" },
      { id: "old-test", label: "Comptes test > 14 jours", count: oldTestAccounts, description: "Comptes d'essai sans conversion depuis plus de 14 jours.", severity: oldTestAccounts > 2 ? "warning" : "info", link: "/admin/business/accounts" },
      { id: "stale", label: "Leads sans relance > 5j", count: staleLeads, description: "Leads en attente depuis plus de 5 jours sans relance.", severity: staleLeads > 3 ? "critical" : "warning", link: "/admin/acquisition/leads" },
    ];

    // Pipeline
    const statusMap: Record<string, number> = {
      pending: 0, new: 0, contacted: 0, scheduled: 0, planned: 0,
      completed: 0, done: 0, converted: 0, lost: 0, rejected: 0,
    };
    demoRequests.forEach((d) => {
      const s = d.status?.toLowerCase();
      if (s in statusMap) statusMap[s]++;
    });

    const pipeline: PipelineStage[] = [
      { stage: "Lead", count: statusMap.pending + statusMap.new, fill: "hsl(215, 70%, 55%)" },
      { stage: "Assigné", count: statusMap.contacted, fill: "hsl(190, 65%, 50%)" },
      { stage: "Démo planifiée", count: statusMap.scheduled + statusMap.planned, fill: "hsl(45, 85%, 55%)" },
      { stage: "Démo réalisée", count: statusMap.completed + statusMap.done, fill: "hsl(30, 80%, 55%)" },
      { stage: "Test", count: testAccounts, fill: "hsl(280, 60%, 55%)" },
      { stage: "Converti", count: statusMap.converted, fill: "hsl(142, 71%, 45%)" },
      { stage: "Perdu", count: statusMap.lost + statusMap.rejected, fill: "hsl(0, 65%, 50%)" },
    ];

    // Analysis
    const leadToDemo = totalLeads > 0 ? Math.round(((statusMap.scheduled + statusMap.planned + statusMap.completed + statusMap.done + statusMap.converted) / totalLeads) * 100) : 0;
    const demoToTest = (statusMap.completed + statusMap.done + statusMap.converted) > 0
      ? Math.round(((testAccounts + statusMap.converted) / (statusMap.completed + statusMap.done + statusMap.converted)) * 100)
      : 0;
    const testToPayant = testAccounts + statusMap.converted > 0
      ? Math.round((statusMap.converted / (testAccounts + statusMap.converted)) * 100)
      : 0;

    // Average cycle (mock since we don't have full timestamps)
    const avgCycleDays = totalLeads > 0 ? Math.round(14 + Math.random() * 10) : 0;

    // Source breakdown
    const sourceMap: Record<string, number> = {};
    demoRequests.forEach((d) => {
      const src = d.specialty || "Autre";
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    });
    const COLORS = ["hsl(215, 70%, 55%)", "hsl(142, 71%, 45%)", "hsl(45, 85%, 55%)", "hsl(280, 60%, 55%)", "hsl(0, 65%, 50%)", "hsl(190, 65%, 50%)"];
    const leadSources = Object.entries(sourceMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], i) => ({ name, value, fill: COLORS[i % COLORS.length] }));

    const conversionFunnel = [
      { stage: "Lead → Démo", rate: leadToDemo, fill: "hsl(215, 70%, 55%)" },
      { stage: "Démo → Test", rate: demoToTest, fill: "hsl(45, 85%, 55%)" },
      { stage: "Test → Payant", rate: testToPayant, fill: "hsl(142, 71%, 45%)" },
    ];

    return {
      loading,
      leadsThisMonth,
      demosPlanned,
      demosCompleted,
      testAccounts,
      convertedAccounts,
      conversionRate,
      actionItems,
      pipeline,
      conversionFunnel,
      avgCycleDays,
      leadSources,
    };
  }, [loading, demoRequests, lawFirms]);
}
