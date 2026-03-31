import { addDays, format } from "date-fns";

export type PostStatus = "generated" | "cm_validation" | "lawyer_validation" | "scheduled" | "published";
export type PostPriority = "routine" | "important" | "strategique";
export type PostNetwork = "linkedin" | "instagram" | "facebook" | "twitter";

export interface GeneratedPost {
  id: string;
  cabinet_name: string;
  lawyer_name: string;
  specialty: string;
  text_content: string;
  image_url: string;
  network: PostNetwork;
  scheduled_date: string;
  priority: PostPriority;
  status: PostStatus;
}

const today = new Date();

export const mockGeneratedPosts: GeneratedPost[] = [
  {
    id: "gp-001",
    cabinet_name: "Cabinet Roux Avocats",
    lawyer_name: "Me Roux",
    specialty: "Droit commercial",
    text_content:
      "⚖️ Renouvellement de bail commercial : 3 erreurs fréquentes qui coûtent cher.\n\n1️⃣ Ne pas respecter le délai de 6 mois avant l'expiration\n2️⃣ Omettre la révision du loyer indexé\n3️⃣ Ignorer les clauses résolutoires\n\nUn accompagnement juridique en amont peut vous éviter des litiges coûteux.\n\n#BailCommercial #DroitDesAffaires #Avocat",
    image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop",
    network: "linkedin",
    scheduled_date: format(addDays(today, 2), "yyyy-MM-dd"),
    priority: "important",
    status: "cm_validation",
  },
  {
    id: "gp-002",
    cabinet_name: "Cabinet Roux Avocats",
    lawyer_name: "Me Roux",
    specialty: "Droit du travail",
    text_content:
      "🔍 Licenciement pour faute grave : la Cour de cassation précise les contours.\n\nUn arrêt récent rappelle que l'employeur doit agir dans un délai restreint après la découverte des faits. L'absence de mise à pied conservatoire peut remettre en cause la qualification de faute grave.\n\nConseil : documentez chaque étape de la procédure disciplinaire.\n\n#DroitDuTravail #Licenciement #Jurisprudence",
    image_url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=400&fit=crop",
    network: "facebook",
    scheduled_date: format(addDays(today, 3), "yyyy-MM-dd"),
    priority: "strategique",
    status: "cm_validation",
  },
  {
    id: "gp-003",
    cabinet_name: "Cabinet Roux Avocats",
    lawyer_name: "Me Duval",
    specialty: "Droit commercial",
    text_content:
      "🏪 Vous envisagez de céder votre fonds de commerce ?\n\nLa cession d'un fonds de commerce est une opération complexe qui nécessite de respecter un formalisme strict :\n\n📝 Acte de cession avec mentions obligatoires\n📰 Publicité légale dans un JAL\n💰 Séquestre du prix pendant le délai d'opposition\n⏱️ Respect du droit de préemption communal\n\n#CessionFondsDeCommerce #DroitCommercial",
    image_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop",
    network: "linkedin",
    scheduled_date: format(addDays(today, 3), "yyyy-MM-dd"),
    priority: "routine",
    status: "cm_validation",
  },
  {
    id: "gp-004",
    cabinet_name: "Cabinet Morin & Associés",
    lawyer_name: "Me Morin",
    specialty: "Droit fiscal",
    text_content:
      "📋 Contrôle fiscal en vue ? Voici les 5 réflexes à adopter immédiatement :\n\n✅ Rassemblez vos pièces comptables des 3 dernières années\n✅ Vérifiez la cohérence de vos déclarations de TVA\n✅ Préparez un dossier de prix de transfert si applicable\n✅ Identifiez les points de vigilance en amont\n✅ Faites-vous accompagner dès la réception de l'avis de vérification\n\n#ControleFiscal #DroitFiscal #Avocat",
    image_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=400&fit=crop",
    network: "linkedin",
    scheduled_date: format(addDays(today, 1), "yyyy-MM-dd"),
    priority: "important",
    status: "cm_validation",
  },
  {
    id: "gp-005",
    cabinet_name: "Cabinet Morin & Associés",
    lawyer_name: "Me Morin",
    specialty: "Droit des sociétés",
    text_content:
      "⚠️ Dirigeants : connaissez-vous votre exposition personnelle ?\n\nEn cas de liquidation judiciaire, le dirigeant peut être tenu responsable sur son patrimoine personnel si une faute de gestion est caractérisée.\n\nExemples de fautes :\n• Poursuite d'une activité déficitaire\n• Absence de déclaration de cessation de paiements dans les 45 jours\n• Comptabilité irrégulière\n\n#ResponsabilitéDirigeant #DroitDesSociétés",
    image_url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=400&fit=crop",
    network: "instagram",
    scheduled_date: format(addDays(today, 4), "yyyy-MM-dd"),
    priority: "strategique",
    status: "cm_validation",
  },
  {
    id: "gp-006",
    cabinet_name: "Cabinet Morin & Associés",
    lawyer_name: "Me Bernard",
    specialty: "Droit du travail",
    text_content:
      "🤝 Rupture conventionnelle : ne signez pas sans connaître vos droits !\n\nPoints essentiels à négocier :\n\n💶 Indemnité supra-légale\n📅 Date de fin de contrat\n🏖️ Solde de congés payés\n📋 Clause de non-concurrence\n⏰ Délai de rétractation de 15 jours calendaires\n\nFaites-vous accompagner pour maximiser vos droits.\n\n#RuptureConventionnelle #DroitDuTravail #Négociation",
    image_url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=400&fit=crop",
    network: "facebook",
    scheduled_date: format(addDays(today, 1), "yyyy-MM-dd"),
    priority: "important",
    status: "cm_validation",
  },
  {
    id: "gp-007",
    cabinet_name: "Themis Avocats",
    lawyer_name: "Me Laurent",
    specialty: "Droit de la famille",
    text_content:
      "👨‍👩‍👧 Garde alternée : le juge tranche toujours dans l'intérêt supérieur de l'enfant.\n\nCritères pris en compte :\n📍 Proximité des domiciles parentaux\n🏫 Stabilité scolaire\n💬 Capacité de communication entre les parents\n🧒 Âge et souhait de l'enfant\n\nChaque situation est unique. Un avocat spécialisé peut vous accompagner.\n\n#DroitDeLaFamille #GardeAlternée #Avocat",
    image_url: "https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?w=400&h=400&fit=crop",
    network: "instagram",
    scheduled_date: format(addDays(today, 2), "yyyy-MM-dd"),
    priority: "routine",
    status: "lawyer_validation",
  },
  {
    id: "gp-008",
    cabinet_name: "Themis Avocats",
    lawyer_name: "Me Laurent",
    specialty: "Droit numérique",
    text_content:
      "🔐 RGPD : votre entreprise est-elle vraiment en conformité ?\n\nMême les petites structures doivent respecter le RGPD. Les sanctions de la CNIL peuvent atteindre 4% du chiffre d'affaires.\n\nÉtapes clés :\n1. Cartographier vos traitements de données\n2. Mettre à jour vos mentions légales\n3. Sécuriser le consentement\n4. Désigner un DPO si nécessaire\n\n#RGPD #ProtectionDesDonnées #Conformité",
    image_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=400&fit=crop",
    network: "linkedin",
    scheduled_date: format(addDays(today, 5), "yyyy-MM-dd"),
    priority: "important",
    status: "cm_validation",
  },
  {
    id: "gp-009",
    cabinet_name: "Themis Avocats",
    lawyer_name: "Me Petit",
    specialty: "Droit immobilier",
    text_content:
      "🏠 Vice caché après l'achat d'un bien immobilier ? Vos recours existent.\n\nPour agir, vous devez prouver que :\n• Le défaut existait avant la vente\n• Il rend le bien impropre à l'usage\n• Il était indécelable lors de la visite\n\nDélai d'action : 2 ans à compter de la découverte du vice.\n\nN'attendez pas pour faire constater les désordres par un expert.\n\n#ViceCaché #DroitImmobilier #Recours",
    image_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=400&fit=crop",
    network: "facebook",
    scheduled_date: format(addDays(today, 6), "yyyy-MM-dd"),
    priority: "strategique",
    status: "cm_validation",
  },
  {
    id: "gp-010",
    cabinet_name: "Cabinet Roux Avocats",
    lawyer_name: "Me Roux",
    specialty: "Droit du travail",
    text_content:
      "🚨 Harcèlement moral au travail : l'employeur a une obligation de prévention.\n\nL'article L.1152-4 du Code du travail impose à l'employeur de prendre toutes les mesures nécessaires pour prévenir les agissements de harcèlement moral.\n\nEn cas de manquement :\n❌ Responsabilité civile de l'employeur\n❌ Nullité du licenciement du salarié victime\n❌ Dommages et intérêts\n\n#HarcèlementMoral #DroitDuTravail #Prévention",
    image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop",
    network: "linkedin",
    scheduled_date: format(addDays(today, 4), "yyyy-MM-dd"),
    priority: "important",
    status: "scheduled",
  },
];

// Helper: unique cabinet names from mock data
export const mockCabinetNames = [...new Set(mockGeneratedPosts.map(p => p.cabinet_name))];
