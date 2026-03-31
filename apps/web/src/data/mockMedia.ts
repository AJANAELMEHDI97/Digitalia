export interface MediaItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  thematic: 'travail' | 'penal' | 'famille' | 'numerique' | 'immobilier' | 'commercial' | 'general';
  contentTypes: ('post' | 'article')[];
  platforms: ('linkedin' | 'instagram' | 'facebook' | 'twitter')[];
  status: 'validated';
  usageCount: number;
  lastUsedAt: string | null;
  usageHistory: {
    type: 'post' | 'article';
    title: string;
    date: string;
  }[];
  createdAt: string;
}

export const THEMATIC_LABELS: Record<MediaItem['thematic'], string> = {
  travail: 'Droit du travail',
  penal: 'Droit pénal',
  famille: 'Droit de la famille',
  numerique: 'Droit du numérique',
  immobilier: 'Droit immobilier',
  commercial: 'Droit commercial',
  general: 'Général',
};

export const MOCK_MEDIA: MediaItem[] = [
  {
    id: '1',
    title: 'Balance de la justice',
    description: 'Visuel institutionnel représentant la balance de la justice, idéal pour les communications générales sur le droit.',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=600&fit=crop',
    thematic: 'general',
    contentTypes: ['post', 'article'],
    platforms: ['linkedin', 'instagram', 'facebook'],
    status: 'validated',
    usageCount: 12,
    lastUsedAt: '2025-01-10',
    usageHistory: [
      { type: 'post', title: 'Les fondamentaux du droit', date: '2025-01-10' },
      { type: 'article', title: 'Introduction au système juridique', date: '2025-01-05' },
    ],
    createdAt: '2024-12-01',
  },
  {
    id: '2',
    title: 'Contrat et signature',
    description: 'Visuel sobre de signature de contrat, parfait pour les publications sur le droit commercial et les accords professionnels.',
    imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop',
    thematic: 'commercial',
    contentTypes: ['post', 'article'],
    platforms: ['linkedin', 'facebook'],
    status: 'validated',
    usageCount: 8,
    lastUsedAt: '2025-01-08',
    usageHistory: [
      { type: 'post', title: 'Négociation contractuelle', date: '2025-01-08' },
    ],
    createdAt: '2024-11-15',
  },
  {
    id: '3',
    title: 'Code du travail',
    description: 'Représentation visuelle du code du travail avec documents juridiques, adapté aux publications sur le droit social.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
    thematic: 'travail',
    contentTypes: ['post', 'article'],
    platforms: ['linkedin', 'instagram'],
    status: 'validated',
    usageCount: 15,
    lastUsedAt: '2025-01-12',
    usageHistory: [
      { type: 'post', title: 'Réforme du code du travail', date: '2025-01-12' },
      { type: 'article', title: 'Droits des salariés en 2025', date: '2025-01-06' },
    ],
    createdAt: '2024-10-20',
  },
  {
    id: '4',
    title: 'Protection des données',
    description: 'Visuel moderne sur la cybersécurité et la protection des données personnelles, idéal pour le droit du numérique.',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
    thematic: 'numerique',
    contentTypes: ['post', 'article'],
    platforms: ['linkedin', 'twitter', 'instagram'],
    status: 'validated',
    usageCount: 6,
    lastUsedAt: '2025-01-05',
    usageHistory: [
      { type: 'post', title: 'RGPD : les essentiels', date: '2025-01-05' },
    ],
    createdAt: '2024-12-10',
  },
  {
    id: '5',
    title: 'Famille et protection',
    description: 'Visuel chaleureux évoquant la protection familiale, adapté aux publications sur le droit de la famille.',
    imageUrl: 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=800&h=600&fit=crop',
    thematic: 'famille',
    contentTypes: ['post', 'article'],
    platforms: ['linkedin', 'facebook', 'instagram'],
    status: 'validated',
    usageCount: 9,
    lastUsedAt: '2025-01-09',
    usageHistory: [
      { type: 'article', title: 'Guide de la garde alternée', date: '2025-01-09' },
    ],
    createdAt: '2024-11-25',
  },
  {
    id: '6',
    title: 'Palais de justice',
    description: 'Façade institutionnelle du palais de justice, visuel solennel pour les communications officielles.',
    imageUrl: 'https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=800&h=600&fit=crop',
    thematic: 'penal',
    contentTypes: ['post', 'article'],
    platforms: ['linkedin', 'facebook'],
    status: 'validated',
    usageCount: 4,
    lastUsedAt: '2025-01-03',
    usageHistory: [],
    createdAt: '2024-12-05',
  },
  {
    id: '7',
    title: 'Clés et immobilier',
    description: 'Visuel professionnel avec clés et documents, parfait pour les publications sur les transactions immobilières.',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
    thematic: 'immobilier',
    contentTypes: ['post', 'article'],
    platforms: ['linkedin', 'instagram', 'facebook'],
    status: 'validated',
    usageCount: 7,
    lastUsedAt: '2025-01-11',
    usageHistory: [
      { type: 'post', title: 'Vente immobilière : étapes clés', date: '2025-01-11' },
    ],
    createdAt: '2024-11-10',
  },
  {
    id: '8',
    title: 'Réunion professionnelle',
    description: 'Scène de réunion d\'affaires sobre et professionnelle, idéale pour les sujets de négociation et médiation.',
    imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop',
    thematic: 'commercial',
    contentTypes: ['post'],
    platforms: ['linkedin'],
    status: 'validated',
    usageCount: 3,
    lastUsedAt: null,
    usageHistory: [],
    createdAt: '2024-12-20',
  },
];
