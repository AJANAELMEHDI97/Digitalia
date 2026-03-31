import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type BehaviorBadge = "collaboratif" | "exigeant" | "bloquant" | "inactif";
export type ActivityLevel = "faible" | "normale" | "élevée";
export type PaymentStatus = "à_jour" | "retard" | "bloqué";
export type GlobalStatus = "actif" | "à_surveiller" | "à_risque";
export type ChurnRiskLevel = "low" | "moderate" | "high";

export interface ChurnRiskFactor {
  label: string;
  weight: number; // 1-3
}

export interface ChurnRiskData {
  level: ChurnRiskLevel;
  score: number; // 0-100
  factors: ChurnRiskFactor[];
  suggestedActions: string[];
}

export interface AdminFirmEnriched {
  id: string;
  name: string;
  city: string | null;
  bar_association: string | null;
  subscription_plan: string | null;
  is_active: boolean;
  created_at: string | null;

  // CM
  cm_name: string | null;
  cm_user_id: string | null;
  cm_is_online: boolean;
  cm_last_activity: string | null;
  cm_firms_count: number;

  // Behavior
  behaviorBadge: BehaviorBadge;
  validationRate: number;
  refusalRate: number;
  avgValidationHours: number;

  // Editorial
  totalPublications: number;
  validatedCount: number;
  refusedCount: number;
  pendingCount: number;
  lastPublicationDate: string | null;
  activityLevel: ActivityLevel;

  // Appointments
  lastAppointment: string | null;
  nextAppointment: string | null;

  // Financial
  paymentStatus: PaymentStatus;
  lastInvoiceDate: string | null;
  hasOverdueInvoice: boolean;

  // Signals
  globalStatus: GlobalStatus;
  upsellPotential: boolean;
  churnRisk: boolean;
  churnRiskData: ChurnRiskData;
  alerts: string[];
}

export function useAdminFirms() {
  return useQuery({
    queryKey: ["admin-firms-enriched"],
    queryFn: async (): Promise<AdminFirmEnriched[]> => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

      // Parallel fetches
      const [
        firmsRes, membersRes, assignmentsRes, pubsRes,
        cmLogsRes, appointmentsRes, invoicesRes, profilesRes,
      ] = await Promise.all([
        supabase.from("law_firms").select("id, name, city, bar_association, is_active, subscription_plan, created_at").order("name"),
        supabase.from("law_firm_members").select("law_firm_id, user_id, role"),
        supabase.from("cm_assignments").select("cm_user_id, lawyer_user_id, law_firm_id, is_active").eq("is_active", true),
        supabase.from("publications").select("id, law_firm_id, validation_status, submitted_at, published_at, created_at, updated_at"),
        supabase.from("cm_activity_logs").select("cm_user_id, created_at").order("created_at", { ascending: false }).limit(500),
        supabase.from("admin_cm_appointments").select("law_firm_id, scheduled_at, status").order("scheduled_at", { ascending: false }),
        supabase.from("invoices").select("law_firm_id, status, created_at").order("created_at", { ascending: false }),
        supabase.from("profiles").select("user_id, full_name"),
      ]);

      const firms = firmsRes.data || [];
      const members = membersRes.data || [];
      const assignments = assignmentsRes.data || [];
      const publications = pubsRes.data || [];
      const cmLogs = cmLogsRes.data || [];
      const appointments = appointmentsRes.data || [];
      const invoices = invoicesRes.data || [];
      const profiles = profilesRes.data || [];

      const profileMap = new Map(profiles.map(p => [p.user_id, p.full_name || "Inconnu"]));

      // CM last activity
      const cmLastActivity = new Map<string, string>();
      for (const log of cmLogs) {
        if (!cmLastActivity.has(log.cm_user_id)) {
          cmLastActivity.set(log.cm_user_id, log.created_at);
        }
      }

      // CM assignments count
      const cmFirmsCount = new Map<string, number>();
      assignments.forEach(a => {
        cmFirmsCount.set(a.cm_user_id, (cmFirmsCount.get(a.cm_user_id) || 0) + 1);
      });

      // CM per firm
      const firmCM = new Map<string, string>();
      assignments.forEach(a => {
        if (a.law_firm_id) firmCM.set(a.law_firm_id, a.cm_user_id);
      });

      // Publications per firm
      const firmPubs = new Map<string, typeof publications>();
      publications.forEach(p => {
        if (p.law_firm_id) {
          if (!firmPubs.has(p.law_firm_id)) firmPubs.set(p.law_firm_id, []);
          firmPubs.get(p.law_firm_id)!.push(p);
        }
      });

      // Appointments per firm
      const firmAppts = new Map<string, typeof appointments>();
      appointments.forEach(a => {
        if (a.law_firm_id) {
          if (!firmAppts.has(a.law_firm_id)) firmAppts.set(a.law_firm_id, []);
          firmAppts.get(a.law_firm_id)!.push(a);
        }
      });

      // Invoices per firm
      const firmInvoices = new Map<string, typeof invoices>();
      invoices.forEach(inv => {
        if (inv.law_firm_id) {
          if (!firmInvoices.has(inv.law_firm_id)) firmInvoices.set(inv.law_firm_id, []);
          firmInvoices.get(inv.law_firm_id)!.push(inv);
        }
      });

      const now = new Date();

      return firms.map((firm): AdminFirmEnriched => {
        const cmId = firmCM.get(firm.id) || null;
        const cmName = cmId ? profileMap.get(cmId) || null : null;
        const cmActivity = cmId ? cmLastActivity.get(cmId) || null : null;
        const cmOnline = cmActivity ? new Date(cmActivity) > fiveMinAgo : false;
        const cmCount = cmId ? cmFirmsCount.get(cmId) || 0 : 0;

        const pubs = firmPubs.get(firm.id) || [];
        const validated = pubs.filter(p => p.validation_status === "validated" || p.validation_status === "published");
        const refused = pubs.filter(p => p.validation_status === "refused");
        const pending = pubs.filter(p => ["submitted_to_lawyer", "in_lawyer_review", "cm_review"].includes(p.validation_status || ""));
        const totalDecided = validated.length + refused.length;
        const validationRate = totalDecided > 0 ? Math.round((validated.length / totalDecided) * 100) : 0;
        const refusalRate = totalDecided > 0 ? Math.round((refused.length / totalDecided) * 100) : 0;

        // Avg validation time
        let avgHours = 0;
        const times = validated
          .filter(p => p.submitted_at && p.published_at)
          .map(p => (new Date(p.published_at!).getTime() - new Date(p.submitted_at!).getTime()) / 3600000)
          .filter(h => h > 0 && h < 720);
        if (times.length > 0) avgHours = Math.round(times.reduce((a, b) => a + b, 0) / times.length);

        // Recent pubs (30d)
        const recentPubs = pubs.filter(p => new Date(p.created_at) >= new Date(thirtyDaysAgo));
        const activityLevel: ActivityLevel = recentPubs.length >= 8 ? "élevée" : recentPubs.length >= 3 ? "normale" : "faible";

        const lastPub = pubs.length > 0
          ? pubs.reduce((a, b) => new Date(a.created_at) > new Date(b.created_at) ? a : b).created_at
          : null;

        // Behavior
        let behaviorBadge: BehaviorBadge = "collaboratif";
        if (recentPubs.length === 0 && pubs.length > 0) behaviorBadge = "inactif";
        else if (refusalRate > 50) behaviorBadge = "bloquant";
        else if (refusalRate > 25 || avgHours > 72) behaviorBadge = "exigeant";

        // ── Churn risk scoring ──
        const churnFactors: ChurnRiskFactor[] = [];
        let churnScore = 0;

        // A. Engagement éditorial
        if (recentPubs.length === 0 && pubs.length > 0) {
          churnFactors.push({ label: "Aucune publication depuis 30 jours", weight: 3 });
          churnScore += 25;
        } else if (activityLevel === "faible") {
          churnFactors.push({ label: "Activité éditoriale faible", weight: 2 });
          churnScore += 15;
        }
        if (refusalRate > 50 && totalDecided >= 3) {
          churnFactors.push({ label: `Taux de refus élevé (${refusalRate}%)`, weight: 3 });
          churnScore += 20;
        } else if (refusalRate > 30 && totalDecided >= 3) {
          churnFactors.push({ label: `Taux de refus préoccupant (${refusalRate}%)`, weight: 2 });
          churnScore += 10;
        }

        // B. Relation humaine
        const appts = firmAppts.get(firm.id) || [];
        const pastAppts = appts.filter(a => new Date(a.scheduled_at) < now);
        const futureAppts = appts.filter(a => new Date(a.scheduled_at) >= now && a.status === "upcoming");
        const lastAppointment = pastAppts.length > 0 ? pastAppts[0].scheduled_at : null;
        const nextAppointment = futureAppts.length > 0 ? futureAppts[futureAppts.length - 1].scheduled_at : null;

        if (!lastAppointment && !nextAppointment && pubs.length > 0) {
          churnFactors.push({ label: "Aucun rendez-vous CM passé ou programmé", weight: 2 });
          churnScore += 15;
        } else if (lastAppointment && !nextAppointment) {
          const daysSinceAppt = Math.round((now.getTime() - new Date(lastAppointment).getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceAppt > 45) {
            churnFactors.push({ label: `Dernier RDV il y a ${daysSinceAppt} jours, aucun prochain programmé`, weight: 2 });
            churnScore += 15;
          } else if (daysSinceAppt > 30) {
            churnFactors.push({ label: `Dernier RDV il y a ${daysSinceAppt} jours`, weight: 1 });
            churnScore += 8;
          }
        }

        // C. Comportement décisionnel
        if (avgHours > 96 && times.length >= 2) {
          churnFactors.push({ label: `Délai de validation très long (${Math.round(avgHours)}h en moyenne)`, weight: 2 });
          churnScore += 12;
        } else if (avgHours > 72 && times.length >= 2) {
          churnFactors.push({ label: `Délai de validation élevé (${Math.round(avgHours)}h en moyenne)`, weight: 1 });
          churnScore += 6;
        }

        // D. Signaux business
        const firmInvs = firmInvoices.get(firm.id) || [];
        const hasOverdue = firmInvs.some(i => i.status === "overdue" || i.status === "retard");
        const hasBlocked = firmInvs.some(i => i.status === "blocked" || i.status === "bloqué");
        const paymentStatus: PaymentStatus = hasBlocked ? "bloqué" : hasOverdue ? "retard" : "à_jour";
        const lastInvoiceDate = firmInvs.length > 0 ? firmInvs[0].created_at : null;

        if (hasBlocked) {
          churnFactors.push({ label: "Paiement bloqué", weight: 3 });
          churnScore += 20;
        } else if (hasOverdue) {
          churnFactors.push({ label: "Retard de paiement", weight: 2 });
          churnScore += 10;
        }

        if (!cmId && pubs.length > 0) {
          churnFactors.push({ label: "Aucun CM assigné", weight: 2 });
          churnScore += 10;
        }

        churnScore = Math.min(100, churnScore);
        const churnLevel: ChurnRiskLevel = churnScore >= 50 ? "high" : churnScore >= 25 ? "moderate" : "low";

        const suggestedActions: string[] = [];
        if (churnFactors.some(f => f.label.includes("RDV"))) suggestedActions.push("Planifier un RDV CM ↔ Avocat");
        if (churnFactors.some(f => f.label.includes("refus"))) suggestedActions.push("Adapter la stratégie éditoriale");
        if (churnFactors.some(f => f.label.includes("CM assigné"))) suggestedActions.push("Réaffecter un CM");
        if (churnLevel === "moderate") suggestedActions.push("Surveiller l'évolution sur 15 jours");
        if (churnLevel === "high" && !suggestedActions.includes("Planifier un RDV CM ↔ Avocat")) suggestedActions.push("Planifier un RDV CM ↔ Avocat");
        if (churnFactors.some(f => f.label.includes("Paiement"))) suggestedActions.push("Contacter le responsable administratif");

        const churnRiskData: ChurnRiskData = {
          level: churnLevel, score: churnScore,
          factors: churnFactors.sort((a, b) => b.weight - a.weight),
          suggestedActions,
        };

        // Business signals
        const upsellPotential = activityLevel === "élevée" && (firm.subscription_plan === "essentiel" || !firm.subscription_plan);
        const churnRisk = churnLevel !== "low";

        // Global status & alerts
        const alerts: string[] = [];
        if (behaviorBadge === "bloquant") alerts.push("Comportement bloquant");
        if (behaviorBadge === "inactif") alerts.push("Cabinet inactif");
        if (paymentStatus !== "à_jour") alerts.push("Problème de paiement");
        if (!cmId) alerts.push("Aucun CM assigné");
        if (cmCount >= 5) alerts.push("CM surchargé");
        if (pending.length >= 5) alerts.push("Beaucoup de contenus en attente");

        let globalStatus: GlobalStatus = "actif";
        if (alerts.length >= 2 || behaviorBadge === "bloquant" || paymentStatus === "bloqué") globalStatus = "à_risque";
        else if (alerts.length === 1 || behaviorBadge === "exigeant" || activityLevel === "faible") globalStatus = "à_surveiller";

        return {
          id: firm.id,
          name: firm.name,
          city: firm.city,
          bar_association: firm.bar_association,
          subscription_plan: firm.subscription_plan,
          is_active: firm.is_active ?? true,
          created_at: firm.created_at,
          cm_name: cmName,
          cm_user_id: cmId,
          cm_is_online: cmOnline,
          cm_last_activity: cmActivity,
          cm_firms_count: cmCount,
          behaviorBadge,
          validationRate,
          refusalRate,
          avgValidationHours: avgHours,
          totalPublications: pubs.length,
          validatedCount: validated.length,
          refusedCount: refused.length,
          pendingCount: pending.length,
          lastPublicationDate: lastPub,
          activityLevel,
          lastAppointment,
          nextAppointment,
          paymentStatus,
          lastInvoiceDate,
          hasOverdueInvoice: hasOverdue,
          globalStatus,
          upsellPotential,
          churnRisk,
          churnRiskData,
          alerts,
        };
      });
    },
    staleTime: 30_000,
  });
}
