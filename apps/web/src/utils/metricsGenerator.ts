import type { Publication, SocialPlatform } from "@/hooks/usePublications";
import type { PerformanceLevel, PerformanceAnalysis } from "@/data/mockMetrics";

export interface GeneratedMetrics {
  id: string;
  publicationId: string;
  content: string;
  platform: SocialPlatform | null;
  publishedAt: string;
  imageUrl?: string;
  reach: number;
  likes: number;
  comments: number;
  shares?: number;
  clicks?: number;
  engagementRate: number;
  performanceLevel: PerformanceLevel;
  analysis: PerformanceAnalysis;
  audienceAge: { range: string; percentage: number }[];
  audienceLocation: { location: string; percentage: number }[];
  audienceGender: { gender: string; percentage: number }[];
  peakTimes: { day: string; hour: string }[];
}

// Sample images for generated metrics
const GENERATED_IMAGES = [
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=300&fit=crop",
];

// Seeded random number generator for consistent metrics per publication
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return () => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

const PERFORMANCE_SUMMARIES: Record<PerformanceLevel, string[]> = {
  good: [
    "Cette prise de parole remplit pleinement son objectif de visibilité professionnelle.",
    "Ce contenu a bien résonné auprès de vos prospects et justiciables.",
    "Cette communication renforce efficacement la crédibilité de votre cabinet.",
  ],
  medium: [
    "La visibilité est correcte. L'intérêt suscité reste modéré.",
    "Cette communication atteint son public cible avec un engagement convenable.",
    "Cette prise de parole remplit son objectif d'information juridique.",
  ],
  improve: [
    "Cette prise de parole a eu une portée limitée.",
    "Le sujet technique a moins engagé votre audience.",
    "Cette communication nécessite peut-être un ajustement de format.",
  ],
};

const EXPLANATIONS = {
  good: [
    "Le sujet juridique pratique a particulièrement intéressé vos prospects.",
    "Le format utilisé renforce la crédibilité et incite au partage.",
    "Cette prise de parole correspond aux attentes de votre audience professionnelle.",
    "Le ton professionnel et accessible a bien fonctionné auprès de vos abonnés.",
  ],
  medium: [
    "Le sujet juridique, bien que pertinent, a généré un intérêt modéré.",
    "La visibilité reste correcte pour un contenu technique.",
    "Le contenu informatif pourrait bénéficier d'une accroche plus directe.",
  ],
  improve: [
    "Le sujet technique a moins capté l'attention de votre audience.",
    "La période de publication n'était peut-être pas optimale pour ce type de contenu.",
    "Un angle plus concret ou des exemples de cas pourraient renforcer l'impact.",
  ],
};

const RECOMMENDATIONS = {
  good: [
    "Ce type de contenu juridique peut être décliné sur d'autres thématiques.",
    "Le format utilisé renforce votre positionnement. À réutiliser.",
    "Ce sujet peut être approfondi dans une prochaine prise de parole.",
  ],
  medium: [
    "Un angle plus concret ou des exemples de cas pourraient renforcer l'intérêt.",
    "Un format plus visuel pourrait améliorer la visibilité.",
    "Une accroche plus directe pourrait capter davantage l'attention.",
  ],
  improve: [
    "Un format plus visuel (infographie, carrousel) pourrait améliorer la portée.",
    "Une question d'ouverture pourrait susciter la curiosité de vos prospects.",
    "Envisager de publier à un autre moment de la semaine.",
  ],
};

const AGE_DISTRIBUTIONS = [
  [
    { range: "25-34", percentage: 22 },
    { range: "35-44", percentage: 38 },
    { range: "45-54", percentage: 28 },
    { range: "55+", percentage: 12 },
  ],
  [
    { range: "25-34", percentage: 35 },
    { range: "35-44", percentage: 40 },
    { range: "45-54", percentage: 18 },
    { range: "55+", percentage: 7 },
  ],
  [
    { range: "25-34", percentage: 28 },
    { range: "35-44", percentage: 32 },
    { range: "45-54", percentage: 25 },
    { range: "55+", percentage: 15 },
  ],
];

const LOCATIONS_BY_PLATFORM: Record<string, { location: string; percentage: number }[]> = {
  linkedin: [
    { location: "Île-de-France", percentage: 45 },
    { location: "Auvergne-Rhône-Alpes", percentage: 18 },
    { location: "Nouvelle-Aquitaine", percentage: 12 },
    { location: "Autres régions", percentage: 25 },
  ],
  instagram: [
    { location: "Paris", percentage: 38 },
    { location: "Lyon", percentage: 15 },
    { location: "Bordeaux", percentage: 12 },
    { location: "Autres villes", percentage: 35 },
  ],
  facebook: [
    { location: "Île-de-France", percentage: 40 },
    { location: "Hauts-de-France", percentage: 20 },
    { location: "Occitanie", percentage: 15 },
    { location: "Autres régions", percentage: 25 },
  ],
  twitter: [
    { location: "Paris", percentage: 50 },
    { location: "Lyon", percentage: 12 },
    { location: "International", percentage: 20 },
    { location: "Autres villes", percentage: 18 },
  ],
};

const PEAK_TIMES = [
  [{ day: "Mardi", hour: "9h" }, { day: "Jeudi", hour: "12h" }],
  [{ day: "Lundi", hour: "8h" }, { day: "Mercredi", hour: "14h" }],
  [{ day: "Dimanche", hour: "20h" }, { day: "Lundi", hour: "19h" }],
  [{ day: "Samedi", hour: "11h" }],
  [{ day: "Vendredi", hour: "16h" }],
];

export function generateMetricsForPublication(publication: Publication): GeneratedMetrics {
  const random = seededRandom(publication.id);
  
  // Generate base metrics based on random seed
  const baseReach = Math.floor(random() * 2000) + 500;
  const baseLikes = Math.floor(random() * 150) + 10;
  const baseComments = Math.floor(random() * 25) + 1;
  const baseShares = (publication.platform === "linkedin" || publication.platform === "facebook" || publication.platform === "twitter") 
    ? Math.floor(random() * 15) : undefined;
  const baseClicks = (publication.platform === "linkedin" || publication.platform === "facebook") 
    ? Math.floor(random() * 200) + 20 : undefined;
  const baseRetweets = publication.platform === "twitter" ? Math.floor(random() * 30) + 5 : undefined;
  
  const engagementRate = parseFloat(((baseLikes + baseComments + (baseShares || 0) + (baseRetweets || 0)) / baseReach * 100).toFixed(1));
  
  // Determine performance level
  let performanceLevel: PerformanceLevel;
  if (engagementRate >= 3.5) {
    performanceLevel = "good";
  } else if (engagementRate >= 2) {
    performanceLevel = "medium";
  } else {
    performanceLevel = "improve";
  }
  
  // Generate analysis
  const summaryIndex = Math.floor(random() * PERFORMANCE_SUMMARIES[performanceLevel].length);
  const explIndex1 = Math.floor(random() * EXPLANATIONS[performanceLevel].length);
  const explIndex2 = Math.floor(random() * EXPLANATIONS[performanceLevel].length);
  const recoIndex = Math.floor(random() * RECOMMENDATIONS[performanceLevel].length);
  
  const analysis: PerformanceAnalysis = {
    summary: PERFORMANCE_SUMMARIES[performanceLevel][summaryIndex],
    explanations: [
      EXPLANATIONS[performanceLevel][explIndex1],
      EXPLANATIONS[performanceLevel][explIndex2 !== explIndex1 ? explIndex2 : (explIndex2 + 1) % EXPLANATIONS[performanceLevel].length],
    ],
    recommendation: RECOMMENDATIONS[performanceLevel][recoIndex],
  };
  
  // Generate audience data
  const ageDistIndex = Math.floor(random() * AGE_DISTRIBUTIONS.length);
  const peakTimesIndex = Math.floor(random() * PEAK_TIMES.length);
  
  const genderMale = Math.floor(random() * 20) + 45;
  
  // Select image based on seed
  const imageIndex = Math.floor(random() * GENERATED_IMAGES.length);
  const imageUrl = publication.image_url || GENERATED_IMAGES[imageIndex];

  return {
    id: `metrics-${publication.id}`,
    publicationId: publication.id,
    content: publication.content,
    platform: publication.platform,
    publishedAt: publication.scheduled_date,
    imageUrl,
    reach: baseReach,
    likes: baseLikes,
    comments: baseComments,
    shares: baseShares,
    clicks: baseClicks,
    engagementRate,
    performanceLevel,
    analysis,
    audienceAge: AGE_DISTRIBUTIONS[ageDistIndex],
    audienceLocation: LOCATIONS_BY_PLATFORM[publication.platform || "linkedin"] || LOCATIONS_BY_PLATFORM.linkedin,
    audienceGender: [
      { gender: "Hommes", percentage: genderMale },
      { gender: "Femmes", percentage: 100 - genderMale },
    ],
    peakTimes: PEAK_TIMES[peakTimesIndex],
  };
}

export function calculateGlobalStats(metrics: GeneratedMetrics[]) {
  if (metrics.length === 0) {
    return {
      totalReach: 0,
      totalEngagements: 0,
      avgEngagementRate: 0,
      topAgeRange: "35-44",
      topLocation: "Île-de-France",
      bestDay: "Mardi",
      bestHour: "9h",
      linkedinCount: 0,
      instagramCount: 0,
      facebookCount: 0,
      twitterCount: 0,
    };
  }

  const totalReach = metrics.reduce((sum, m) => sum + m.reach, 0);
  const totalEngagements = metrics.reduce((sum, m) => sum + m.likes + m.comments + (m.shares || 0), 0);
  const avgEngagementRate = parseFloat((metrics.reduce((sum, m) => sum + m.engagementRate, 0) / metrics.length).toFixed(1));
  
  const linkedinCount = metrics.filter(m => m.platform === "linkedin").length;
  const instagramCount = metrics.filter(m => m.platform === "instagram").length;
  const facebookCount = metrics.filter(m => m.platform === "facebook").length;
  const twitterCount = metrics.filter(m => m.platform === "twitter").length;

  // Find most common age range
  const ageCounts: Record<string, number> = {};
  metrics.forEach(m => {
    m.audienceAge.forEach(a => {
      ageCounts[a.range] = (ageCounts[a.range] || 0) + a.percentage;
    });
  });
  const topAgeRange = Object.entries(ageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "35-44";

  // Find most common location
  const locationCounts: Record<string, number> = {};
  metrics.forEach(m => {
    m.audienceLocation.forEach(l => {
      if (!l.location.includes("Autres")) {
        locationCounts[l.location] = (locationCounts[l.location] || 0) + l.percentage;
      }
    });
  });
  const topLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Île-de-France";

  // Find best day/hour
  const dayCounts: Record<string, number> = {};
  const hourCounts: Record<string, number> = {};
  metrics.forEach(m => {
    m.peakTimes.forEach(t => {
      dayCounts[t.day] = (dayCounts[t.day] || 0) + 1;
      hourCounts[t.hour] = (hourCounts[t.hour] || 0) + 1;
    });
  });
  const bestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Mardi";
  const bestHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "9h";

  return {
    totalReach,
    totalEngagements,
    avgEngagementRate,
    topAgeRange,
    topLocation,
    bestDay,
    bestHour,
    linkedinCount,
    instagramCount,
    facebookCount,
    twitterCount,
  };
}
