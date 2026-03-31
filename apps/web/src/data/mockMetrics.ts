export type PerformanceLevel = "good" | "medium" | "improve";

export interface PerformanceAnalysis {
  summary: string;
  explanations: string[];
  recommendation?: string;
}

export interface PublicationMetrics {
  id: string;
  content: string;
  platform: "linkedin" | "instagram" | "facebook" | "twitter";
  publishedAt: string;
  imageUrl?: string;
  reach: number;
  likes: number;
  comments: number;
  shares?: number;
  clicks?: number;
  engagementRate: number;
  performanceLevel: PerformanceLevel;
  insight: string;
  analysis: PerformanceAnalysis;
  audienceAge: { range: string; percentage: number }[];
  audienceLocation: { location: string; percentage: number }[];
  audienceGender: { gender: string; percentage: number }[];
  peakTimes: { day: string; hour: string }[];
}

// 50 unique images for mock publications (Unsplash - business/professional themes)
const MOCK_IMAGES = [
  // LinkedIn (1-10)
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop", // 1 - signing document
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=300&fit=crop", // 2 - team meeting
  "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=400&h=300&fit=crop", // 3 - data privacy
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop", // 4 - professional portrait
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop", // 5 - contract review
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop", // 6 - office work
  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop", // 7 - presentation
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop", // 8 - therapy session
  "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=400&h=300&fit=crop", // 9 - modern office
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop", // 10 - boardroom
  // Instagram (11-17)
  "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop", // 11 - entrepreneur
  "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=400&h=300&fit=crop", // 12 - handshake
  "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=400&h=300&fit=crop", // 13 - remote work
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop", // 14 - office building
  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop", // 15 - startup
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=300&fit=crop", // 16 - business suit
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop", // 17 - professional woman
  // Twitter/X (18-28)
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=300&fit=crop", // 18 - business woman
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop", // 19 - professional
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=300&fit=crop", // 20 - conference
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop", // 21 - analytics
  "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=300&fit=crop", // 22 - meeting room
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop", // 23 - team work
  "https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=400&h=300&fit=crop", // 24 - hr meeting
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop", // 25 - laptops
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop", // 26 - document
  "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop", // 27 - presentation
  "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=400&h=300&fit=crop", // 28 - graph
  // Facebook (29-50)
  "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&h=300&fit=crop", // 29 - interview
  "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop", // 30 - handshake
  "https://images.unsplash.com/photo-1553484771-371a605b060b?w=400&h=300&fit=crop", // 31 - team meeting
  "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=400&h=300&fit=crop", // 32 - office discussion
  "https://images.unsplash.com/photo-1600478689929-f3e2c2c30e10?w=400&h=300&fit=crop", // 33 - business
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop", // 34 - meeting
  "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&h=300&fit=crop", // 35 - workplace
  "https://images.unsplash.com/photo-1573167243872-43c6433b9d40?w=400&h=300&fit=crop", // 36 - business talk
  "https://images.unsplash.com/photo-1600965962361-9035dbfd1c50?w=400&h=300&fit=crop", // 37 - office
  "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop", // 38 - developer
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop", // 39 - team
  "https://images.unsplash.com/photo-1560264280-88b68371db39?w=400&h=300&fit=crop", // 40 - desk
  "https://images.unsplash.com/photo-1557425955-df376b5903c8?w=400&h=300&fit=crop", // 41 - contract
  "https://images.unsplash.com/photo-1553484604-96f4b1adee46?w=400&h=300&fit=crop", // 42 - documents
  "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&h=300&fit=crop", // 43 - business woman
  "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=400&h=300&fit=crop", // 44 - paperwork
  "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=400&h=300&fit=crop", // 45 - coffee meeting
  "https://images.unsplash.com/photo-1553028826-ccdfc006d078?w=400&h=300&fit=crop", // 46 - payroll
  "https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=400&h=300&fit=crop", // 47 - brainstorm
  "https://images.unsplash.com/photo-1556745753-b2904692b3cd?w=400&h=300&fit=crop", // 48 - expenses
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop", // 49 - meeting room
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop", // 50 - discussion
];

// Helper function to generate consistent audience data
function generateAudienceData(platform: string, seed: number) {
  const ageDistributions = [
    [{ range: "25-34", percentage: 22 }, { range: "35-44", percentage: 38 }, { range: "45-54", percentage: 28 }, { range: "55+", percentage: 12 }],
    [{ range: "25-34", percentage: 35 }, { range: "35-44", percentage: 40 }, { range: "45-54", percentage: 18 }, { range: "55+", percentage: 7 }],
    [{ range: "25-34", percentage: 28 }, { range: "35-44", percentage: 32 }, { range: "45-54", percentage: 25 }, { range: "55+", percentage: 15 }],
    [{ range: "25-34", percentage: 40 }, { range: "35-44", percentage: 30 }, { range: "45-54", percentage: 20 }, { range: "55+", percentage: 10 }],
  ];

  const locationsByPlatform: Record<string, { location: string; percentage: number }[]> = {
    linkedin: [{ location: "Île-de-France", percentage: 45 }, { location: "Auvergne-Rhône-Alpes", percentage: 18 }, { location: "Nouvelle-Aquitaine", percentage: 12 }, { location: "Autres régions", percentage: 25 }],
    instagram: [{ location: "Paris", percentage: 38 }, { location: "Lyon", percentage: 15 }, { location: "Bordeaux", percentage: 12 }, { location: "Autres villes", percentage: 35 }],
    facebook: [{ location: "Île-de-France", percentage: 40 }, { location: "Hauts-de-France", percentage: 20 }, { location: "Occitanie", percentage: 15 }, { location: "Autres régions", percentage: 25 }],
    twitter: [{ location: "Paris", percentage: 50 }, { location: "Lyon", percentage: 12 }, { location: "International", percentage: 20 }, { location: "Autres villes", percentage: 18 }],
  };

  const peakTimes = [
    [{ day: "Mardi", hour: "9h" }, { day: "Jeudi", hour: "12h" }],
    [{ day: "Lundi", hour: "8h" }, { day: "Mercredi", hour: "14h" }],
    [{ day: "Dimanche", hour: "20h" }, { day: "Lundi", hour: "19h" }],
    [{ day: "Samedi", hour: "11h" }],
    [{ day: "Vendredi", hour: "16h" }],
    [{ day: "Jeudi", hour: "18h" }, { day: "Dimanche", hour: "10h" }],
  ];

  const genderMale = 45 + (seed % 20);

  return {
    audienceAge: ageDistributions[seed % ageDistributions.length],
    audienceLocation: locationsByPlatform[platform] || locationsByPlatform.linkedin,
    audienceGender: [{ gender: "Hommes", percentage: genderMale }, { gender: "Femmes", percentage: 100 - genderMale }],
    peakTimes: peakTimes[seed % peakTimes.length],
  };
}

// Helper to generate analysis based on performance
function generateAnalysis(level: PerformanceLevel, seed: number): PerformanceAnalysis {
  const analyses: Record<PerformanceLevel, PerformanceAnalysis[]> = {
    good: [
      { summary: "Ce post a très bien fonctionné.", explanations: ["Le sujet pratique et concret a particulièrement intéressé votre audience cible.", "La publication correspond à un moment de forte attention sur ce réseau."], recommendation: "Ce type de contenu pourrait être décliné sur d'autres thématiques." },
      { summary: "Ce post a excellemment performé.", explanations: ["Le format utilisé facilite la lecture et incite au partage.", "Le ton direct et accessible a bien fonctionné auprès de votre communauté."], recommendation: "Le format utilisé continue de bien performer. À réutiliser." },
      { summary: "Excellente performance pour cette publication.", explanations: ["Le sujet a créé un fort engagement émotionnel.", "La viralité a été amplifiée par les partages."], recommendation: "Ce sujet peut être approfondi dans une prochaine publication." },
    ],
    medium: [
      { summary: "Ce post a suscité un engagement correct.", explanations: ["Le sujet, bien que pertinent, a généré un engagement modéré.", "La portée reste correcte mais les interactions pourraient être améliorées."], recommendation: "Envisager un angle plus concret ou des exemples pratiques." },
      { summary: "Performance moyenne pour cette publication.", explanations: ["Le contenu informatif manquait peut-être d'accroche émotionnelle.", "L'audience a réagi de manière modérée."], recommendation: "Un format plus visuel pourrait améliorer l'engagement." },
      { summary: "Ce contenu a généré un intérêt modéré.", explanations: ["Le format texte seul limite parfois l'engagement.", "Le sujet reste pertinent mais l'accroche pourrait être optimisée."], recommendation: "Tester une accroche plus directe pour capter l'attention." },
    ],
    improve: [
      { summary: "Ce post a eu une portée plus faible que la moyenne.", explanations: ["Le titre informatif manque d'accroche pour capter l'attention.", "La période de publication n'était peut-être pas optimale."], recommendation: "Un format plus visuel (infographie, carrousel) pourrait améliorer la visibilité." },
      { summary: "Cette publication pourrait être améliorée.", explanations: ["Le sujet technique a moins engagé l'audience.", "Un angle plus concret serait préférable."], recommendation: "Tester une question d'ouverture pour susciter la curiosité." },
      { summary: "Ce contenu a eu un impact limité.", explanations: ["La thématique n'a pas suffisamment résonné.", "Le moment de publication n'était pas optimal."], recommendation: "Envisager de republier à un autre moment de la semaine." },
    ],
  };

  return analyses[level][seed % analyses[level].length];
}

// LinkedIn publications (10)
const linkedinPublications: PublicationMetrics[] = [
  {
    id: "li-1",
    content: "Le délai de prescription en droit du travail : ce que tout employeur doit savoir avant qu'il ne soit trop tard.",
    platform: "linkedin",
    publishedAt: "2026-01-10",
    imageUrl: MOCK_IMAGES[0],
    reach: 2340, likes: 87, comments: 12, shares: 8, clicks: 156,
    engagementRate: 4.6, performanceLevel: "good",
    insight: "Ce contenu a très bien fonctionné auprès des 35-44 ans.",
    ...generateAudienceData("linkedin", 1),
    analysis: generateAnalysis("good", 1),
  },
  {
    id: "li-2",
    content: "3 erreurs fréquentes dans les contrats de travail — et comment les éviter simplement.",
    platform: "linkedin",
    publishedAt: "2026-01-08",
    imageUrl: MOCK_IMAGES[1],
    reach: 1890, likes: 64, comments: 8, shares: 5, clicks: 98,
    engagementRate: 3.8, performanceLevel: "good",
    insight: "Format listé apprécié par les DRH.",
    ...generateAudienceData("linkedin", 2),
    analysis: generateAnalysis("good", 2),
  },
  {
    id: "li-3",
    content: "RGPD : les obligations souvent oubliées par les petites entreprises.",
    platform: "linkedin",
    publishedAt: "2026-01-04",
    imageUrl: MOCK_IMAGES[2],
    reach: 980, likes: 34, comments: 4, shares: 2, clicks: 45,
    engagementRate: 2.1, performanceLevel: "medium",
    insight: "Sujet technique, engagement modéré.",
    ...generateAudienceData("linkedin", 3),
    analysis: generateAnalysis("medium", 3),
  },
  {
    id: "li-4",
    content: "Les nouveautés du Code du travail 2026 : résumé pour les non-juristes.",
    platform: "linkedin",
    publishedAt: "2025-12-28",
    imageUrl: MOCK_IMAGES[3],
    reach: 560, likes: 18, comments: 2, shares: 1, clicks: 22,
    engagementRate: 1.4, performanceLevel: "improve",
    insight: "Contenu informatif mais manquait d'accroche.",
    ...generateAudienceData("linkedin", 4),
    analysis: generateAnalysis("improve", 4),
  },
  {
    id: "li-5",
    content: "Rupture conventionnelle : les 3 pièges à éviter pour l'employeur.",
    platform: "linkedin",
    publishedAt: "2026-01-05",
    imageUrl: MOCK_IMAGES[4],
    reach: 2560, likes: 124, comments: 28, shares: 15, clicks: 189,
    engagementRate: 5.1, performanceLevel: "good",
    insight: "Meilleure publication du mois !",
    ...generateAudienceData("linkedin", 5),
    analysis: generateAnalysis("good", 5),
  },
  {
    id: "li-6",
    content: "Comment rédiger une clause de mobilité conforme et efficace ?",
    platform: "linkedin",
    publishedAt: "2026-01-03",
    imageUrl: MOCK_IMAGES[5],
    reach: 1450, likes: 52, comments: 6, shares: 4, clicks: 78,
    engagementRate: 3.2, performanceLevel: "medium",
    insight: "Sujet de niche mais bien ciblé.",
    ...generateAudienceData("linkedin", 6),
    analysis: generateAnalysis("medium", 6),
  },
  {
    id: "li-7",
    content: "Entretien professionnel : vos obligations légales en 2026.",
    platform: "linkedin",
    publishedAt: "2025-12-20",
    imageUrl: MOCK_IMAGES[6],
    reach: 1780, likes: 68, comments: 14, shares: 9, clicks: 112,
    engagementRate: 4.0, performanceLevel: "good",
    insight: "Fort intérêt des managers.",
    ...generateAudienceData("linkedin", 7),
    analysis: generateAnalysis("good", 7),
  },
  {
    id: "li-8",
    content: "Temps partiel thérapeutique : droits et devoirs de l'employeur.",
    platform: "linkedin",
    publishedAt: "2025-12-15",
    imageUrl: MOCK_IMAGES[7],
    reach: 890, likes: 28, comments: 5, shares: 2, clicks: 34,
    engagementRate: 1.9, performanceLevel: "medium",
    insight: "Sujet spécialisé, audience ciblée.",
    ...generateAudienceData("linkedin", 8),
    analysis: generateAnalysis("medium", 8),
  },
  {
    id: "li-9",
    content: "Les 5 documents RH à mettre à jour en début d'année.",
    platform: "linkedin",
    publishedAt: "2026-01-02",
    imageUrl: MOCK_IMAGES[8],
    reach: 2100, likes: 95, comments: 18, shares: 12, clicks: 145,
    engagementRate: 4.8, performanceLevel: "good",
    insight: "Timing parfait, forte viralité.",
    ...generateAudienceData("linkedin", 9),
    analysis: generateAnalysis("good", 9),
  },
  {
    id: "li-10",
    content: "Licenciement pour inaptitude : la procédure pas à pas.",
    platform: "linkedin",
    publishedAt: "2025-12-10",
    imageUrl: MOCK_IMAGES[9],
    reach: 1320, likes: 45, comments: 8, shares: 5, clicks: 67,
    engagementRate: 2.8, performanceLevel: "medium",
    insight: "Contenu utile mais technique.",
    ...generateAudienceData("linkedin", 10),
    analysis: generateAnalysis("medium", 10),
  },
];

// Instagram publications (7)
const instagramPublications: PublicationMetrics[] = [
  {
    id: "ig-1",
    content: "Vous êtes dirigeant ? Voici pourquoi vous devriez relire vos statuts cette année. 📋",
    platform: "instagram",
    publishedAt: "2026-01-06",
    imageUrl: MOCK_IMAGES[10],
    reach: 1250, likes: 156, comments: 23,
    engagementRate: 5.2, performanceLevel: "good",
    insight: "Excellent engagement, question d'accroche efficace.",
    ...generateAudienceData("instagram", 11),
    analysis: generateAnalysis("good", 11),
  },
  {
    id: "ig-2",
    content: "Le saviez-vous ? Un contrat verbal peut être aussi valable qu'un écrit dans certains cas. 🤔",
    platform: "instagram",
    publishedAt: "2026-01-02",
    imageUrl: MOCK_IMAGES[11],
    reach: 890, likes: 78, comments: 15,
    engagementRate: 3.4, performanceLevel: "medium",
    insight: "Format Le saviez-vous efficace.",
    ...generateAudienceData("instagram", 12),
    analysis: generateAnalysis("medium", 12),
  },
  {
    id: "ig-3",
    content: "Télétravail : comment encadrer juridiquement cette pratique ? 🏠💼",
    platform: "instagram",
    publishedAt: "2026-01-03",
    imageUrl: MOCK_IMAGES[12],
    reach: 1120, likes: 89, comments: 12,
    engagementRate: 3.2, performanceLevel: "medium",
    insight: "Sujet d'actualité, bon engagement.",
    ...generateAudienceData("instagram", 13),
    analysis: generateAnalysis("medium", 13),
  },
  {
    id: "ig-4",
    content: "3 réflexes à adopter avant de signer un bail commercial 🏢",
    platform: "instagram",
    publishedAt: "2025-12-28",
    imageUrl: MOCK_IMAGES[13],
    reach: 1450, likes: 134, comments: 28,
    engagementRate: 4.8, performanceLevel: "good",
    insight: "Carrousel très apprécié.",
    ...generateAudienceData("instagram", 14),
    analysis: generateAnalysis("good", 14),
  },
  {
    id: "ig-5",
    content: "Créer sa SARL en 2026 : les étapes clés ✅",
    platform: "instagram",
    publishedAt: "2025-12-22",
    imageUrl: MOCK_IMAGES[14],
    reach: 980, likes: 67, comments: 9,
    engagementRate: 2.6, performanceLevel: "medium",
    insight: "Contenu éducatif bien reçu.",
    ...generateAudienceData("instagram", 15),
    analysis: generateAnalysis("medium", 15),
  },
  {
    id: "ig-6",
    content: "Protection du patrimoine personnel : ce que tout entrepreneur doit savoir 🛡️",
    platform: "instagram",
    publishedAt: "2025-12-18",
    imageUrl: MOCK_IMAGES[15],
    reach: 1680, likes: 198, comments: 34,
    engagementRate: 5.8, performanceLevel: "good",
    insight: "Post viral, sujet qui touche.",
    ...generateAudienceData("instagram", 16),
    analysis: generateAnalysis("good", 16),
  },
  {
    id: "ig-7",
    content: "Les erreurs juridiques les plus fréquentes des startups 🚀⚠️",
    platform: "instagram",
    publishedAt: "2025-12-12",
    imageUrl: MOCK_IMAGES[16],
    reach: 2100, likes: 245, comments: 42,
    engagementRate: 6.2, performanceLevel: "good",
    insight: "Meilleur post Instagram du mois !",
    ...generateAudienceData("instagram", 17),
    analysis: generateAnalysis("good", 17),
  },
];

// Twitter/X publications (11)
const twitterPublications: PublicationMetrics[] = [
  {
    id: "tw-1",
    content: "La clause de non-concurrence : protégez votre entreprise sans freiner vos talents.",
    platform: "twitter",
    publishedAt: "2026-01-07",
    imageUrl: MOCK_IMAGES[17],
    reach: 2100, likes: 45, comments: 8, shares: 28,
    engagementRate: 3.9, performanceLevel: "good",
    insight: "Très bonne viralité sur X.",
    ...generateAudienceData("twitter", 18),
    analysis: generateAnalysis("good", 18),
  },
  {
    id: "tw-2",
    content: "Burn-out au travail : les obligations de l'employeur en matière de prévention.",
    platform: "twitter",
    publishedAt: "2026-01-01",
    imageUrl: MOCK_IMAGES[18],
    reach: 3200, likes: 156, comments: 42, shares: 85,
    engagementRate: 6.8, performanceLevel: "good",
    insight: "Publication virale !",
    ...generateAudienceData("twitter", 19),
    analysis: generateAnalysis("good", 19),
  },
  {
    id: "tw-3",
    content: "Thread 🧵 : Les 7 points essentiels d'un pacte d'associés",
    platform: "twitter",
    publishedAt: "2025-12-29",
    imageUrl: MOCK_IMAGES[19],
    reach: 1850, likes: 67, comments: 12, shares: 34,
    engagementRate: 4.2, performanceLevel: "good",
    insight: "Format thread très efficace.",
    ...generateAudienceData("twitter", 20),
    analysis: generateAnalysis("good", 20),
  },
  {
    id: "tw-4",
    content: "Rappel : le délai de contestation d'un licenciement est de 12 mois.",
    platform: "twitter",
    publishedAt: "2025-12-25",
    imageUrl: MOCK_IMAGES[20],
    reach: 980, likes: 23, comments: 4, shares: 12,
    engagementRate: 2.0, performanceLevel: "medium",
    insight: "Information utile, engagement modéré.",
    ...generateAudienceData("twitter", 21),
    analysis: generateAnalysis("medium", 21),
  },
  {
    id: "tw-5",
    content: "CSE : les nouvelles attributions en 2026. Ce qui change concrètement.",
    platform: "twitter",
    publishedAt: "2025-12-20",
    imageUrl: MOCK_IMAGES[21],
    reach: 1450, likes: 38, comments: 6, shares: 18,
    engagementRate: 2.8, performanceLevel: "medium",
    insight: "Sujet d'actualité RH.",
    ...generateAudienceData("twitter", 22),
    analysis: generateAnalysis("medium", 22),
  },
  {
    id: "tw-6",
    content: "Contentieux prud'homal : 3 conseils pour bien préparer votre dossier.",
    platform: "twitter",
    publishedAt: "2025-12-15",
    imageUrl: MOCK_IMAGES[22],
    reach: 2340, likes: 89, comments: 24, shares: 45,
    engagementRate: 5.1, performanceLevel: "good",
    insight: "Fort intérêt des professionnels RH.",
    ...generateAudienceData("twitter", 23),
    analysis: generateAnalysis("good", 23),
  },
  {
    id: "tw-7",
    content: "La médiation en entreprise : une alternative au contentieux à considérer.",
    platform: "twitter",
    publishedAt: "2025-12-10",
    imageUrl: MOCK_IMAGES[23],
    reach: 780, likes: 19, comments: 3, shares: 8,
    engagementRate: 1.5, performanceLevel: "improve",
    insight: "Sujet de niche, portée limitée.",
    ...generateAudienceData("twitter", 24),
    analysis: generateAnalysis("improve", 24),
  },
  {
    id: "tw-8",
    content: "Égalité professionnelle : publication de l'index obligatoire le 1er mars.",
    platform: "twitter",
    publishedAt: "2025-12-05",
    imageUrl: MOCK_IMAGES[24],
    reach: 1670, likes: 52, comments: 14, shares: 28,
    engagementRate: 3.6, performanceLevel: "good",
    insight: "Rappel réglementaire apprécié.",
    ...generateAudienceData("twitter", 25),
    analysis: generateAnalysis("good", 25),
  },
  {
    id: "tw-9",
    content: "Accident du travail vs accident de trajet : quelles différences pour l'employeur ?",
    platform: "twitter",
    publishedAt: "2025-12-01",
    imageUrl: MOCK_IMAGES[25],
    reach: 1120, likes: 34, comments: 8, shares: 15,
    engagementRate: 2.4, performanceLevel: "medium",
    insight: "Question fréquente bien traitée.",
    ...generateAudienceData("twitter", 26),
    analysis: generateAnalysis("medium", 26),
  },
  {
    id: "tw-10",
    content: "Forfait jours : attention aux conditions de validité de la convention !",
    platform: "twitter",
    publishedAt: "2025-11-28",
    imageUrl: MOCK_IMAGES[26],
    reach: 890, likes: 28, comments: 5, shares: 11,
    engagementRate: 2.2, performanceLevel: "medium",
    insight: "Sujet technique mais pertinent.",
    ...generateAudienceData("twitter", 27),
    analysis: generateAnalysis("medium", 27),
  },
  {
    id: "tw-11",
    content: "Télétravail transfrontalier : les règles fiscales et sociales à connaître.",
    platform: "twitter",
    publishedAt: "2025-11-25",
    imageUrl: MOCK_IMAGES[27],
    reach: 1980, likes: 78, comments: 22, shares: 38,
    engagementRate: 4.5, performanceLevel: "good",
    insight: "Sujet d'actualité internationale.",
    ...generateAudienceData("twitter", 28),
    analysis: generateAnalysis("good", 28),
  },
];

// Facebook publications (22)
const facebookPublications: PublicationMetrics[] = [
  {
    id: "fb-1",
    content: "Comment réussir son entretien annuel en tant que manager ? Mes 5 conseils essentiels.",
    platform: "facebook",
    publishedAt: "2026-01-09",
    imageUrl: MOCK_IMAGES[28],
    reach: 1780, likes: 92, comments: 18, shares: 12, clicks: 134,
    engagementRate: 4.2, performanceLevel: "good",
    insight: "Forte viralité grâce aux partages.",
    ...generateAudienceData("facebook", 29),
    analysis: generateAnalysis("good", 29),
  },
  {
    id: "fb-2",
    content: "Licenciement économique : comprendre les étapes clés pour sécuriser la procédure.",
    platform: "facebook",
    publishedAt: "2025-12-30",
    imageUrl: MOCK_IMAGES[29],
    reach: 750, likes: 28, comments: 5, shares: 3, clicks: 42,
    engagementRate: 1.8, performanceLevel: "improve",
    insight: "Sujet sensible, approche à revoir.",
    ...generateAudienceData("facebook", 30),
    analysis: generateAnalysis("improve", 30),
  },
  {
    id: "fb-3",
    content: "Les aides à l'embauche en 2026 : le guide complet pour les TPE/PME.",
    platform: "facebook",
    publishedAt: "2026-01-08",
    imageUrl: MOCK_IMAGES[30],
    reach: 2450, likes: 134, comments: 28, shares: 45, clicks: 189,
    engagementRate: 5.2, performanceLevel: "good",
    insight: "Contenu très recherché.",
    ...generateAudienceData("facebook", 31),
    analysis: generateAnalysis("good", 31),
  },
  {
    id: "fb-4",
    content: "Congés payés : les règles à connaître pour éviter les contentieux.",
    platform: "facebook",
    publishedAt: "2026-01-05",
    imageUrl: MOCK_IMAGES[31],
    reach: 1890, likes: 78, comments: 15, shares: 22, clicks: 98,
    engagementRate: 3.8, performanceLevel: "good",
    insight: "Sujet pratique très apprécié.",
    ...generateAudienceData("facebook", 32),
    analysis: generateAnalysis("good", 32),
  },
  {
    id: "fb-5",
    content: "Prime de partage de la valeur : comment la mettre en place dans votre entreprise ?",
    platform: "facebook",
    publishedAt: "2026-01-03",
    imageUrl: MOCK_IMAGES[32],
    reach: 1340, likes: 56, comments: 12, shares: 8, clicks: 67,
    engagementRate: 2.9, performanceLevel: "medium",
    insight: "Bon engagement des dirigeants.",
    ...generateAudienceData("facebook", 33),
    analysis: generateAnalysis("medium", 33),
  },
  {
    id: "fb-6",
    content: "Embaucher son premier salarié : check-list des formalités obligatoires.",
    platform: "facebook",
    publishedAt: "2025-12-28",
    imageUrl: MOCK_IMAGES[33],
    reach: 2780, likes: 167, comments: 42, shares: 68, clicks: 234,
    engagementRate: 6.1, performanceLevel: "good",
    insight: "Post viral, parfait pour les créateurs.",
    ...generateAudienceData("facebook", 34),
    analysis: generateAnalysis("good", 34),
  },
  {
    id: "fb-7",
    content: "Arrêt maladie : les droits et obligations de l'employeur et du salarié.",
    platform: "facebook",
    publishedAt: "2025-12-25",
    imageUrl: MOCK_IMAGES[34],
    reach: 1560, likes: 62, comments: 14, shares: 18, clicks: 78,
    engagementRate: 3.2, performanceLevel: "medium",
    insight: "Information de base bien reçue.",
    ...generateAudienceData("facebook", 35),
    analysis: generateAnalysis("medium", 35),
  },
  {
    id: "fb-8",
    content: "Heures supplémentaires : récapitulatif des règles en vigueur.",
    platform: "facebook",
    publishedAt: "2025-12-22",
    imageUrl: MOCK_IMAGES[35],
    reach: 890, likes: 34, comments: 6, shares: 4, clicks: 45,
    engagementRate: 2.1, performanceLevel: "medium",
    insight: "Sujet classique, engagement modéré.",
    ...generateAudienceData("facebook", 36),
    analysis: generateAnalysis("medium", 36),
  },
  {
    id: "fb-9",
    content: "Document unique d'évaluation des risques : mise à jour obligatoire annuelle.",
    platform: "facebook",
    publishedAt: "2025-12-18",
    imageUrl: MOCK_IMAGES[36],
    reach: 1120, likes: 42, comments: 8, shares: 12, clicks: 56,
    engagementRate: 2.5, performanceLevel: "medium",
    insight: "Rappel réglementaire utile.",
    ...generateAudienceData("facebook", 37),
    analysis: generateAnalysis("medium", 37),
  },
  {
    id: "fb-10",
    content: "Mutuelle d'entreprise : vos obligations en tant qu'employeur.",
    platform: "facebook",
    publishedAt: "2025-12-15",
    imageUrl: MOCK_IMAGES[37],
    reach: 1450, likes: 58, comments: 11, shares: 15, clicks: 72,
    engagementRate: 3.0, performanceLevel: "medium",
    insight: "Question fréquente bien adressée.",
    ...generateAudienceData("facebook", 38),
    analysis: generateAnalysis("medium", 38),
  },
  {
    id: "fb-11",
    content: "Période d'essai : durées maximales et règles de renouvellement.",
    platform: "facebook",
    publishedAt: "2025-12-12",
    imageUrl: MOCK_IMAGES[38],
    reach: 1980, likes: 89, comments: 22, shares: 28, clicks: 112,
    engagementRate: 4.2, performanceLevel: "good",
    insight: "Sujet basique mais très recherché.",
    ...generateAudienceData("facebook", 39),
    analysis: generateAnalysis("good", 39),
  },
  {
    id: "fb-12",
    content: "Stagiaires en entreprise : les règles à respecter absolument.",
    platform: "facebook",
    publishedAt: "2025-12-08",
    imageUrl: MOCK_IMAGES[39],
    reach: 2340, likes: 112, comments: 34, shares: 42, clicks: 156,
    engagementRate: 5.0, performanceLevel: "good",
    insight: "Timing parfait (période de stage).",
    ...generateAudienceData("facebook", 40),
    analysis: generateAnalysis("good", 40),
  },
  {
    id: "fb-13",
    content: "Clause de confidentialité : comment la rédiger efficacement ?",
    platform: "facebook",
    publishedAt: "2025-12-05",
    imageUrl: MOCK_IMAGES[40],
    reach: 780, likes: 24, comments: 4, shares: 5, clicks: 32,
    engagementRate: 1.6, performanceLevel: "improve",
    insight: "Sujet technique, audience limitée.",
    ...generateAudienceData("facebook", 41),
    analysis: generateAnalysis("improve", 41),
  },
  {
    id: "fb-14",
    content: "Registre du personnel : obligations et modèle gratuit à télécharger.",
    platform: "facebook",
    publishedAt: "2025-12-01",
    imageUrl: MOCK_IMAGES[41],
    reach: 3120, likes: 198, comments: 56, shares: 89, clicks: 278,
    engagementRate: 7.2, performanceLevel: "good",
    insight: "Ressource gratuite = viralité maximale.",
    ...generateAudienceData("facebook", 42),
    analysis: generateAnalysis("good", 42),
  },
  {
    id: "fb-15",
    content: "Prévention du harcèlement : les obligations de l'employeur en 2026.",
    platform: "facebook",
    publishedAt: "2025-11-28",
    imageUrl: MOCK_IMAGES[42],
    reach: 1670, likes: 72, comments: 18, shares: 24, clicks: 89,
    engagementRate: 3.8, performanceLevel: "good",
    insight: "Sujet de société, fort engagement.",
    ...generateAudienceData("facebook", 43),
    analysis: generateAnalysis("good", 43),
  },
  {
    id: "fb-16",
    content: "Avertissement disciplinaire : modèle et procédure à suivre.",
    platform: "facebook",
    publishedAt: "2025-11-25",
    imageUrl: MOCK_IMAGES[43],
    reach: 1230, likes: 48, comments: 9, shares: 14, clicks: 62,
    engagementRate: 2.8, performanceLevel: "medium",
    insight: "Modèle pratique apprécié.",
    ...generateAudienceData("facebook", 44),
    analysis: generateAnalysis("medium", 44),
  },
  {
    id: "fb-17",
    content: "Travail le dimanche : les dérogations possibles pour les commerces.",
    platform: "facebook",
    publishedAt: "2025-11-22",
    imageUrl: MOCK_IMAGES[44],
    reach: 890, likes: 32, comments: 6, shares: 8, clicks: 45,
    engagementRate: 2.2, performanceLevel: "medium",
    insight: "Sujet saisonnier, intérêt ciblé.",
    ...generateAudienceData("facebook", 45),
    analysis: generateAnalysis("medium", 45),
  },
  {
    id: "fb-18",
    content: "Bulletin de paie simplifié : ce qui doit y figurer obligatoirement.",
    platform: "facebook",
    publishedAt: "2025-11-18",
    imageUrl: MOCK_IMAGES[45],
    reach: 1890, likes: 86, comments: 22, shares: 32, clicks: 98,
    engagementRate: 4.4, performanceLevel: "good",
    insight: "Sujet pratique très demandé.",
    ...generateAudienceData("facebook", 46),
    analysis: generateAnalysis("good", 46),
  },
  {
    id: "fb-19",
    content: "Délégation de pouvoir : comment la mettre en place correctement ?",
    platform: "facebook",
    publishedAt: "2025-11-15",
    imageUrl: MOCK_IMAGES[46],
    reach: 720, likes: 22, comments: 3, shares: 4, clicks: 28,
    engagementRate: 1.4, performanceLevel: "improve",
    insight: "Sujet trop spécialisé.",
    ...generateAudienceData("facebook", 47),
    analysis: generateAnalysis("improve", 47),
  },
  {
    id: "fb-20",
    content: "Frais professionnels : barèmes 2026 et modalités de remboursement.",
    platform: "facebook",
    publishedAt: "2025-11-12",
    imageUrl: MOCK_IMAGES[47],
    reach: 2120, likes: 98, comments: 28, shares: 38, clicks: 134,
    engagementRate: 4.8, performanceLevel: "good",
    insight: "Information pratique très recherchée.",
    ...generateAudienceData("facebook", 48),
    analysis: generateAnalysis("good", 48),
  },
  {
    id: "fb-21",
    content: "Préavis de démission : durées légales et conventions collectives.",
    platform: "facebook",
    publishedAt: "2025-11-08",
    imageUrl: MOCK_IMAGES[48],
    reach: 1560, likes: 64, comments: 14, shares: 20, clicks: 78,
    engagementRate: 3.4, performanceLevel: "medium",
    insight: "Question classique bien traitée.",
    ...generateAudienceData("facebook", 49),
    analysis: generateAnalysis("medium", 49),
  },
  {
    id: "fb-22",
    content: "Solde de tout compte : les éléments à vérifier impérativement.",
    platform: "facebook",
    publishedAt: "2025-11-05",
    imageUrl: MOCK_IMAGES[49],
    reach: 1890, likes: 82, comments: 19, shares: 26, clicks: 98,
    engagementRate: 4.0, performanceLevel: "good",
    insight: "Checklist pratique appréciée.",
    ...generateAudienceData("facebook", 50),
    analysis: generateAnalysis("good", 50),
  },
];

// Combine all publications
export const mockPublications: PublicationMetrics[] = [
  ...linkedinPublications,
  ...instagramPublications,
  ...twitterPublications,
  ...facebookPublications,
];

export const globalAudienceStats = {
  totalReach: mockPublications.reduce((sum, p) => sum + p.reach, 0),
  totalEngagements: mockPublications.reduce((sum, p) => sum + p.likes + p.comments + (p.shares || 0), 0),
  avgEngagementRate: parseFloat((mockPublications.reduce((sum, p) => sum + p.engagementRate, 0) / mockPublications.length).toFixed(1)),
  topAgeRange: "35-44",
  topLocation: "Île-de-France",
  bestDay: "Mardi",
  bestHour: "9h",
};
