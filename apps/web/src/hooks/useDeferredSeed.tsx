import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { format, addDays } from "date-fns";

// Minimal seed data for demo - moved to a separate hook to defer execution
const SEED_PUBLICATIONS = [
  {
    content: "📚 Le saviez-vous ? En droit français, le délai de prescription de droit commun est de 5 ans.",
    image_url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
    days_offset: 1,
    platform: "linkedin" as const,
    source: "socialpulse" as const,
    status: "a_valider" as const,
  },
  {
    content: "⚖️ Accès au droit : consultations juridiques gratuites dans les Maisons de la Justice.",
    image_url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    days_offset: 2,
    platform: "linkedin" as const,
    source: "socialpulse" as const,
    status: "a_valider" as const,
  },
  {
    content: "📝 Contrats : consentement, capacité, contenu licite. Les fondamentaux à retenir.",
    image_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80",
    days_offset: 5,
    platform: "linkedin" as const,
    source: "manual" as const,
    status: "programme" as const,
  },
];

interface UseDeferredSeedOptions {
  delayMs?: number;
  enabled?: boolean;
}

/**
 * Deferred content seeding hook
 * Only runs after initial render + delay to avoid blocking the dashboard
 */
export function useDeferredSeed(options: UseDeferredSeedOptions = {}) {
  const { delayMs = 3000, enabled = true } = options;
  const { user } = useAuth();
  const hasChecked = useRef(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [hasSeeded, setHasSeeded] = useState(false);

  useEffect(() => {
    if (!user || !enabled || hasChecked.current) return;

    const timeoutId = setTimeout(async () => {
      if (hasChecked.current) return;
      hasChecked.current = true;

      try {
        // Quick check for existing content
        const { data: existing, error } = await supabase
          .from("publications")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);

        if (error) {
          console.error("Error checking existing content:", error);
          return;
        }

        // User already has content
        if (existing && existing.length > 0) {
          setHasSeeded(true);
          return;
        }

        // Seed minimal demo content
        setIsSeeding(true);
        const today = new Date();

        const publications = SEED_PUBLICATIONS.map((pub) => ({
          user_id: user.id,
          content: pub.content,
          image_url: pub.image_url,
          scheduled_date: format(addDays(today, pub.days_offset), "yyyy-MM-dd"),
          scheduled_time: "09:00",
          platform: pub.platform,
          status: pub.status,
          source: pub.source,
        }));

        const { error: insertError } = await supabase
          .from("publications")
          .insert(publications);

        if (insertError) {
          console.error("Error seeding demo content:", insertError);
        } else {
          console.log("Demo content seeded:", publications.length, "publications");
          setHasSeeded(true);
        }
      } catch (err) {
        console.error("Deferred seed error:", err);
      } finally {
        setIsSeeding(false);
      }
    }, delayMs);

    return () => clearTimeout(timeoutId);
  }, [user, delayMs, enabled]);

  return { isSeeding, hasSeeded };
}
