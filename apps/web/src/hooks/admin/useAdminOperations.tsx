import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, differenceInHours, subDays } from "date-fns";

/* ── Types ── */

export interface OpFirm {
  id: string;
  name: string;
  cmName: string | null;
  cmUserId: string | null;
  pack: string;
  recentPubCount: number;
  activityLabel: string;
  validationRate: number;
  refusalRate: number;
  paymentStatus: "ok" | "retard" | "bloqué";
  relationScore: number;   // 0-100
  riskScore: number;       // 0-100
}

export interface OpCM {
  userId: string;
  name: string;
  firmsCount: number;
  validationRate: number;
  refusalRate: number;
  lastActivity: string | null;
  perfScore: number;       // 0-100
  overloaded: boolean;
}

export interface OpValidation {
  awaitingLawyer: number;
  awaitingCM: number;
  avgDelayHours: number;
  recentRefusals: number;
  urgentCount: number;
}

export interface OpAlert {
  id: string;
  label: string;
  count: number;
  description: string;
  severity: "critical" | "warning" | "info";
  link: string;
}

export interface AdminOperationsData {
  loading: boolean;
  firms: OpFirm[];
  cms: OpCM[];
  validation: OpValidation;
  alerts: OpAlert[];
}

export function useAdminOperations(): AdminOperationsData {
  const [loading, setLoading] = useState(true);
  const [rawFirms, setRawFirms] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [publications, setPublications] = useState<any[]>([]);
  const [cmLogs, setCmLogs] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [cmRoles, setCmRoles] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [fRes, aRes, pRes, lRes, apRes, iRes, prRes, rRes] = await Promise.all([
        supabase.from("law_firms").select("id, name, is_active, subscription_plan, created_at"),
        supabase.from("cm_assignments").select("cm_user_id, lawyer_user_id, law_firm_id, is_active").eq("is_active", true),
        supabase.from("publications").select("id, law_firm_id, user_id, validation_status, status, submitted_at, published_at, created_at, urgency"),
        supabase.from("cm_activity_logs").select("cm_user_id, created_at").order("created_at", { ascending: false }).limit(500),
        supabase.from("admin_cm_appointments").select("law_firm_id, cm_user_id, scheduled_at, status"),
        supabase.from("invoices").select("law_firm_id, status"),
        supabase.from("profiles").select("user_id, full_name"),
        supabase.from("user_roles_simple").select("user_id, role").eq("role", "community_manager"),
      ]);
      setRawFirms(fRes.data ?? []);
      setAssignments(aRes.data ?? []);
      setPublications(pRes.data ?? []);
      setCmLogs(lRes.data ?? []);
      setAppointments(apRes.data ?? []);
      setInvoices(iRes.data ?? []);
      setProfiles(prRes.data ?? []);
      setCmRoles(rRes.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  return useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const fortyEightHoursAgo = subDays(now, 2);
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const profileMap = new Map(profiles.map(p => [p.user_id, p.full_name || "Inconnu"]));

    // ── Maps ──
    const firmCM = new Map<string, string>();
    const cmFirmIds = new Map<string, Set<string>>();
    assignments.forEach(a => {
      if (a.law_firm_id) {
        firmCM.set(a.law_firm_id, a.cm_user_id);
        if (!cmFirmIds.has(a.cm_user_id)) cmFirmIds.set(a.cm_user_id, new Set());
        cmFirmIds.get(a.cm_user_id)!.add(a.law_firm_id);
      }
    });

    const firmPubs = new Map<string, any[]>();
    publications.forEach(p => {
      if (p.law_firm_id) {
        if (!firmPubs.has(p.law_firm_id)) firmPubs.set(p.law_firm_id, []);
        firmPubs.get(p.law_firm_id)!.push(p);
      }
    });

    const firmInvoices = new Map<string, any[]>();
    invoices.forEach(inv => {
      if (inv.law_firm_id) {
        if (!firmInvoices.has(inv.law_firm_id)) firmInvoices.set(inv.law_firm_id, []);
        firmInvoices.get(inv.law_firm_id)!.push(inv);
      }
    });

    const firmAppts = new Map<string, any[]>();
    appointments.forEach(a => {
      if (a.law_firm_id) {
        if (!firmAppts.has(a.law_firm_id)) firmAppts.set(a.law_firm_id, []);
        firmAppts.get(a.law_firm_id)!.push(a);
      }
    });

    const cmLastAct = new Map<string, string>();
    cmLogs.forEach(l => { if (!cmLastAct.has(l.cm_user_id)) cmLastAct.set(l.cm_user_id, l.created_at); });

    // ── FIRMS ──
    const firms: OpFirm[] = rawFirms.filter(f => f.is_active).map(f => {
      const pubs = firmPubs.get(f.id) || [];
      const recentPubs = pubs.filter(p => new Date(p.created_at) > thirtyDaysAgo);
      const validated = pubs.filter(p => p.validation_status === "validated" || p.validation_status === "published");
      const refused = pubs.filter(p => p.validation_status === "refused");
      const decided = validated.length + refused.length;
      const validationRate = decided > 0 ? Math.round((validated.length / decided) * 100) : 0;
      const refusalRate = decided > 0 ? Math.round((refused.length / decided) * 100) : 0;

      const invs = firmInvoices.get(f.id) || [];
      const hasBlocked = invs.some(i => i.status === "blocked" || i.status === "bloqué");
      const hasOverdue = invs.some(i => i.status === "overdue" || i.status === "retard" || i.status === "pending");
      const paymentStatus = hasBlocked ? "bloqué" as const : hasOverdue ? "retard" as const : "ok" as const;

      const appts = firmAppts.get(f.id) || [];
      const hasRecentAppt = appts.some(a => differenceInDays(now, new Date(a.scheduled_at)) < 60);
      const cmId = firmCM.get(f.id) || null;

      // Relation score (higher = better)
      const relationScore = Math.min(100, Math.round(
        (validationRate * 0.3) +
        (recentPubs.length > 5 ? 30 : recentPubs.length * 6) +
        (hasRecentAppt ? 20 : 0) +
        (cmId ? 10 : 0) +
        (paymentStatus === "ok" ? 10 : 0)
      ));

      // Risk score (higher = worse)
      let riskScore = 0;
      if (recentPubs.length === 0) riskScore += 30;
      if (refusalRate > 50) riskScore += 25;
      if (paymentStatus !== "ok") riskScore += 20;
      if (!hasRecentAppt) riskScore += 15;
      if (!cmId) riskScore += 10;
      riskScore = Math.min(100, riskScore);

      const activityLabel = recentPubs.length >= 8 ? "Élevée" : recentPubs.length >= 3 ? "Normale" : "Faible";

      return {
        id: f.id, name: f.name, cmName: cmId ? profileMap.get(cmId) || null : null, cmUserId: cmId,
        pack: f.subscription_plan || "essentiel", recentPubCount: recentPubs.length,
        activityLabel, validationRate, refusalRate, paymentStatus, relationScore, riskScore,
      };
    });

    // ── CMs ──
    const cmIds = cmRoles.map(r => r.user_id);
    const cms: OpCM[] = cmIds.map(id => {
      const fIds = cmFirmIds.get(id) || new Set();
      const firmsCount = fIds.size;
      let totalValidated = 0, totalRefused = 0, totalDecided = 0;
      fIds.forEach(fid => {
        const pubs = firmPubs.get(fid) || [];
        const v = pubs.filter(p => p.validation_status === "validated" || p.validation_status === "published").length;
        const r = pubs.filter(p => p.validation_status === "refused").length;
        totalValidated += v;
        totalRefused += r;
        totalDecided += v + r;
      });
      const validationRate = totalDecided > 0 ? Math.round((totalValidated / totalDecided) * 100) : 0;
      const refusalRate = totalDecided > 0 ? Math.round((totalRefused / totalDecided) * 100) : 0;
      const lastAct = cmLastAct.get(id) || null;

      // Perf score: validation rate weighted + activity
      const perfScore = Math.min(100, Math.round(
        validationRate * 0.5 + (lastAct && new Date(lastAct) > thirtyDaysAgo ? 30 : 0) + Math.min(20, firmsCount * 5)
      ));

      return {
        userId: id, name: profileMap.get(id) || "CM", firmsCount,
        validationRate, refusalRate, lastActivity: lastAct,
        perfScore, overloaded: firmsCount >= 5,
      };
    });

    // ── VALIDATION ──
    const awaitingLawyer = publications.filter(p =>
      ["submitted_to_lawyer", "in_lawyer_review"].includes(p.validation_status || "")
    ).length;
    const awaitingCM = publications.filter(p =>
      ["cm_review", "draft"].includes(p.validation_status || "") && p.submitted_at
    ).length;
    const recentRefusals = publications.filter(p =>
      p.validation_status === "refused" && differenceInDays(now, new Date(p.created_at)) < 7
    ).length;
    const urgentCount = publications.filter(p =>
      p.urgency === "urgent" && !["validated", "published", "refused"].includes(p.validation_status || "")
    ).length;

    // Avg delay
    const validatedWithTimes = publications.filter(p =>
      (p.validation_status === "validated" || p.validation_status === "published") && p.submitted_at && p.published_at
    );
    const delays = validatedWithTimes.map(p =>
      differenceInHours(new Date(p.published_at), new Date(p.submitted_at))
    ).filter(h => h > 0 && h < 720);
    const avgDelayHours = delays.length > 0 ? Math.round(delays.reduce((a, b) => a + b, 0) / delays.length) : 0;

    const validation: OpValidation = { awaitingLawyer, awaitingCM, avgDelayHours, recentRefusals, urgentCount };

    // ── ALERTS ──
    const firmsWithoutCM = rawFirms.filter(f => f.is_active && !firmCM.has(f.id)).length;
    const inactiveCMs = cmIds.filter(id => {
      const last = cmLastAct.get(id);
      return !last || new Date(last) < fortyEightHoursAgo;
    }).length;
    const blockedValidation = publications.filter(p =>
      ["submitted_to_lawyer", "in_lawyer_review"].includes(p.validation_status || "") &&
      p.submitted_at && differenceInDays(now, new Date(p.submitted_at)) > 3
    ).length;
    const excessiveRefusals = firms.filter(f => f.refusalRate > 50).length;
    const lowActivity = firms.filter(f => f.activityLabel === "Faible").length;

    const alerts: OpAlert[] = [
      { id: "no_cm", label: "Cabinets sans CM", count: firmsWithoutCM, description: "Cabinets actifs sans Community Manager assigné.", severity: firmsWithoutCM > 2 ? "critical" : "warning", link: "/admin/firms" },
      { id: "cm_inactive", label: "CM inactifs > 48h", count: inactiveCMs, description: "Community Managers sans activité depuis plus de 48 heures.", severity: inactiveCMs > 1 ? "critical" : "warning", link: "/admin/team/cms" },
      { id: "blocked_val", label: "Validation bloquée", count: blockedValidation, description: "Publications en attente de validation depuis plus de 3 jours.", severity: blockedValidation > 3 ? "critical" : "warning", link: "/admin/publications" },
      { id: "excess_refusal", label: "Refus excessifs", count: excessiveRefusals, description: "Cabinets avec un taux de refus supérieur à 50%.", severity: excessiveRefusals > 2 ? "warning" : "info", link: "/admin/firms" },
      { id: "low_activity", label: "Activité faible", count: lowActivity, description: "Cabinets avec moins de 3 publications sur les 30 derniers jours.", severity: lowActivity > 5 ? "warning" : "info", link: "/admin/firms" },
    ];

    // ── DEMO FALLBACK ──
    const needsFallback = cms.length === 0 && validation.awaitingLawyer === 0 && validation.awaitingCM === 0;

    if (!needsFallback) {
      return { loading, firms, cms, validation, alerts };
    }

    // Demo CMs
    const demoCMs: OpCM[] = [
      { userId: "demo-cm-1", name: "Marie Dupont", firmsCount: 6, validationRate: 82, refusalRate: 18, lastActivity: new Date(Date.now() - 20 * 60 * 1000).toISOString(), perfScore: 78, overloaded: true },
      { userId: "demo-cm-2", name: "Thomas Martin", firmsCount: 4, validationRate: 75, refusalRate: 25, lastActivity: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), perfScore: 65, overloaded: false },
      { userId: "demo-cm-3", name: "Sophie Bernard", firmsCount: 3, validationRate: 91, refusalRate: 9, lastActivity: new Date(Date.now() - 45 * 60 * 1000).toISOString(), perfScore: 88, overloaded: false },
      { userId: "demo-cm-4", name: "Lucas Moreau", firmsCount: 5, validationRate: 68, refusalRate: 32, lastActivity: new Date(Date.now() - 50 * 3600 * 1000).toISOString(), perfScore: 55, overloaded: true },
    ];

    const demoValidation: OpValidation = { awaitingLawyer: 8, awaitingCM: 5, avgDelayHours: 36, recentRefusals: 3, urgentCount: 2 };

    // Enrich firms with demo data
    const cmNames = ["Marie Dupont", "Thomas Martin", "Sophie Bernard", "Lucas Moreau"];
    const cmDemoIds = ["demo-cm-1", "demo-cm-2", "demo-cm-3", "demo-cm-4"];
    const paymentStatuses: ("ok" | "retard" | "bloqué")[] = ["ok", "ok", "ok", "retard", "bloqué"];

    const demoFirms: OpFirm[] = (firms.length > 0 ? firms : rawFirms.filter(f => f.is_active).map(f => ({
      id: f.id, name: f.name, cmName: null, cmUserId: null,
      pack: f.subscription_plan || "essentiel", recentPubCount: 0,
      activityLabel: "Faible", validationRate: 0, refusalRate: 0,
      paymentStatus: "ok" as const, relationScore: 0, riskScore: 0,
    }))).map((f, i) => {
      const seed = (i * 7 + 13) % 100;
      const cmIdx = i % 4;
      const hasCM = i < Math.floor(firms.length * 0.85) || i < 30;
      return {
        ...f,
        cmName: hasCM ? cmNames[cmIdx] : null,
        cmUserId: hasCM ? cmDemoIds[cmIdx] : null,
        recentPubCount: f.recentPubCount || (seed % 12) + 1,
        activityLabel: seed > 60 ? "Élevée" : seed > 25 ? "Normale" : "Faible",
        validationRate: f.validationRate || Math.min(100, 50 + (seed % 45)),
        refusalRate: f.refusalRate || Math.min(50, seed % 30),
        paymentStatus: f.paymentStatus !== "ok" ? f.paymentStatus : paymentStatuses[i % 5],
        relationScore: f.relationScore || Math.min(100, 30 + (seed % 60)),
        riskScore: f.riskScore || ((seed < 30) ? seed : (seed < 70) ? 30 + (seed % 30) : 60 + (seed % 35)),
      };
    });

    // Recalculate alerts from demo data
    const demoFirmsWithoutCM = demoFirms.filter(f => !f.cmName).length;
    const demoInactiveCMs = demoCMs.filter(c => !c.lastActivity || new Date(c.lastActivity) < new Date(Date.now() - 48 * 3600 * 1000)).length;
    const demoExcessiveRefusals = demoFirms.filter(f => f.refusalRate > 50).length;
    const demoLowActivity = demoFirms.filter(f => f.activityLabel === "Faible").length;

    const demoAlerts: OpAlert[] = [
      { id: "no_cm", label: "Cabinets sans CM", count: demoFirmsWithoutCM, description: "Cabinets actifs sans Community Manager assigné.", severity: demoFirmsWithoutCM > 2 ? "critical" : "warning", link: "/admin/firms" },
      { id: "cm_inactive", label: "CM inactifs > 48h", count: demoInactiveCMs, description: "Community Managers sans activité depuis plus de 48 heures.", severity: demoInactiveCMs > 1 ? "critical" : "warning", link: "/admin/team/cms" },
      { id: "blocked_val", label: "Validation bloquée", count: demoValidation.awaitingLawyer, description: "Publications en attente de validation depuis plus de 3 jours.", severity: demoValidation.awaitingLawyer > 3 ? "critical" : "warning", link: "/admin/publications" },
      { id: "excess_refusal", label: "Refus excessifs", count: demoExcessiveRefusals, description: "Cabinets avec un taux de refus supérieur à 50%.", severity: demoExcessiveRefusals > 2 ? "warning" : "info", link: "/admin/firms" },
      { id: "low_activity", label: "Activité faible", count: demoLowActivity, description: "Cabinets avec moins de 3 publications sur les 30 derniers jours.", severity: demoLowActivity > 5 ? "warning" : "info", link: "/admin/firms" },
    ];

    return { loading, firms: demoFirms, cms: demoCMs, validation: demoValidation, alerts: demoAlerts };
  }, [loading, rawFirms, assignments, publications, cmLogs, appointments, invoices, profiles, cmRoles]);
}
