import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLawFirmContextSafe } from "@/contexts/LawFirmContext";
import { useUserRole } from "@/hooks/useUserRole";

export interface GeneratedPublication {
  date: string;
  time: string;
  platform: string;
  thematic: string;
  objective: string;
  title: string;
  content: string;
  format_suggestion: string;
  content_type: string;
  hashtags: string[];
  selected?: boolean;
  firmId?: string;
  firmName?: string;
  visual_url?: string;
}

export type SchedulingMode = 'manual' | 'auto';

export interface CampaignConfig {
  startDate: Date;
  endDate: Date;
  thematics: string[];
  platforms: string[];
  tone: string;
  frequency: string;
  selectedFirmIds?: string[];
  contentTypes?: string[];
  publishDays?: string[];
  publishTimes?: string[];
  schedulingMode?: SchedulingMode;
}

export const LEGAL_THEMATICS = [
  "Droit du travail",
  "Droit de la famille",
  "Droit des affaires",
  "Droit pénal",
  "Droit immobilier",
  "Droit fiscal",
  "Droit de la propriété intellectuelle",
  "Droit de la consommation",
  "Droit de l'environnement",
  "Droit de la santé",
  "Droit des étrangers",
  "Droit social",
  "Droit des contrats",
  "Droit de la construction",
];

export const SOCIAL_PLATFORMS = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "google_business", label: "Google Business" },
  { id: "twitter", label: "Twitter/X" },
];

export const EDITORIAL_TONES = [
  { id: "professional", label: "Professionnel" },
  { id: "pedagogique", label: "Pédagogique" },
  { id: "expert", label: "Expert" },
  { id: "accessible", label: "Accessible" },
  { id: "institutionnel", label: "Institutionnel" },
];

export const FREQUENCIES = [
  { id: "1_per_week", label: "1 publication / semaine" },
  { id: "2_per_week", label: "2 publications / semaine" },
  { id: "3_per_week", label: "3 publications / semaine" },
  { id: "daily", label: "5 publications / semaine" },
];

export const CONTENT_TYPES = [
  { id: "pedagogique", label: "Post pédagogique" },
  { id: "actualite", label: "Actualité juridique" },
  { id: "jurisprudence", label: "Décryptage de jurisprudence" },
  { id: "conseil", label: "Conseil pratique" },
  { id: "question", label: "Question fréquente" },
  { id: "cas_concret", label: "Cas concret" },
  { id: "erreur", label: "Erreur juridique à éviter" },
];

export const PUBLISH_DAYS = [
  { id: "lundi", label: "Lundi" },
  { id: "mardi", label: "Mardi" },
  { id: "mercredi", label: "Mercredi" },
  { id: "jeudi", label: "Jeudi" },
  { id: "vendredi", label: "Vendredi" },
];

export const DEFAULT_PUBLISH_DAYS = ["lundi", "mercredi", "vendredi"];

export const PUBLISH_TIMES = [
  { id: "09:00", label: "09:00" },
  { id: "12:30", label: "12:30" },
  { id: "18:00", label: "18:00" },
];

export const DEFAULT_PUBLISH_TIMES = ["09:00", "12:30", "18:00"];

export function useEditorialCampaign() {
  const { toast } = useToast();
  const { selectedFirmId, assignedFirms } = useLawFirmContextSafe();
  const { isCommunityManager } = useUserRole();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInserting, setIsInserting] = useState(false);
  const [publications, setPublications] = useState<GeneratedPublication[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string | null>(null);

  const generatePlan = async (config: CampaignConfig) => {
    setIsGenerating(true);
    setError(null);
    setPublications([]);
    setGenerationProgress(null);

    try {
      const firmIds = config.selectedFirmIds && config.selectedFirmIds.length > 0
        ? config.selectedFirmIds
        : [isCommunityManager ? selectedFirmId : null];

      const allGenerated: GeneratedPublication[] = [];

      for (let i = 0; i < firmIds.length; i++) {
        const firmId = firmIds[i];
        const firm = firmId ? assignedFirms.find(f => f.id === firmId) : null;

        if (firmIds.length > 1) {
          setGenerationProgress(`${i + 1}/${firmIds.length}`);
        }

        const { data, error: fnError } = await supabase.functions.invoke("generate-editorial-plan", {
          body: {
            law_firm_id: firmId,
            start_date: config.startDate.toISOString().split("T")[0],
            end_date: config.endDate.toISOString().split("T")[0],
            thematics: config.thematics,
            platforms: config.platforms,
            tone: config.tone,
            frequency: config.frequency,
            content_types: config.contentTypes || [],
            publish_days: config.publishDays || [],
            publish_times: config.publishTimes || [],
            scheduling_mode: config.schedulingMode || "manual",
          },
        });

        if (fnError) throw new Error(fnError.message);
        if (data.error) throw new Error(data.error);

        const pubs = (data.publications || []).map((pub: GeneratedPublication) => ({
          ...pub,
          content_type: pub.content_type || inferContentType(pub.format_suggestion),
          selected: true,
          firmId: firmId || undefined,
          firmName: firm?.name || data.firm_name || undefined,
        }));

        allGenerated.push(...pubs);
      }

      setPublications(allGenerated);
      setGenerationProgress(null);

      toast({
        title: "Plan éditorial généré",
        description: `${allGenerated.length} publications créées pour ${firmIds.length} cabinet${firmIds.length > 1 ? "s" : ""}.`,
      });

      return allGenerated;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la génération";
      setError(message);
      toast({
        title: "Erreur de génération",
        description: message,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  const togglePublicationSelection = (index: number) => {
    setPublications((prev) =>
      prev.map((pub, i) => (i === index ? { ...pub, selected: !pub.selected } : pub))
    );
  };

  const removePublication = (index: number) => {
    setPublications((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePublicationContent = (index: number, content: string) => {
    setPublications((prev) =>
      prev.map((pub, i) => (i === index ? { ...pub, content } : pub))
    );
  };

  const insertPublications = async () => {
    const selectedPubs = publications.filter((p) => p.selected);
    if (selectedPubs.length === 0) {
      toast({
        title: "Aucune publication sélectionnée",
        description: "Veuillez sélectionner au moins une publication.",
        variant: "destructive",
      });
      return false;
    }

    setIsInserting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("Utilisateur non authentifié");
      }

      const publicationsToInsert = selectedPubs.map((pub) => ({
        user_id: userData.user!.id,
        law_firm_id: pub.firmId || (isCommunityManager ? selectedFirmId : null),
        title: pub.title,
        content: pub.content,
        scheduled_date: pub.date,
        scheduled_time: pub.time,
        platform: pub.platform as "linkedin" | "facebook" | "instagram" | "twitter" | "google_business" | "blog",
        status: "brouillon" as const,
        source: "socialpulse" as const,
        validation_status: "cm_review" as const,
      }));

      const { error: insertError } = await supabase
        .from("publications")
        .insert(publicationsToInsert);

      if (insertError) throw insertError;

      toast({
        title: "Publications programmées",
        description: `${selectedPubs.length} publications ajoutées au calendrier.`,
      });

      setPublications([]);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'insertion";
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsInserting(false);
    }
  };

  return {
    isGenerating,
    isInserting,
    publications,
    error,
    generationProgress,
    generatePlan,
    togglePublicationSelection,
    removePublication,
    updatePublicationContent,
    insertPublications,
    setPublications,
  };
}

function inferContentType(formatSuggestion: string): string {
  if (!formatSuggestion) return "default";
  const f = formatSuggestion.toLowerCase();
  if (f.includes("carrousel")) return "pedagogique";
  if (f.includes("visuel")) return "conseil";
  return "default";
}
