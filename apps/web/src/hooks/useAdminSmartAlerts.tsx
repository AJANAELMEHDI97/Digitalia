import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AlertSeverity = "critical" | "moderate" | "info";
export type AlertCategory = "behavioral" | "cm" | "relational" | "business" | "compliance";

export interface SmartAlert {
  id: string;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  reason: string;
  risk: string;
  action: string;
  entityName?: string;
  entityType: "firm" | "cm" | "system";
  triggeredAt: string;
}

export function useAdminSmartAlerts() {
  return useQuery({
    queryKey: ["admin-smart-alerts"],
    queryFn: async (): Promise<SmartAlert[]> => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
      const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const [
        firmsRes, pubsRes, assignmentsRes, cmRolesRes,
        cmLogsRes, appointmentsRes, invoicesRes, profilesRes,
      ] = await Promise.all([
        supabase.from("law_firms").select("id, name, is_active, subscription_plan, created_at").eq("is_active", true),
        supabase.from("publications").select("id, law_firm_id, validation_status, submitted_at, published_at, created_at, updated_at, rejected_at"),
        supabase.from("cm_assignments").select("cm_user_id, lawyer_user_id, law_firm_id, is_active").eq("is_active", true),
        supabase.from("user_roles_simple").select("user_id").eq("role", "community_manager"),
        supabase.from("cm_activity_logs").select("cm_user_id, created_at").order("created_at", { ascending: false }).limit(500),
        supabase.from("admin_cm_appointments").select("law_firm_id, cm_user_id, scheduled_at, status").order("scheduled_at", { ascending: false }),
        supabase.from("invoices").select("law_firm_id, status, created_at").order("created_at", { ascending: false }),
        supabase.from("profiles").select("user_id, full_name"),
      ]);

      const firms = firmsRes.data || [];
      const pubs = pubsRes.data || [];
      const assignments = assignmentsRes.data || [];
      const cmIds = (cmRolesRes.data || []).map(r => r.user_id);
      const cmLogs = cmLogsRes.data || [];
      const appointments = appointmentsRes.data || [];
      const invoices = invoicesRes.data || [];
      const profiles = profilesRes.data || [];

      const profileMap = new Map(profiles.map(p => [p.user_id, p.full_name || "Inconnu"]));
      const firmMap = new Map(firms.map(f => [f.id, f.name]));

      const alerts: SmartAlert[] = [];
      let alertIdx = 0;
      const makeId = () => `sa-${++alertIdx}`;

      // ── Per-firm analysis ──
      const firmCM = new Map<string, string>();
      assignments.forEach(a => { if (a.law_firm_id) firmCM.set(a.law_firm_id, a.cm_user_id); });

      const cmFirmCount = new Map<string, number>();
      assignments.forEach(a => { cmFirmCount.set(a.cm_user_id, (cmFirmCount.get(a.cm_user_id) || 0) + 1); });

      for (const firm of firms) {
        const firmPubs = pubs.filter(p => p.law_firm_id === firm.id);
        const validated = firmPubs.filter(p => p.validation_status === "validated" || p.validation_status === "published");
        const refused = firmPubs.filter(p => p.validation_status === "refused");
        const pending = firmPubs.filter(p => ["submitted_to_lawyer", "in_lawyer_review", "cm_review"].includes(p.validation_status || ""));
        const totalDecided = validated.length + refused.length;
        const refusalRate = totalDecided > 0 ? (refused.length / totalDecided) * 100 : 0;

        const recentPubs = firmPubs.filter(p => new Date(p.created_at) >= new Date(thirtyDaysAgo));
        const recentRefused = refused.filter(p => p.rejected_at && new Date(p.rejected_at) >= new Date(thirtyDaysAgo));

        // A. Behavioral alerts
        if (refusalRate > 50 && totalDecided >= 3) {
          alerts.push({
            id: makeId(), severity: "critical", category: "behavioral",
            title: "Cabinet bloquant détecté",
            reason: `Taux de refus de ${Math.round(refusalRate)}% sur ${totalDecided} décisions.`,
            risk: "Risque de rupture de la relation CM ↔ Avocat et blocage éditorial.",
            action: "Contacter le CM pour comprendre la nature des refus. Envisager un rendez-vous de recadrage.",
            entityName: firm.name, entityType: "firm", triggeredAt: now.toISOString(),
          });
        } else if (refusalRate > 30 && totalDecided >= 3) {
          alerts.push({
            id: makeId(), severity: "moderate", category: "behavioral",
            title: "Taux de refus élevé",
            reason: `${Math.round(refusalRate)}% des contenus refusés pour "${firm.name}".`,
            risk: "Risque de désengagement progressif du cabinet.",
            action: "Surveiller l'évolution et planifier un point avec le CM assigné.",
            entityName: firm.name, entityType: "firm", triggeredAt: now.toISOString(),
          });
        }

        // Validation delays
        const valTimes = validated
          .filter(p => p.submitted_at && p.published_at)
          .map(p => (new Date(p.published_at!).getTime() - new Date(p.submitted_at!).getTime()) / 3600000)
          .filter(h => h > 0 && h < 720);
        const avgHours = valTimes.length > 0 ? valTimes.reduce((a, b) => a + b, 0) / valTimes.length : 0;

        if (avgHours > 72 && valTimes.length >= 2) {
          alerts.push({
            id: makeId(), severity: "moderate", category: "behavioral",
            title: "Validation systématiquement tardive",
            reason: `Délai moyen de validation de ${Math.round(avgHours)}h pour "${firm.name}".`,
            risk: "Les publications perdent leur pertinence temporelle.",
            action: "Rappeler l'importance de la réactivité via le CM ou un contact direct.",
            entityName: firm.name, entityType: "firm", triggeredAt: now.toISOString(),
          });
        }

        // Inactivity
        if (recentPubs.length === 0 && firmPubs.length > 0) {
          alerts.push({
            id: makeId(), severity: "moderate", category: "behavioral",
            title: "Risque de désengagement",
            reason: `Aucune publication depuis 30 jours pour "${firm.name}".`,
            risk: "Perte de valeur perçue, risque de churn.",
            action: "Demander au CM de relancer le cabinet et proposer un rendez-vous.",
            entityName: firm.name, entityType: "firm", triggeredAt: now.toISOString(),
          });
        }

        // Blocked publications (>48h pending)
        const blockedPubs = pending.filter(p => p.submitted_at && new Date(p.submitted_at) < new Date(fortyEightHoursAgo));
        if (blockedPubs.length >= 2) {
          alerts.push({
            id: makeId(), severity: "critical", category: "behavioral",
            title: "Publications bloquées",
            reason: `${blockedPubs.length} publications en attente > 48h pour "${firm.name}".`,
            risk: "Contenu obsolète, frustration du CM, désorganisation éditoriale.",
            action: "Contacter l'avocat ou vérifier la disponibilité du validateur.",
            entityName: firm.name, entityType: "firm", triggeredAt: now.toISOString(),
          });
        }

        // C. Relational alerts - no appointments
        const firmAppts = appointments.filter(a => a.law_firm_id === firm.id);
        const lastAppt = firmAppts.find(a => new Date(a.scheduled_at) < now);
        const nextAppt = firmAppts.find(a => new Date(a.scheduled_at) >= now && a.status === "upcoming");

        if (!nextAppt) {
          const daysSinceLastAppt = lastAppt
            ? Math.round((now.getTime() - new Date(lastAppt.scheduled_at).getTime()) / (1000 * 60 * 60 * 24))
            : null;

          if (daysSinceLastAppt && daysSinceLastAppt > 30) {
            alerts.push({
              id: makeId(), severity: "moderate", category: "relational",
              title: "Cabinet sans suivi humain",
              reason: `Dernier RDV il y a ${daysSinceLastAppt} jours pour "${firm.name}".`,
              risk: "Perte de la relation de confiance et désengagement.",
              action: "Demander au CM de planifier un rendez-vous dans les 7 prochains jours.",
              entityName: firm.name, entityType: "firm", triggeredAt: now.toISOString(),
            });
          } else if (!lastAppt && firmPubs.length > 0) {
            alerts.push({
              id: makeId(), severity: "info", category: "relational",
              title: "Aucun RDV programmé",
              reason: `Aucun rendez-vous passé ou futur pour "${firm.name}".`,
              risk: "Le cabinet peut se sentir délaissé.",
              action: "Vérifier que le CM est bien assigné et initier un premier contact.",
              entityName: firm.name, entityType: "firm", triggeredAt: now.toISOString(),
            });
          }
        }

        // D. Business alerts
        const firmInvs = invoices.filter(i => i.law_firm_id === firm.id);
        const hasOverdue = firmInvs.some(i => i.status === "overdue" || i.status === "retard");
        const hasBlocked = firmInvs.some(i => i.status === "blocked" || i.status === "bloqué");

        if (hasBlocked) {
          alerts.push({
            id: makeId(), severity: "critical", category: "business",
            title: "Paiement bloqué",
            reason: `Impayé détecté pour "${firm.name}".`,
            risk: "Service potentiellement suspendu, risque juridique.",
            action: "Contacter le responsable administratif du cabinet. Envisager suspension.",
            entityName: firm.name, entityType: "firm", triggeredAt: now.toISOString(),
          });
        } else if (hasOverdue) {
          alerts.push({
            id: makeId(), severity: "moderate", category: "business",
            title: "Retard de paiement",
            reason: `Facture en retard pour "${firm.name}".`,
            risk: "Dégradation de la relation financière.",
            action: "Envoyer un rappel ou contacter le cabinet.",
            entityName: firm.name, entityType: "firm", triggeredAt: now.toISOString(),
          });
        }

        // Churn risk
        const isInactive = recentPubs.length === 0 && firmPubs.length > 0;
        if (isInactive && refusalRate > 30) {
          alerts.push({
            id: makeId(), severity: "critical", category: "business",
            title: "Risque churn détecté",
            reason: `"${firm.name}" cumule inactivité et refus fréquents.`,
            risk: "Forte probabilité de non-renouvellement.",
            action: "Organiser un point stratégique avec le CM et le responsable commercial.",
            entityName: firm.name, entityType: "firm", triggeredAt: now.toISOString(),
          });
        }

        // Upsell potential
        if (recentPubs.length >= 8 && (firm.subscription_plan === "essentiel" || !firm.subscription_plan)) {
          alerts.push({
            id: makeId(), severity: "info", category: "business",
            title: "Potentiel upsell identifié",
            reason: `"${firm.name}" est très actif (${recentPubs.length} publications/30j) avec un pack basique.`,
            risk: "Opportunité manquée de montée en gamme.",
            action: "Proposer un upgrade de pack via le CM ou un appel commercial.",
            entityName: firm.name, entityType: "firm", triggeredAt: now.toISOString(),
          });
        }

        // E. Compliance alerts
        const recentRefusalCount = recentRefused.length;
        if (recentRefusalCount >= 3) {
          alerts.push({
            id: makeId(), severity: "moderate", category: "compliance",
            title: "Risque déontologique – accompagnement recommandé",
            reason: `${recentRefusalCount} refus récents pour "${firm.name}" en 30 jours.`,
            risk: "Risque de non-conformité récurrente dans les prises de parole.",
            action: "Analyser les motifs de refus. Proposer un accompagnement éditorial renforcé.",
            entityName: firm.name, entityType: "firm", triggeredAt: now.toISOString(),
          });
        }

        // No CM assigned
        if (!firmCM.has(firm.id)) {
          alerts.push({
            id: makeId(), severity: "critical", category: "cm",
            title: "Aucun CM assigné",
            reason: `"${firm.name}" n'a aucun Community Manager assigné.`,
            risk: "Aucun contenu produit, aucun suivi humain.",
            action: "Assigner un CM disponible immédiatement.",
            entityName: firm.name, entityType: "firm", triggeredAt: now.toISOString(),
          });
        }
      }

      // ── B. CM-level alerts ──
      const cmLastActivity = new Map<string, string>();
      for (const log of cmLogs) {
        if (!cmLastActivity.has(log.cm_user_id)) {
          cmLastActivity.set(log.cm_user_id, log.created_at);
        }
      }

      for (const cmId of cmIds) {
        const cmName = profileMap.get(cmId) || "CM inconnu";
        const firmsManaged = cmFirmCount.get(cmId) || 0;

        // Overloaded CM
        if (firmsManaged >= 5) {
          alerts.push({
            id: makeId(), severity: "moderate", category: "cm",
            title: "Surcharge CM détectée",
            reason: `${cmName} gère ${firmsManaged} cabinets simultanément.`,
            risk: "Baisse de qualité de service et retards éditoriaux.",
            action: "Envisager une redistribution des cabinets ou un recrutement.",
            entityName: cmName, entityType: "cm", triggeredAt: now.toISOString(),
          });
        }

        if (firmsManaged >= 7) {
          // Upgrade to critical
          alerts[alerts.length - 1].severity = "critical";
        }

        // Inactive CM
        const lastActivity = cmLastActivity.get(cmId);
        if (lastActivity) {
          const hoursSince = (now.getTime() - new Date(lastActivity).getTime()) / 3600000;
          if (hoursSince > 48) {
            alerts.push({
              id: makeId(), severity: "critical", category: "cm",
              title: "CM inactif – supervision requise",
              reason: `${cmName} est inactif depuis ${Math.round(hoursSince)}h.`,
              risk: "Cabinets sans production ni suivi pendant cette période.",
              action: "Vérifier la disponibilité du CM. Prévoir un backup si nécessaire.",
              entityName: cmName, entityType: "cm", triggeredAt: now.toISOString(),
            });
          } else if (hoursSince > 24) {
            alerts.push({
              id: makeId(), severity: "moderate", category: "cm",
              title: "CM inactif depuis 24h+",
              reason: `Dernière activité de ${cmName} il y a ${Math.round(hoursSince)}h.`,
              risk: "Ralentissement potentiel du pipeline éditorial.",
              action: "Surveiller et préparer un plan de continuité.",
              entityName: cmName, entityType: "cm", triggeredAt: now.toISOString(),
            });
          }
        } else if (firmsManaged > 0) {
          alerts.push({
            id: makeId(), severity: "critical", category: "cm",
            title: "CM sans activité tracée",
            reason: `Aucune activité enregistrée pour ${cmName} malgré ${firmsManaged} cabinet(s) assigné(s).`,
            risk: "Cabinets potentiellement non suivis.",
            action: "Contacter le CM immédiatement.",
            entityName: cmName, entityType: "cm", triggeredAt: now.toISOString(),
          });
        }

        // Too many at-risk firms under one CM
        const cmFirmIds = assignments.filter(a => a.cm_user_id === cmId && a.law_firm_id).map(a => a.law_firm_id!);
        let atRiskUnderCM = 0;
        for (const fId of cmFirmIds) {
          const fPubs = pubs.filter(p => p.law_firm_id === fId);
          const fRefused = fPubs.filter(p => p.validation_status === "refused").length;
          const fVal = fPubs.filter(p => p.validation_status === "validated" || p.validation_status === "published").length;
          const fTotal = fRefused + fVal;
          if (fTotal >= 3 && (fRefused / fTotal) > 0.4) atRiskUnderCM++;
        }
        if (atRiskUnderCM >= 2) {
          alerts.push({
            id: makeId(), severity: "critical", category: "cm",
            title: "CM avec cabinets à risque multiples",
            reason: `${cmName} gère ${atRiskUnderCM} cabinets à risque élevé.`,
            risk: "Concentration de problèmes sur un même CM.",
            action: "Redistribuer certains cabinets ou renforcer l'accompagnement.",
            entityName: cmName, entityType: "cm", triggeredAt: now.toISOString(),
          });
        }
      }

      // Sort: critical first, then moderate, then info
      const severityOrder: Record<AlertSeverity, number> = { critical: 0, moderate: 1, info: 2 };
      alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      return alerts;
    },
    staleTime: 60_000,
  });
}
