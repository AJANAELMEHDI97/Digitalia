import { useEffect, useRef, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { Publication } from "@/hooks/usePublications";
import { parseISO, isBefore, differenceInHours, format } from "date-fns";
import { fr } from "date-fns/locale";

interface LatePublicationAlertsProps {
  publications: Publication[];
}

export function LatePublicationAlerts({ publications }: LatePublicationAlertsProps) {
  const notifiedIds = useRef<Set<string>>(new Set());

  const getScheduledDateTime = useCallback((pub: Publication) => {
    const [hours, minutes] = (pub.scheduled_time || "09:00").split(":").map(Number);
    const scheduledDateTime = parseISO(pub.scheduled_date);
    scheduledDateTime.setHours(hours, minutes, 0, 0);
    return scheduledDateTime;
  }, []);

  useEffect(() => {
    const now = new Date();

    // Trouver les publications programmées mais en retard
    const latePublications = publications.filter((pub) => {
      if (pub.status !== "programme") return false;
      const scheduledDateTime = getScheduledDateTime(pub);
      return isBefore(scheduledDateTime, now);
    });

    const platformLabels: Record<string, string> = {
      linkedin: "LinkedIn",
      instagram: "Instagram",
      facebook: "Facebook",
      twitter: "X (Twitter)",
      blog: "Blog",
      google_business: "Google"
    };

    

    // Alerter pour chaque publication en retard (une seule fois)
    latePublications.forEach((pub) => {
      const scheduledDateTime = getScheduledDateTime(pub);
      const hoursLate = differenceInHours(now, scheduledDateTime);
      const isCritical = hoursLate >= 24;

      // Notification standard (toutes les publications en retard)
      if (!notifiedIds.current.has(pub.id)) {
        notifiedIds.current.add(pub.id);

        toast({
          variant: "destructive",
          title: isCritical ? "⚠️ Retard critique" : "Publication en retard",
          description: isCritical 
            ? `Une publication ${platformLabels[pub.platform || "linkedin"] || pub.platform} est en retard de plus de 24h !`
            : `Une publication ${platformLabels[pub.platform || "linkedin"] || pub.platform} prévue le ${format(scheduledDateTime, "d MMMM", { locale: fr })} n'a pas été diffusée.`,
          duration: isCritical ? 20000 : 15000,
        });
      }

    });
  }, [publications, getScheduledDateTime]);

  // Nettoyer les IDs quand les publications sont résolues ou supprimées
  useEffect(() => {
    const currentIds = new Set(publications.map((p) => p.id));
    notifiedIds.current.forEach((id) => {
      if (!currentIds.has(id)) {
        notifiedIds.current.delete(id);
      }
    });
  }, [publications]);

  return null;
}
