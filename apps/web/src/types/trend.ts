// Unified Trend type used across the app
// Adapts from database snake_case to app camelCase

export type AttentionLevel = "low" | "medium" | "high";
export type Evolution = "rising" | "stable" | "falling";
export type Relevance = "pertinent" | "watch" | "avoid";
export type SocialPlatform = "linkedin" | "instagram" | "facebook" | "twitter";

export interface TrendTopic {
  id: string;
  title: string;
  category: string;
  description: string;
  whyTrending: string;
  attentionLevel: AttentionLevel;
  evolution: Evolution;
  relevance: Relevance;
  platforms: SocialPlatform[];
  regions: string[];
  peakRegion: string;
  intensity: number;
  editorialRecommendation: string;
  date: string;
}

export const TREND_CATEGORIES = [
  { id: "all", label: "Toutes les thématiques" },
  { id: "Droit du travail", label: "Droit du travail" },
  { id: "Droit de la famille", label: "Droit de la famille" },
  { id: "Droit des affaires", label: "Droit des affaires" },
  { id: "Droit fiscal", label: "Fiscalité" },
  { id: "Droit pénal", label: "Droit pénal" },
  { id: "Droit immobilier", label: "Droit immobilier" },
  { id: "Droit numérique", label: "Protection des données" },
];

export const TIME_PERIODS = [
  { id: "day", label: "Aujourd'hui" },
  { id: "week", label: "7 derniers jours" },
  { id: "month", label: "30 derniers jours" },
];

// Helper function to filter trends by category
export function filterTrendsByCategory(trends: TrendTopic[], category: string): TrendTopic[] {
  if (category === "all") return trends;
  return trends.filter(trend => trend.category === category);
}

// Get attention level label
export function getAttentionLabel(level: AttentionLevel | null): string {
  switch (level) {
    case "high": return "Fort";
    case "medium": return "Moyen";
    case "low": return "Faible";
    default: return "N/A";
  }
}

// Get evolution label
export function getEvolutionLabel(evolution: Evolution | null): string {
  switch (evolution) {
    case "rising": return "En hausse";
    case "stable": return "Stable";
    case "falling": return "En baisse";
    default: return "N/A";
  }
}

// Get relevance label and description
export function getRelevanceInfo(relevance: Relevance | null): { label: string; description: string } {
  switch (relevance) {
    case "pertinent":
      return { label: "Pertinent de prendre la parole", description: "Ce sujet offre une opportunité de positionnement éditorial." };
    case "watch":
      return { label: "À surveiller", description: "Sujet à suivre pour anticiper une éventuelle prise de parole." };
    case "avoid":
      return { label: "Peu pertinent pour le moment", description: "Ce sujet ne nécessite pas d'action immédiate." };
    default:
      return { label: "Non évalué", description: "Pertinence non déterminée." };
  }
}
