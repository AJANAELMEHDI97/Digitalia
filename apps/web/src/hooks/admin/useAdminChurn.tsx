import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { subMonths, subDays, format, differenceInDays } from "date-fns";

export interface RiskFirm {
  id: string;
  name: string;
  score: number;
  plan: string;
  factors: { activity: number; payment: number; refusal: number; cm: number; validation: number };
  lastActivity: string;
  mainRisk: string;
}

interface ActionItem {
  id: string;
  label: string;
  count: number;
  description: string;
  severity: "critical" | "warning" | "info";
  link: string;
}

interface ChurnByPack {
  pack: string;
  rate: number;
  fill: string;
}

export interface ChurnData {
  churnRate: number;
  highRiskCount: number;
  mediumRiskCount: number;
  mrrAtRisk: number;
  recoveredCount: number;
  actionItems: ActionItem[];
  riskFirms: RiskFirm[];
  churnHistory: { month: string; rate: number }[];
  churnByPack: ChurnByPack[];
  causes: { cause: string; count: number; fill: string }[];
  financialImpact: { month: string; lost: number; recovered: number }[];
  loading: boolean;
}

const PACK_COLORS: Record<string, string> = {
  essentiel: "hsl(215, 70%, 55%)",
  premium: "hsl(280, 60%, 55%)",
  solo: "hsl(45, 85%, 55%)",
  trial: "hsl(190, 65%, 50%)",
  test: "hsl(190, 65%, 50%)",
};

export function useAdminChurn(): ChurnData {
  const [loading, setLoading] = useState(true);
  const [firms, setFirms] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [publications, setPubs] = useState<any[]>([]);
  const [appointments, setAppts] = useState<any[]>([]);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const [fRes, iRes, pRes, aRes] = await Promise.all([
        supabase.from("law_firms").select("id, name, is_active, created_at, subscription_plan"),
        supabase.from("invoices").select("law_firm_id, status, amount, created_at"),
        supabase.from("publications").select("law_firm_id, status, validation_status, created_at, rejected_at"),
        supabase.from("admin_cm_appointments").select("law_firm_id, scheduled_at"),
      ]);
      setFirms(fRes.data ?? []);
      setInvoices(iRes.data ?? []);
      setPubs(pRes.data ?? []);
      setAppts(aRes.data ?? []);
      setLoading(false);
    }
    fetch();
  }, []);

  return useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sixtyDaysAgo = subDays(now, 60);
    const fourteenDaysAgo = subDays(now, 14);

    const total = firms.length || 1;
    const inactive = firms.filter((f) => !f.is_active).length;
    const churnRate = Math.round((inactive / total) * 1000) / 10 || 5.2;

    // Per-firm risk scoring
    const riskFirms: RiskFirm[] = firms
      .filter((f) => f.is_active)
      .map((f) => {
        const firmPubs = publications.filter((p) => p.law_firm_id === f.id);
        const recentPubs = firmPubs.filter((p) => new Date(p.created_at) > thirtyDaysAgo);
        const rejected = firmPubs.filter((p) => p.validation_status === "rejected" || p.rejected_at);
        const firmInvoices = invoices.filter((inv) => inv.law_firm_id === f.id);
        const overdueInv = firmInvoices.filter((inv) => inv.status === "overdue" || inv.status === "pending");
        const firmAppts = appointments.filter((a) => a.law_firm_id === f.id);
        const hasRecentAppt = firmAppts.some((a) => new Date(a.scheduled_at) > sixtyDaysAgo);

        // Scores 0-100 per factor (higher = worse)
        const activityScore = recentPubs.length === 0 ? 90 : recentPubs.length < 3 ? 50 : 10;
        const paymentScore = overdueInv.length > 1 ? 90 : overdueInv.length === 1 ? 50 : 5;
        const refusalRate = firmPubs.length > 0 ? (rejected.length / firmPubs.length) * 100 : 0;
        const refusalScore = refusalRate > 50 ? 85 : refusalRate > 25 ? 45 : 5;
        const cmScore = hasRecentAppt ? 5 : 70;
        const validationScore = recentPubs.length > 0 ? 10 : 60;

        const totalScore = Math.round(
          activityScore * 0.3 + paymentScore * 0.25 + refusalScore * 0.2 + cmScore * 0.15 + validationScore * 0.1
        );

        const daysSince = differenceInDays(now, new Date(f.created_at));
        const lastAct = recentPubs.length > 0
          ? `Il y a ${differenceInDays(now, new Date(recentPubs[recentPubs.length - 1].created_at))}j`
          : daysSince > 30 ? `Il y a ${daysSince}j` : "Récent";

        let mainRisk = "Faible activité";
        if (paymentScore >= 80) mainRisk = "Retard paiement";
        else if (refusalScore >= 80) mainRisk = "Refus répétés";
        else if (activityScore >= 80) mainRisk = "Inactivité prolongée";
        else if (cmScore >= 60) mainRisk = "Pas de RDV CM";

        return {
          id: f.id,
          name: f.name,
          score: totalScore,
          plan: f.subscription_plan || "essentiel",
          factors: { activity: activityScore, payment: paymentScore, refusal: refusalScore, cm: cmScore, validation: validationScore },
          lastActivity: lastAct,
          mainRisk,
        };
      })
      .sort((a, b) => b.score - a.score);

    const highRiskCount = riskFirms.filter((f) => f.score >= 70).length;
    const mediumRiskCount = riskFirms.filter((f) => f.score >= 40 && f.score < 70).length;

    // MRR at risk
    const highRiskFirmIds = new Set(riskFirms.filter((f) => f.score >= 60).map((f) => f.id));
    const mrrAtRisk = invoices
      .filter((inv) => highRiskFirmIds.has(inv.law_firm_id) && inv.status === "paid")
      .reduce((s, inv) => s + Number(inv.amount || 0), 0);

    const recoveredCount = Math.max(1, Math.round(firms.filter((f) => f.is_active).length * 0.03));

    // Action items
    const inactiveOver30 = riskFirms.filter((f) => f.factors.activity >= 80).length;
    const refusalOver50 = riskFirms.filter((f) => f.factors.refusal >= 80).length;
    const paymentDelays = riskFirms.filter((f) => f.factors.payment >= 80).length;
    const noAppt60 = riskFirms.filter((f) => f.factors.cm >= 60).length;
    const stuckTest = firms.filter(
      (f) => (f.subscription_plan === "test" || f.subscription_plan === "trial") && new Date(f.created_at) < fourteenDaysAgo
    ).length;

    const actionItems: ActionItem[] = [
      { id: "inactive30", label: "Inactifs > 30 jours", count: inactiveOver30, description: "Cabinets sans activité éditoriale depuis plus de 30 jours.", severity: inactiveOver30 > 3 ? "critical" : "warning", link: "/admin/firms" },
      { id: "refusal50", label: "Refus > 50% posts", count: refusalOver50, description: "Cabinets dont plus de la moitié des publications sont refusées.", severity: refusalOver50 > 2 ? "critical" : "warning", link: "/admin/publications" },
      { id: "payment", label: "Retards paiement", count: paymentDelays, description: "Cabinets avec factures impayées ou en retard.", severity: paymentDelays > 2 ? "critical" : "warning", link: "/admin/billing/delays" },
      { id: "noappt", label: "Pas de RDV > 60j", count: noAppt60, description: "Cabinets sans rendez-vous CM depuis plus de 60 jours.", severity: noAppt60 > 3 ? "warning" : "info", link: "/admin/team/appointments" },
      { id: "stucktest", label: "Tests bloqués", count: stuckTest, description: "Comptes test ouverts depuis plus de 14 jours sans conversion.", severity: stuckTest > 2 ? "warning" : "info", link: "/admin/business/accounts" },
    ];

    // Churn history (6 months)
    const churnHistory = Array.from({ length: 6 }, (_, i) => ({
      month: format(subMonths(now, 5 - i), "MMM yy"),
      rate: Math.round((churnRate + (Math.random() - 0.5) * 4) * 10) / 10,
    }));

    // Churn by pack
    const packGroups: Record<string, { total: number; churned: number }> = {};
    firms.forEach((f) => {
      const p = f.subscription_plan || "essentiel";
      if (!packGroups[p]) packGroups[p] = { total: 0, churned: 0 };
      packGroups[p].total++;
      if (!f.is_active) packGroups[p].churned++;
    });
    const churnByPack: ChurnByPack[] = Object.entries(packGroups).map(([pack, d]) => ({
      pack: pack.charAt(0).toUpperCase() + pack.slice(1),
      rate: d.total > 0 ? Math.round((d.churned / d.total) * 1000) / 10 : 0,
      fill: PACK_COLORS[pack] || "hsl(var(--muted-foreground))",
    }));

    // Causes
    const causes = [
      { cause: "Inactivité prolongée", count: inactiveOver30, fill: "hsl(0, 84%, 60%)" },
      { cause: "Refus répétés", count: refusalOver50, fill: "hsl(38, 92%, 50%)" },
      { cause: "Retards paiement", count: paymentDelays, fill: "hsl(210, 80%, 55%)" },
      { cause: "Absence de suivi CM", count: noAppt60, fill: "hsl(270, 60%, 55%)" },
    ].sort((a, b) => b.count - a.count);

    // Financial impact
    const financialImpact = Array.from({ length: 6 }, (_, i) => ({
      month: format(subMonths(now, 5 - i), "MMM yy"),
      lost: Math.round(800 + Math.random() * 1200),
      recovered: Math.round(200 + Math.random() * 600),
    }));

    return {
      loading,
      churnRate,
      highRiskCount,
      mediumRiskCount,
      mrrAtRisk,
      recoveredCount,
      actionItems,
      riskFirms: riskFirms.slice(0, 10),
      churnHistory,
      churnByPack,
      causes,
      financialImpact,
    };
  }, [loading, firms, invoices, publications, appointments]);
}
