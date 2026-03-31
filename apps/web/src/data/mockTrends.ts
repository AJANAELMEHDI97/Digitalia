export type AttentionLevel = "low" | "medium" | "high";
export type Evolution = "rising" | "stable" | "declining";
export type Relevance = "pertinent" | "watch" | "low";
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
  intensity: number; // 1-100
  editorialRecommendation: string;
  date: string;
}

export const TREND_CATEGORIES = [
  { id: "all", label: "Toutes les thématiques" },
  { id: "droit-travail", label: "Droit du travail" },
  { id: "droit-famille", label: "Droit de la famille" },
  { id: "droit-affaires", label: "Droit des affaires" },
  { id: "fiscalite", label: "Fiscalité" },
  { id: "protection-sociale", label: "Protection sociale" },
  { id: "rgpd", label: "Protection des données" },
  { id: "droit-penal", label: "Droit pénal" },
];

export const TIME_PERIODS = [
  { id: "today", label: "Aujourd'hui" },
  { id: "7days", label: "7 derniers jours" },
  { id: "30days", label: "30 derniers jours" },
];

export const MOCK_TRENDS: TrendTopic[] = [
  {
    id: "1",
    title: "Réforme des retraites 2024",
    category: "droit-travail",
    description: "Les nouvelles modalités de calcul des pensions et l'impact sur les régimes spéciaux font l'objet d'un débat intense.",
    whyTrending: "Décision du Conseil constitutionnel attendue et mobilisations sociales continues. Les entreprises anticipent les ajustements nécessaires.",
    attentionLevel: "high",
    evolution: "rising",
    relevance: "pertinent",
    platforms: ["linkedin", "twitter"],
    regions: ["Paris", "Lyon", "Marseille", "Bordeaux"],
    peakRegion: "Paris",
    intensity: 92,
    editorialRecommendation: "Sujet d'actualité forte. Une prise de parole pédagogique sur les implications pour les employeurs et salariés serait pertinente.",
    date: "2024-01-15",
  },
  {
    id: "2",
    title: "Intelligence artificielle et responsabilité",
    category: "droit-affaires",
    description: "Cadre juridique de l'IA Act européen et questions de responsabilité en cas de dommages causés par des systèmes automatisés.",
    whyTrending: "Entrée en vigueur progressive de l'AI Act. Les entreprises cherchent à comprendre leurs obligations de conformité.",
    attentionLevel: "high",
    evolution: "rising",
    relevance: "pertinent",
    platforms: ["linkedin"],
    regions: ["Paris", "Toulouse", "Sophia Antipolis"],
    peakRegion: "Paris",
    intensity: 88,
    editorialRecommendation: "Sujet émergent à fort potentiel. Positionnement d'expertise recommandé pour anticiper les demandes clients.",
    date: "2024-01-15",
  },
  {
    id: "3",
    title: "Télétravail et accident du travail",
    category: "droit-travail",
    description: "Qualification juridique des accidents survenus en télétravail et obligations de prévention de l'employeur.",
    whyTrending: "Jurisprudence récente de la Cour de cassation clarifiant les critères de qualification.",
    attentionLevel: "medium",
    evolution: "stable",
    relevance: "pertinent",
    platforms: ["linkedin", "facebook"],
    regions: ["France entière"],
    peakRegion: "Paris",
    intensity: 65,
    editorialRecommendation: "Sujet pratique et concret. Un rappel des bonnes pratiques serait utile pour les entreprises.",
    date: "2024-01-14",
  },
  {
    id: "4",
    title: "Succession et patrimoine numérique",
    category: "droit-famille",
    description: "Transmission des comptes numériques, cryptomonnaies et données personnelles après décès.",
    whyTrending: "Augmentation des litiges liés à l'accès aux comptes de personnes décédées. Lacunes législatives identifiées.",
    attentionLevel: "medium",
    evolution: "rising",
    relevance: "watch",
    platforms: ["linkedin", "instagram"],
    regions: ["Paris", "Lyon"],
    peakRegion: "Paris",
    intensity: 54,
    editorialRecommendation: "Sujet en émergence. À surveiller pour anticiper les évolutions législatives.",
    date: "2024-01-13",
  },
  {
    id: "5",
    title: "Contrôle fiscal des influenceurs",
    category: "fiscalite",
    description: "Renforcement des contrôles fiscaux sur les revenus des créateurs de contenu et influenceurs.",
    whyTrending: "Annonces ministérielles sur le renforcement des contrôles. Plusieurs redressements médiatisés.",
    attentionLevel: "high",
    evolution: "rising",
    relevance: "pertinent",
    platforms: ["instagram", "linkedin", "twitter"],
    regions: ["Paris", "Cannes", "Monaco"],
    peakRegion: "Paris",
    intensity: 78,
    editorialRecommendation: "Fort intérêt médiatique. Contenu vulgarisant les obligations fiscales recommandé.",
    date: "2024-01-15",
  },
  {
    id: "6",
    title: "Violences intrafamiliales et ordonnance de protection",
    category: "droit-famille",
    description: "Évolutions des dispositifs de protection et délais de traitement des ordonnances.",
    whyTrending: "Campagne gouvernementale et mobilisation associative. Propositions de réforme en discussion.",
    attentionLevel: "medium",
    evolution: "stable",
    relevance: "pertinent",
    platforms: ["linkedin", "facebook"],
    regions: ["France entière"],
    peakRegion: "Paris",
    intensity: 62,
    editorialRecommendation: "Sujet sensible nécessitant une approche mesurée. Informer sur les recours disponibles.",
    date: "2024-01-12",
  },
  {
    id: "7",
    title: "Clause de non-concurrence post-Covid",
    category: "droit-travail",
    description: "Remise en question de la validité des clauses dans le contexte de mobilité professionnelle accrue.",
    whyTrending: "Plusieurs arrêts de cours d'appel redéfinissant les critères de validité.",
    attentionLevel: "low",
    evolution: "stable",
    relevance: "watch",
    platforms: ["linkedin"],
    regions: ["Paris", "Lyon", "Lille"],
    peakRegion: "Paris",
    intensity: 38,
    editorialRecommendation: "Sujet technique pour audience spécialisée. Pertinent pour DRH et directions juridiques.",
    date: "2024-01-10",
  },
  {
    id: "8",
    title: "RGPD et prospection commerciale",
    category: "rgpd",
    description: "Sanctions CNIL en hausse concernant le non-respect du consentement dans les campagnes marketing.",
    whyTrending: "Amende record contre une entreprise française. Publication de nouvelles lignes directrices.",
    attentionLevel: "medium",
    evolution: "rising",
    relevance: "pertinent",
    platforms: ["linkedin", "twitter"],
    regions: ["Paris", "Lyon", "Nantes"],
    peakRegion: "Paris",
    intensity: 71,
    editorialRecommendation: "Sujet d'actualité avec impact direct sur les entreprises. Contenu pratique recommandé.",
    date: "2024-01-14",
  },
  {
    id: "9",
    title: "Bail commercial et indexation des loyers",
    category: "droit-affaires",
    description: "Contentieux croissant sur les clauses d'indexation et plafonnement des augmentations.",
    whyTrending: "Inflation persistante et multiplication des litiges entre bailleurs et preneurs.",
    attentionLevel: "medium",
    evolution: "declining",
    relevance: "watch",
    platforms: ["linkedin"],
    regions: ["Paris", "Marseille", "Nice"],
    peakRegion: "Paris",
    intensity: 45,
    editorialRecommendation: "Sujet en déclin mais reste d'actualité pour certains secteurs. À surveiller.",
    date: "2024-01-11",
  },
  {
    id: "10",
    title: "Aides sociales et contrôle des allocataires",
    category: "protection-sociale",
    description: "Débat sur le renforcement des contrôles CAF et les droits des allocataires.",
    whyTrending: "Médiatisation de témoignages et réponse institutionnelle. Proposition de loi déposée.",
    attentionLevel: "high",
    evolution: "rising",
    relevance: "pertinent",
    platforms: ["facebook", "twitter", "linkedin"],
    regions: ["France entière"],
    peakRegion: "Marseille",
    intensity: 82,
    editorialRecommendation: "Fort intérêt public. Contenu pédagogique sur les droits des allocataires pertinent.",
    date: "2024-01-15",
  },
  {
    id: "11",
    title: "Cybersécurité et responsabilité du dirigeant",
    category: "droit-affaires",
    description: "Obligations du dirigeant en matière de sécurité informatique et conséquences en cas de faille.",
    whyTrending: "Multiplication des cyberattaques contre les PME. Directive NIS2 en cours de transposition.",
    attentionLevel: "medium",
    evolution: "rising",
    relevance: "pertinent",
    platforms: ["linkedin"],
    regions: ["Paris", "Lyon", "Rennes"],
    peakRegion: "Paris",
    intensity: 59,
    editorialRecommendation: "Sujet porteur pour audience dirigeants. Approche préventive recommandée.",
    date: "2024-01-13",
  },
  {
    id: "12",
    title: "Garde alternée et résidence fiscale",
    category: "droit-famille",
    description: "Clarification des règles fiscales applicables aux enfants en garde alternée.",
    whyTrending: "Instruction fiscale récente et questions récurrentes des contribuables.",
    attentionLevel: "low",
    evolution: "stable",
    relevance: "low",
    platforms: ["facebook"],
    regions: ["France entière"],
    peakRegion: "Lyon",
    intensity: 28,
    editorialRecommendation: "Sujet de niche. Peu pertinent pour une prise de parole large.",
    date: "2024-01-08",
  },
];

// Helper function to filter trends by date period
export function filterTrendsByPeriod(trends: TrendTopic[], period: string): TrendTopic[] {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  return trends.filter(trend => {
    const trendDate = new Date(trend.date);
    const diffDays = Math.floor((now.getTime() - trendDate.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (period) {
      case "today":
        return diffDays === 0;
      case "7days":
        return diffDays <= 7;
      case "30days":
        return diffDays <= 30;
      default:
        return true;
    }
  });
}

// Helper function to filter trends by category
export function filterTrendsByCategory(trends: TrendTopic[], category: string): TrendTopic[] {
  if (category === "all") return trends;
  return trends.filter(trend => trend.category === category);
}

// Get attention level label
export function getAttentionLabel(level: AttentionLevel): string {
  switch (level) {
    case "high": return "Fort";
    case "medium": return "Moyen";
    case "low": return "Faible";
  }
}

// Get evolution label
export function getEvolutionLabel(evolution: Evolution): string {
  switch (evolution) {
    case "rising": return "En hausse";
    case "stable": return "Stable";
    case "declining": return "En baisse";
  }
}

// Get relevance label and description
export function getRelevanceInfo(relevance: Relevance): { label: string; description: string } {
  switch (relevance) {
    case "pertinent":
      return { label: "Pertinent de prendre la parole", description: "Ce sujet offre une opportunité de positionnement éditorial." };
    case "watch":
      return { label: "À surveiller", description: "Sujet à suivre pour anticiper une éventuelle prise de parole." };
    case "low":
      return { label: "Peu pertinent pour le moment", description: "Ce sujet ne nécessite pas d'action immédiate." };
  }
}
