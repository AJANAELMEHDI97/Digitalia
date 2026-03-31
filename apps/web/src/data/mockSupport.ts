// Types pour le support et l'accompagnement
export interface FAQItem {
  id: string;
  category: FAQCategory;
  question: string;
  answer: string;
  keywords: string[];
}

export type FAQCategory = 
  | 'platform' 
  | 'validation' 
  | 'editorial' 
  | 'social' 
  | 'billing';

export interface CMProfile {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  isOnline: boolean;
  responseTime: string;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'cm' | 'ai';
  timestamp: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  subject: string;
  reason: ContactReason;
  linkedPublicationId?: string;
  messages: Message[];
  status: 'open' | 'closed';
  createdAt: Date;
}

export type ContactReason = 
  | 'post_question' 
  | 'editorial_advice' 
  | 'complaint' 
  | 'billing' 
  | 'other';

export interface AppointmentSlot {
  id: string;
  date: Date;
  time: string;
  duration: string;
  available: boolean;
}

export interface AppointmentType {
  id: string;
  label: string;
  description: string;
  duration: string;
  icon: string;
}

// Données simulées
export const FAQ_CATEGORIES: Record<FAQCategory, { label: string; icon: string }> = {
  platform: { label: 'Utilisation de la plateforme', icon: 'Layout' },
  validation: { label: 'Validation des contenus', icon: 'CheckCircle' },
  editorial: { label: 'Règles éditoriales', icon: 'FileText' },
  social: { label: 'Réseaux sociaux', icon: 'Share2' },
  billing: { label: 'Facturation', icon: 'CreditCard' },
};

export const MOCK_FAQ: FAQItem[] = [
  // Plateforme
  {
    id: 'faq-1',
    category: 'platform',
    question: 'Comment accéder à mon calendrier éditorial ?',
    answer: 'Votre calendrier éditorial est accessible depuis le menu principal, en cliquant sur "Calendrier". Vous y trouverez toutes vos publications planifiées ainsi que les dates clés juridiques pertinentes pour votre activité.',
    keywords: ['calendrier', 'planning', 'accès', 'navigation'],
  },
  {
    id: 'faq-2',
    category: 'platform',
    question: 'Comment modifier une publication proposée ?',
    answer: 'Cliquez sur la publication dans votre calendrier ou dans la section "À valider". Vous pourrez alors modifier le texte, l\'image, la date de programmation et les réseaux ciblés. Vos modifications sont enregistrées automatiquement.',
    keywords: ['modifier', 'éditer', 'publication', 'contenu'],
  },
  {
    id: 'faq-3',
    category: 'platform',
    question: 'Où trouver mes statistiques de performance ?',
    answer: 'Rendez-vous dans la section "Métriques" du menu principal. Vous y trouverez un tableau de bord complet avec vos indicateurs de performance, l\'évolution de votre audience et le détail par publication.',
    keywords: ['statistiques', 'métriques', 'performance', 'analytics'],
  },
  // Validation
  {
    id: 'faq-4',
    category: 'validation',
    question: 'Quel est le délai pour valider une publication ?',
    answer: 'Nous vous recommandons de valider vos publications au moins 24 heures avant la date de diffusion prévue. Cela nous laisse le temps de préparer la publication et de vous alerter en cas de problème technique.',
    keywords: ['délai', 'temps', 'valider', 'deadline'],
  },
  {
    id: 'faq-5',
    category: 'validation',
    question: 'Puis-je refuser une proposition de publication ?',
    answer: 'Absolument. Vous êtes libre d\'accepter, modifier ou refuser toute proposition. Si vous refusez régulièrement certains types de contenus, nous en tiendrons compte pour affiner nos futures propositions.',
    keywords: ['refuser', 'rejeter', 'supprimer', 'non'],
  },
  {
    id: 'faq-6',
    category: 'validation',
    question: 'La validation automatique, comment ça fonctionne ?',
    answer: 'La validation automatique vous permet de définir un délai (24h, 48h, 72h) après lequel une publication en attente est automatiquement validée. Cette option est désactivable à tout moment dans vos paramètres.',
    keywords: ['automatique', 'auto', 'validation', 'délai'],
  },
  // Éditorial
  {
    id: 'faq-7',
    category: 'editorial',
    question: 'Quelles sont les règles déontologiques à respecter ?',
    answer: 'En tant qu\'avocat, vous êtes soumis aux règles du RIN et de votre barreau. Nous veillons à ce que nos propositions respectent ces obligations : pas de publicité comparative, pas de sollicitation directe, ton professionnel et mesuré.',
    keywords: ['déontologie', 'règles', 'avocat', 'barreau', 'RIN'],
  },
  {
    id: 'faq-8',
    category: 'editorial',
    question: 'Puis-je publier sur des affaires en cours ?',
    answer: 'Non. Le secret professionnel et le respect de la vie privée de vos clients vous interdisent de communiquer sur des dossiers en cours. Nos propositions portent uniquement sur des sujets généraux et d\'actualité.',
    keywords: ['affaire', 'dossier', 'client', 'secret', 'confidentialité'],
  },
  {
    id: 'faq-9',
    category: 'editorial',
    question: 'Comment adapter le ton à mon image ?',
    answer: 'Lors de votre onboarding, nous définissons ensemble votre positionnement et votre ton éditorial. Vous pouvez le modifier à tout moment dans vos paramètres ou en discutant avec votre community manager.',
    keywords: ['ton', 'style', 'image', 'personnalisation', 'branding'],
  },
  // Réseaux sociaux
  {
    id: 'faq-10',
    category: 'social',
    question: 'Quels réseaux sociaux sont pris en charge ?',
    answer: 'SocialPulse prend en charge LinkedIn (recommandé pour les avocats), Instagram, Facebook et Twitter/X. Nous adaptons le format et le ton de chaque publication au réseau concerné.',
    keywords: ['réseaux', 'LinkedIn', 'Instagram', 'Facebook', 'Twitter'],
  },
  {
    id: 'faq-11',
    category: 'social',
    question: 'Puis-je publier le même contenu sur plusieurs réseaux ?',
    answer: 'Oui, mais nous vous recommandons d\'adapter le message à chaque plateforme. Un même sujet peut être traité de façon plus formelle sur LinkedIn et plus visuelle sur Instagram.',
    keywords: ['multicanal', 'plusieurs', 'réseaux', 'dupliquer'],
  },
  {
    id: 'faq-12',
    category: 'social',
    question: 'À quelle fréquence dois-je publier ?',
    answer: 'Il n\'y a pas de règle absolue. Pour un avocat, 2 à 3 publications par semaine sur LinkedIn suffisent généralement à maintenir une présence visible et professionnelle.',
    keywords: ['fréquence', 'rythme', 'combien', 'publication'],
  },
  // Facturation
  {
    id: 'faq-13',
    category: 'billing',
    question: 'Comment fonctionne la facturation ?',
    answer: 'Votre abonnement est facturé mensuellement. Vous recevez une facture par email au début de chaque période. Le détail de vos factures est disponible dans la section Paramètres > Facturation.',
    keywords: ['facture', 'paiement', 'abonnement', 'prix'],
  },
  {
    id: 'faq-14',
    category: 'billing',
    question: 'Puis-je changer de formule en cours de mois ?',
    answer: 'Oui, vous pouvez upgrader votre formule à tout moment. Le changement sera effectif immédiatement et la différence sera proratisée sur votre prochaine facture.',
    keywords: ['formule', 'plan', 'changer', 'upgrade'],
  },
  {
    id: 'faq-15',
    category: 'billing',
    question: 'Comment résilier mon abonnement ?',
    answer: 'Vous pouvez résilier votre abonnement à tout moment depuis vos paramètres. La résiliation prend effet à la fin de votre période de facturation en cours.',
    keywords: ['résilier', 'annuler', 'arrêter', 'fin'],
  },
];

export const MOCK_CM: CMProfile = {
  id: 'cm-1',
  name: 'Sophie Martin',
  role: 'Community Manager • Spécialiste Avocats',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  isOnline: true,
  responseTime: 'Répond généralement sous 2h',
};

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    subject: 'Ajustement du ton pour LinkedIn',
    reason: 'editorial_advice',
    linkedPublicationId: 'pub-1',
    messages: [
      {
        id: 'msg-1',
        content: 'Bonjour Sophie, j\'aimerais que mes posts LinkedIn soient un peu plus accessibles, moins "corporate". Est-ce possible ?',
        sender: 'user',
        timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 min ago
        read: true,
      },
      {
        id: 'msg-2',
        content: 'Bonjour Maître ! Excellente idée, un ton plus humain génère souvent plus d\'engagement. Je vais adapter les prochaines propositions en ce sens. Voulez-vous que je révise aussi les posts déjà programmés ?',
        sender: 'cm',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
        read: true,
      },
      {
        id: 'msg-3',
        content: 'Ce serait parfait, merci beaucoup pour votre réactivité !',
        sender: 'user',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
        read: true,
      },
    ],
    status: 'open',
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
  },
  {
    id: 'conv-2',
    subject: 'Question sur les statistiques Instagram',
    reason: 'post_question',
    messages: [
      {
        id: 'msg-4',
        content: 'J\'ai remarqué que mon dernier post Instagram a eu beaucoup moins de vues que d\'habitude. Y a-t-il une explication ?',
        sender: 'user',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        read: true,
      },
      {
        id: 'msg-5',
        content: 'C\'est normal, les publications du week-end ont souvent moins de visibilité. L\'algorithme Instagram favorise les posts publiés en semaine entre 10h et 12h. Je vous propose de reprogrammer vos prochaines publications sur ces créneaux.',
        sender: 'cm',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000),
        read: true,
      },
    ],
    status: 'closed',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

export const CONTACT_REASONS: Record<ContactReason, { label: string; description: string }> = {
  post_question: {
    label: 'Question sur un post',
    description: 'Vous avez une question concernant une publication spécifique',
  },
  editorial_advice: {
    label: 'Conseil éditorial',
    description: 'Vous souhaitez des recommandations sur votre stratégie de contenu',
  },
  complaint: {
    label: 'Réclamation',
    description: 'Vous rencontrez un problème avec notre service',
  },
  billing: {
    label: 'Facturation',
    description: 'Question concernant votre abonnement ou vos factures',
  },
  other: {
    label: 'Autre',
    description: 'Toute autre demande',
  },
};

export const APPOINTMENT_TYPES: AppointmentType[] = [
  {
    id: 'call',
    label: 'Appel téléphonique',
    description: 'Un échange vocal avec votre CM',
    duration: '30 min',
    icon: 'Phone',
  },
  {
    id: 'video',
    label: 'Visioconférence',
    description: 'Un échange en visio pour plus de proximité',
    duration: '30 min',
    icon: 'Video',
  },
  {
    id: 'chat',
    label: 'Session chat',
    description: 'Un échange écrit en temps réel',
    duration: '15 min',
    icon: 'MessageSquare',
  },
];

// Générer des créneaux simulés pour les 7 prochains jours
export const generateMockSlots = (): AppointmentSlot[] => {
  const slots: AppointmentSlot[] = [];
  const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  
  for (let day = 1; day <= 7; day++) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    times.forEach((time, index) => {
      slots.push({
        id: `slot-${day}-${index}`,
        date,
        time,
        duration: '30 min',
        available: Math.random() > 0.3, // 70% availability
      });
    });
  }
  
  return slots;
};

// Helper functions
export function searchFAQ(query: string): FAQItem[] {
  if (!query.trim()) return MOCK_FAQ;
  
  const lowerQuery = query.toLowerCase();
  return MOCK_FAQ.filter(item => 
    item.question.toLowerCase().includes(lowerQuery) ||
    item.answer.toLowerCase().includes(lowerQuery) ||
    item.keywords.some(kw => kw.toLowerCase().includes(lowerQuery))
  );
}

export function getFAQByCategory(category: FAQCategory): FAQItem[] {
  return MOCK_FAQ.filter(item => item.category === category);
}

export function getReasonLabel(reason: ContactReason): string {
  return CONTACT_REASONS[reason].label;
}
