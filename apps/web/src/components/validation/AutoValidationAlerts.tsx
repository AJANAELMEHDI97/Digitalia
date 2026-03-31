import { useEffect, useRef } from "react";
import { ShieldAlert, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Publication } from "@/hooks/usePublications";
import { useAutoValidation, AutoValidationInfo } from "@/hooks/useAutoValidation";

interface AutoValidationAlertsProps {
  publications: Publication[];
}

export function AutoValidationAlerts({ publications }: AutoValidationAlertsProps) {
  const { delay, getAutoValidationInfo } = useAutoValidation();
  const notifiedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!delay) return;

    // Filter publications that need validation and are from SocialPulse
    const pendingPublications = publications.filter(
      (p) => p.status === "a_valider" && p.source === "socialpulse"
    );

    pendingPublications.forEach((pub) => {
      const info = getAutoValidationInfo(
        pub.created_at,
        pub.scheduled_date,
        pub.scheduled_time
      );

      if (!info) return;

      // Check if this publication is blocked and we haven't notified yet
      if (info.isBlocked && !notifiedIds.current.has(pub.id)) {
        notifiedIds.current.add(pub.id);
        
        toast({
          title: "Intervention manuelle requise",
          description: `Une publication approche de son heure de diffusion. La validation automatique est désactivée.`,
          duration: 10000,
        });
      }

      // Also notify when approaching the threshold (< 4 hours and not yet blocked)
      if (!info.isBlocked && info.hours < 4 && info.hours >= 2) {
        const warningKey = `${pub.id}-warning`;
        if (!notifiedIds.current.has(warningKey)) {
          notifiedIds.current.add(warningKey);
          
          toast({
            title: "Validation automatique imminente",
            description: `Une publication sera validée automatiquement dans ${info.hours}h${info.minutes > 0 ? ` ${info.minutes}min` : ""}. Pensez à la vérifier.`,
            duration: 8000,
          });
        }
      }
    });
  }, [publications, delay, getAutoValidationInfo]);

  // Clean up notified IDs when publications are removed
  useEffect(() => {
    const currentIds = new Set(publications.map((p) => p.id));
    notifiedIds.current.forEach((id) => {
      // Remove IDs that no longer exist (base ID or warning ID)
      const baseId = id.replace("-warning", "");
      if (!currentIds.has(baseId)) {
        notifiedIds.current.delete(id);
      }
    });
  }, [publications]);

  // This component doesn't render anything visible
  return null;
}
