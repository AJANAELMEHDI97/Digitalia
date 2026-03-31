export type KeyDateCategory = 
  | "droits-humains"
  | "droit-travail"
  | "droit-famille"
  | "justice"
  | "societal"
  | "international";

export interface KeyDate {
  id: string;
  date: string; // MM-DD format for recurring dates
  title: string;
  description: string;
  importance: string;
  speakingOpportunities: string[];
  recommendedPlatforms: ("linkedin" | "instagram" | "facebook" | "twitter")[];
  category: KeyDateCategory;
  isRecurring: boolean;
}

export const KEY_DATE_CATEGORIES: Record<KeyDateCategory, { label: string; color: string }> = {
  "droits-humains": { label: "Droits humains", color: "bg-purple-500" },
  "droit-travail": { label: "Droit du travail", color: "bg-blue-500" },
  "droit-famille": { label: "Droit de la famille", color: "bg-pink-500" },
  "justice": { label: "Justice", color: "bg-amber-500" },
  "societal": { label: "Sociétal", color: "bg-green-500" },
  "international": { label: "International", color: "bg-cyan-500" },
};

export const MOCK_KEY_DATES: KeyDate[] = [
  // Janvier
  {
    id: "kd-1",
    date: "01-27",
    title: "Journée internationale de commémoration des victimes de l'Holocauste",
    description: "Journée établie par l'ONU pour honorer la mémoire des victimes de l'Holocauste et réaffirmer l'engagement contre l'antisémitisme et toute forme de discrimination.",
    importance: "Occasion de rappeler l'importance du droit international humanitaire et des mécanismes de justice pour les crimes contre l'humanité.",
    speakingOpportunities: [
      "Rappel historique et juridique sur les crimes contre l'humanité",
      "Lien avec la justice pénale internationale actuelle",
      "Réflexion sur la lutte contre les discriminations"
    ],
    recommendedPlatforms: ["linkedin"],
    category: "droits-humains",
    isRecurring: true,
  },
  // Février
  {
    id: "kd-2",
    date: "02-06",
    title: "Journée internationale de tolérance zéro à l'égard des mutilations génitales féminines",
    description: "Journée de sensibilisation aux droits des femmes et aux pratiques portant atteinte à leur intégrité physique.",
    importance: "Sujet important pour les avocats spécialisés en droit des étrangers, droit d'asile et droits des femmes.",
    speakingOpportunities: [
      "Protection juridique des victimes en France",
      "Procédures d'asile liées aux MGF",
      "Actions pénales possibles"
    ],
    recommendedPlatforms: ["linkedin", "instagram"],
    category: "droits-humains",
    isRecurring: true,
  },
  // Mars
  {
    id: "kd-3",
    date: "03-08",
    title: "Journée internationale des droits des femmes",
    description: "Journée mondiale célébrant les droits des femmes et la lutte pour l'égalité.",
    importance: "Moment clé pour aborder l'égalité professionnelle, les violences conjugales, et les droits des femmes dans tous les domaines du droit.",
    speakingOpportunities: [
      "Égalité salariale et droit du travail",
      "Protection contre les violences conjugales",
      "Droits des femmes dans le divorce",
      "Harcèlement au travail"
    ],
    recommendedPlatforms: ["linkedin", "instagram", "facebook"],
    category: "droit-famille",
    isRecurring: true,
  },
  {
    id: "kd-4",
    date: "03-21",
    title: "Journée internationale pour l'élimination de la discrimination raciale",
    description: "Commémoration du massacre de Sharpeville (1960) et journée de lutte contre le racisme.",
    importance: "Pertinent pour aborder les discriminations, le testing, et les recours juridiques disponibles.",
    speakingOpportunities: [
      "Discriminations à l'embauche et recours",
      "Testing et preuves de discrimination",
      "Procédure devant le Défenseur des droits"
    ],
    recommendedPlatforms: ["linkedin", "twitter"],
    category: "droits-humains",
    isRecurring: true,
  },
  // Avril
  {
    id: "kd-5",
    date: "04-28",
    title: "Journée mondiale de la sécurité et de la santé au travail",
    description: "Journée de sensibilisation aux risques professionnels et à la prévention des accidents du travail.",
    importance: "Date stratégique pour les avocats en droit du travail : obligations de l'employeur, responsabilité, réparation.",
    speakingOpportunities: [
      "Obligations de sécurité de l'employeur",
      "Faute inexcusable",
      "Accidents du travail et maladies professionnelles",
      "Télétravail et prévention des risques"
    ],
    recommendedPlatforms: ["linkedin"],
    category: "droit-travail",
    isRecurring: true,
  },
  // Mai
  {
    id: "kd-6",
    date: "05-01",
    title: "Fête du travail",
    description: "Journée internationale des travailleurs, fériée en France.",
    importance: "Occasion de rappeler les droits fondamentaux des salariés et l'histoire du droit du travail.",
    speakingOpportunities: [
      "Histoire des droits des travailleurs",
      "Évolutions récentes du Code du travail",
      "Droit syndical et représentation"
    ],
    recommendedPlatforms: ["linkedin", "facebook"],
    category: "droit-travail",
    isRecurring: true,
  },
  {
    id: "kd-7",
    date: "05-15",
    title: "Journée internationale des familles",
    description: "Journée dédiée aux questions familiales, établie par l'ONU.",
    importance: "Idéale pour aborder les évolutions du droit de la famille : adoption, PMA, garde, pension alimentaire.",
    speakingOpportunities: [
      "Évolutions du droit de la famille",
      "Garde alternée : points de vigilance",
      "Pension alimentaire et revalorisation",
      "Adoption et nouvelles parentalités"
    ],
    recommendedPlatforms: ["linkedin", "instagram", "facebook"],
    category: "droit-famille",
    isRecurring: true,
  },
  // Juin
  {
    id: "kd-8",
    date: "06-20",
    title: "Journée mondiale des réfugiés",
    description: "Journée de sensibilisation aux droits des réfugiés et demandeurs d'asile.",
    importance: "Moment clé pour les avocats en droit des étrangers : procédures d'asile, droits des réfugiés.",
    speakingOpportunities: [
      "Procédure de demande d'asile en France",
      "Droits des réfugiés et protection subsidiaire",
      "Recours devant la CNDA"
    ],
    recommendedPlatforms: ["linkedin", "twitter"],
    category: "international",
    isRecurring: true,
  },
  // Septembre
  {
    id: "kd-9",
    date: "09-21",
    title: "Journée internationale de la paix",
    description: "Journée dédiée à la promotion de la paix et à la cessation des hostilités.",
    importance: "Occasion d'aborder le droit international humanitaire et les mécanismes de résolution des conflits.",
    speakingOpportunities: [
      "Droit international humanitaire",
      "Cour pénale internationale",
      "Médiation internationale"
    ],
    recommendedPlatforms: ["linkedin"],
    category: "international",
    isRecurring: true,
  },
  // Octobre
  {
    id: "kd-10",
    date: "10-09",
    title: "Journée mondiale contre la peine de mort",
    description: "Journée de mobilisation pour l'abolition universelle de la peine de mort.",
    importance: "France, terre d'abolition depuis 1981. Occasion de rappeler cet engagement et les combats actuels.",
    speakingOpportunities: [
      "Histoire de l'abolition en France",
      "État des lieux mondial",
      "Rôle des avocats dans la défense des condamnés à mort"
    ],
    recommendedPlatforms: ["linkedin", "twitter"],
    category: "justice",
    isRecurring: true,
  },
  {
    id: "kd-11",
    date: "10-18",
    title: "Journée européenne de lutte contre la traite des êtres humains",
    description: "Sensibilisation à la traite sous toutes ses formes : exploitation sexuelle, travail forcé, etc.",
    importance: "Sujet pénal majeur touchant au droit des victimes, à l'immigration et au droit du travail.",
    speakingOpportunities: [
      "Reconnaissance du statut de victime",
      "Procédures pénales spécifiques",
      "Protection des victimes"
    ],
    recommendedPlatforms: ["linkedin"],
    category: "justice",
    isRecurring: true,
  },
  // Novembre
  {
    id: "kd-12",
    date: "11-20",
    title: "Journée internationale des droits de l'enfant",
    description: "Anniversaire de la Convention internationale des droits de l'enfant (1989).",
    importance: "Date majeure pour aborder les droits des mineurs dans tous les domaines juridiques.",
    speakingOpportunities: [
      "Droits de l'enfant dans le divorce",
      "Justice des mineurs",
      "Protection de l'enfance",
      "Intérêt supérieur de l'enfant"
    ],
    recommendedPlatforms: ["linkedin", "instagram", "facebook"],
    category: "droit-famille",
    isRecurring: true,
  },
  {
    id: "kd-13",
    date: "11-25",
    title: "Journée internationale pour l'élimination de la violence à l'égard des femmes",
    description: "Journée de sensibilisation aux violences faites aux femmes sous toutes leurs formes.",
    importance: "Sujet juridique majeur : ordonnance de protection, plainte, constitution de partie civile.",
    speakingOpportunities: [
      "Ordonnance de protection : procédure et délais",
      "Accompagnement juridique des victimes",
      "Téléphone Grave Danger",
      "Bracelet anti-rapprochement"
    ],
    recommendedPlatforms: ["linkedin", "instagram", "facebook", "twitter"],
    category: "justice",
    isRecurring: true,
  },
  // Décembre
  {
    id: "kd-14",
    date: "12-10",
    title: "Journée internationale des droits de l'homme",
    description: "Anniversaire de la Déclaration universelle des droits de l'homme (1948).",
    importance: "Date symbolique majeure pour rappeler les fondements du droit et les combats actuels.",
    speakingOpportunities: [
      "DUDH : principes fondamentaux",
      "Actualité des droits de l'homme en France",
      "Rôle de l'avocat dans la défense des libertés"
    ],
    recommendedPlatforms: ["linkedin", "twitter"],
    category: "droits-humains",
    isRecurring: true,
  },
  // Événements spécifiques 2024-2025
  {
    id: "kd-15",
    date: "01-20",
    title: "Entrée en vigueur du barème indicatif des pensions alimentaires révisé",
    description: "Nouvelle version du barème de référence pour le calcul des pensions alimentaires.",
    importance: "Impact direct sur les négociations et contentieux en droit de la famille.",
    speakingOpportunities: [
      "Comprendre le nouveau barème",
      "Impact sur les pensions existantes",
      "Demandes de révision"
    ],
    recommendedPlatforms: ["linkedin", "facebook"],
    category: "droit-famille",
    isRecurring: false,
  },
  {
    id: "kd-16",
    date: "02-01",
    title: "Revalorisation du SMIC",
    description: "Augmentation légale du salaire minimum interprofessionnel de croissance.",
    importance: "Impact sur les contrats de travail, les minima conventionnels et les obligations employeurs.",
    speakingOpportunities: [
      "Nouveau montant et calcul",
      "Obligations de mise en conformité",
      "Impact sur les avantages en nature"
    ],
    recommendedPlatforms: ["linkedin"],
    category: "droit-travail",
    isRecurring: false,
  },
];

// Helper to get key dates for a specific month/year
export function getKeyDatesForDate(date: Date): KeyDate[] {
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const dateKey = `${month}-${day}`;
  
  return MOCK_KEY_DATES.filter(kd => kd.date === dateKey);
}

// Helper to get all key dates for a given month
export function getKeyDatesForMonth(year: number, month: number): KeyDate[] {
  const monthStr = month.toString().padStart(2, "0");
  return MOCK_KEY_DATES.filter(kd => kd.date.startsWith(`${monthStr}-`));
}
