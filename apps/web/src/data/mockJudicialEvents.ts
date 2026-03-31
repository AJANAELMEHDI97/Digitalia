export type EventSensitivity = "opportune" | "surveiller" | "eviter";

export type LegalThematic = 
  | "droit-travail"
  | "droit-famille"
  | "droit-penal"
  | "droit-fiscal"
  | "droit-commercial"
  | "droit-social"
  | "droit-numerique"
  | "droit-environnement"
  | "droit-sante"
  | "droit-immobilier"
  | "propriete-intellectuelle";

export interface JudicialEvent {
  id: string;
  date: string; // YYYY-MM-DD format
  endDate?: string; // For multi-day events
  title: string;
  description: string;
  thematic: LegalThematic;
  sensitivity: EventSensitivity;
  sensitivityReason: string;
  speakingGuidance: string;
  linkedTrends?: string[];
  source?: string;
}

export const LEGAL_THEMATICS: Record<LegalThematic, { label: string; color: string }> = {
  "droit-travail": { label: "Droit du travail", color: "bg-blue-500" },
  "droit-famille": { label: "Droit de la famille", color: "bg-pink-500" },
  "droit-penal": { label: "Droit pénal", color: "bg-red-500" },
  "droit-fiscal": { label: "Fiscalité", color: "bg-yellow-500" },
  "droit-commercial": { label: "Droit commercial", color: "bg-orange-500" },
  "droit-social": { label: "Droit social", color: "bg-teal-500" },
  "droit-numerique": { label: "Numérique & données", color: "bg-violet-500" },
  "droit-environnement": { label: "Environnement", color: "bg-green-500" },
  "droit-sante": { label: "Droit de la santé", color: "bg-rose-500" },
  "droit-immobilier": { label: "Immobilier", color: "bg-amber-500" },
  "propriete-intellectuelle": { label: "Propriété intellectuelle", color: "bg-indigo-500" },
};

export const SENSITIVITY_CONFIG: Record<EventSensitivity, { 
  label: string; 
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}> = {
  opportune: { 
    label: "Opportun", 
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    icon: "check-circle",
    description: "Moment propice pour prendre la parole"
  },
  surveiller: { 
    label: "À surveiller", 
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    icon: "eye",
    description: "Sujet sensible, prudence recommandée"
  },
  eviter: { 
    label: "À éviter", 
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    icon: "x-circle",
    description: "Mieux vaut ne pas s'exprimer"
  },
};

// Mock judicial events for 2025
export const MOCK_JUDICIAL_EVENTS: JudicialEvent[] = [
  // Janvier 2025
  {
    id: "je-1",
    date: "2025-01-15",
    title: "Ouverture du procès des viols de Mazan - Phase d'appel",
    description: "Procès en appel très médiatisé concernant des faits de viols sous soumission chimique. L'affaire a provoqué un débat national sur le consentement.",
    thematic: "droit-penal",
    sensitivity: "surveiller",
    sensitivityReason: "Sujet hautement médiatisé et émotionnel. Les prises de parole doivent être mesurées et centrées sur le droit.",
    speakingGuidance: "Privilégiez des explications juridiques (soumission chimique, circonstances aggravantes) sans commenter les personnes impliquées.",
    linkedTrends: ["consentement", "violences-sexuelles"],
  },
  {
    id: "je-2",
    date: "2025-01-20",
    endDate: "2025-01-24",
    title: "Semaine de la médiation familiale",
    description: "Événement national promouvant la médiation comme alternative au contentieux familial.",
    thematic: "droit-famille",
    sensitivity: "opportune",
    sensitivityReason: "Sujet positif et constructif, bien perçu par le grand public.",
    speakingGuidance: "Mettez en avant les avantages de la médiation : coût, rapidité, préservation des relations. Partagez des cas anonymisés de réussite.",
  },
  {
    id: "je-3",
    date: "2025-01-27",
    title: "Publication des statistiques annuelles de la justice",
    description: "Le ministère de la Justice publie le bilan statistique de l'année judiciaire écoulée.",
    thematic: "droit-penal",
    sensitivity: "opportune",
    sensitivityReason: "Données objectives permettant des analyses factuelles.",
    speakingGuidance: "Analysez les chiffres de votre domaine d'expertise. Proposez une lecture critique mais constructive.",
  },
  // Février 2025
  {
    id: "je-4",
    date: "2025-02-03",
    title: "Entrée en vigueur de la réforme de l'assurance chômage",
    description: "Nouvelles règles d'indemnisation des demandeurs d'emploi et de durée des droits.",
    thematic: "droit-travail",
    sensitivity: "opportune",
    sensitivityReason: "Sujet d'intérêt général avec forte demande d'information.",
    speakingGuidance: "Expliquez les changements concrets pour les salariés et employeurs. Évitez les prises de position politiques.",
  },
  {
    id: "je-5",
    date: "2025-02-10",
    endDate: "2025-02-14",
    title: "Procès en diffamation - Affaire médiatique",
    description: "Procès opposant une personnalité publique à un média. L'affaire touche à la liberté de la presse.",
    thematic: "droit-penal",
    sensitivity: "eviter",
    sensitivityReason: "Affaire clivante opposant liberté d'expression et protection de la vie privée.",
    speakingGuidance: "Évitez tout commentaire sur cette affaire spécifique. Si nécessaire, limitez-vous à des rappels généraux sur la diffamation.",
  },
  // Mars 2025
  {
    id: "je-6",
    date: "2025-03-01",
    title: "Revalorisation des pensions alimentaires",
    description: "Application de l'indexation annuelle des pensions alimentaires sur l'indice INSEE.",
    thematic: "droit-famille",
    sensitivity: "opportune",
    sensitivityReason: "Information pratique très recherchée par les justiciables.",
    speakingGuidance: "Publiez un rappel pédagogique sur le calcul de la revalorisation avec des exemples chiffrés.",
  },
  {
    id: "je-7",
    date: "2025-03-17",
    endDate: "2025-03-21",
    title: "Semaine de l'égalité professionnelle",
    description: "Semaine de sensibilisation aux discriminations en entreprise et à l'égalité salariale.",
    thematic: "droit-travail",
    sensitivity: "opportune",
    sensitivityReason: "Événement positif avec fort engagement attendu sur les réseaux.",
    speakingGuidance: "Partagez des informations sur les recours en cas de discrimination. Mettez en avant l'index égalité.",
  },
  // Avril 2025
  {
    id: "je-8",
    date: "2025-04-07",
    title: "Délibéré attendu - Affaire de corruption majeure",
    description: "Décision très attendue dans une affaire de corruption impliquant des élus locaux.",
    thematic: "droit-penal",
    sensitivity: "surveiller",
    sensitivityReason: "Sujet politiquement sensible. Les commentaires peuvent être perçus comme partisans.",
    speakingGuidance: "Attendez le délibéré avant de vous exprimer. Limitez-vous à l'analyse juridique de la décision.",
  },
  {
    id: "je-9",
    date: "2025-04-15",
    title: "Date limite de déclaration fiscale des entreprises",
    description: "Échéance pour le dépôt des déclarations de résultats des sociétés.",
    thematic: "droit-fiscal",
    sensitivity: "opportune",
    sensitivityReason: "Période propice aux rappels et conseils fiscaux.",
    speakingGuidance: "Proposez un récapitulatif des obligations et des erreurs fréquentes à éviter.",
  },
  // Mai 2025
  {
    id: "je-10",
    date: "2025-05-12",
    title: "Décision du Conseil constitutionnel sur la loi immigration",
    description: "Le Conseil constitutionnel rend sa décision sur la conformité de la dernière loi immigration.",
    thematic: "droit-social",
    sensitivity: "surveiller",
    sensitivityReason: "Sujet hautement politique et médiatisé.",
    speakingGuidance: "Analysez la décision sous l'angle strictement juridique. Évitez tout positionnement politique.",
  },
  // Juin 2025
  {
    id: "je-11",
    date: "2025-06-01",
    title: "Entrée en vigueur du nouveau Code de la route",
    description: "Application des nouvelles dispositions concernant les véhicules électriques et la circulation urbaine.",
    thematic: "droit-penal",
    sensitivity: "opportune",
    sensitivityReason: "Changements concrets affectant le quotidien de nombreux citoyens.",
    speakingGuidance: "Vulgarisez les principales nouveautés et leurs implications pratiques.",
  },
  {
    id: "je-12",
    date: "2025-06-15",
    title: "Ouverture du procès France Télécom - Appel",
    description: "Procès en appel de l'affaire du harcèlement moral institutionnel ayant conduit à des suicides.",
    thematic: "droit-travail",
    sensitivity: "surveiller",
    sensitivityReason: "Affaire emblématique touchant à la souffrance au travail. Sujet sensible.",
    speakingGuidance: "Privilégiez l'analyse juridique du harcèlement moral institutionnel sans commenter les témoignages individuels.",
  },
  // Septembre 2025
  {
    id: "je-13",
    date: "2025-09-01",
    title: "Rentrée judiciaire",
    description: "Ouverture officielle de l'année judiciaire avec les discours des chefs de cour.",
    thematic: "droit-penal",
    sensitivity: "opportune",
    sensitivityReason: "Moment institutionnel propice aux bilans et perspectives.",
    speakingGuidance: "Commentez les orientations annoncées par la Chancellerie et les chefs de juridiction.",
  },
  {
    id: "je-14",
    date: "2025-09-15",
    title: "Application du règlement européen sur l'IA",
    description: "Entrée en vigueur des premières dispositions du règlement européen sur l'intelligence artificielle.",
    thematic: "droit-numerique",
    sensitivity: "opportune",
    sensitivityReason: "Sujet d'actualité avec forte demande d'expertise.",
    speakingGuidance: "Expliquez les obligations nouvelles pour les entreprises utilisant l'IA.",
  },
  // Octobre 2025
  {
    id: "je-15",
    date: "2025-10-06",
    endDate: "2025-10-10",
    title: "Semaine de l'accès au droit",
    description: "Événement national de promotion de l'accès au droit pour tous les citoyens.",
    thematic: "droit-social",
    sensitivity: "opportune",
    sensitivityReason: "Événement positif valorisant la profession d'avocat.",
    speakingGuidance: "Participez activement : consultations gratuites, contenus pédagogiques, témoignages.",
  },
  // Novembre 2025
  {
    id: "je-16",
    date: "2025-11-03",
    title: "Décision CEDH - Affaire climatique majeure",
    description: "La Cour européenne des droits de l'homme rend sa décision dans une affaire climatique historique.",
    thematic: "droit-environnement",
    sensitivity: "surveiller",
    sensitivityReason: "Décision susceptible de créer des précédents importants.",
    speakingGuidance: "Analysez les implications juridiques de la décision pour le droit français de l'environnement.",
  },
];

// Helper functions
export function getJudicialEventsForDate(date: Date): JudicialEvent[] {
  const dateStr = date.toISOString().split("T")[0];
  return MOCK_JUDICIAL_EVENTS.filter(event => {
    if (event.endDate) {
      return dateStr >= event.date && dateStr <= event.endDate;
    }
    return event.date === dateStr;
  });
}

export function getJudicialEventsForMonth(year: number, month: number): JudicialEvent[] {
  const monthStr = `${year}-${month.toString().padStart(2, "0")}`;
  return MOCK_JUDICIAL_EVENTS.filter(event => event.date.startsWith(monthStr));
}
