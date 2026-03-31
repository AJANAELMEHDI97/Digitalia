import { supabase } from "@/integrations/supabase/client";

// Données fictives pour les cabinets d'avocats
const lawFirmData = [
  { name: "Cabinet Durand & Associés", specialization: "Droit du travail", city: "Paris", postal_code: "75008", bar_association: "Barreau de Paris" },
  { name: "Lexia Conseil", specialization: "Droit des affaires", city: "Lyon", postal_code: "69002", bar_association: "Barreau de Lyon" },
  { name: "Cabinet Martin-Leblanc", specialization: "Droit de la famille", city: "Marseille", postal_code: "13001", bar_association: "Barreau de Marseille" },
  { name: "Avocats Réunis du Sud", specialization: "Droit pénal", city: "Toulouse", postal_code: "31000", bar_association: "Barreau de Toulouse" },
  { name: "Cabinet Moreau & Fils", specialization: "Droit fiscal", city: "Bordeaux", postal_code: "33000", bar_association: "Barreau de Bordeaux" },
  { name: "Juris Atlantique", specialization: "Droit immobilier", city: "Nantes", postal_code: "44000", bar_association: "Barreau de Nantes" },
  { name: "Cabinet Sophie Bertrand", specialization: "Droit social", city: "Lille", postal_code: "59000", bar_association: "Barreau de Lille" },
  { name: "Themis Avocats", specialization: "Propriété intellectuelle", city: "Strasbourg", postal_code: "67000", bar_association: "Barreau de Strasbourg" },
  { name: "Cabinet Lefèvre & Partners", specialization: "Droit bancaire", city: "Nice", postal_code: "06000", bar_association: "Barreau de Nice" },
  { name: "Droit & Patrimoine Conseil", specialization: "Droit patrimonial", city: "Montpellier", postal_code: "34000", bar_association: "Barreau de Montpellier" },
  { name: "Cabinet Jean-Pierre Roux", specialization: "Droit commercial", city: "Rennes", postal_code: "35000", bar_association: "Barreau de Rennes" },
  { name: "Avocats de l'Est", specialization: "Droit de l'environnement", city: "Dijon", postal_code: "21000", bar_association: "Barreau de Dijon" },
  { name: "Cabinet Claire Dupont", specialization: "Droit de la santé", city: "Grenoble", postal_code: "38000", bar_association: "Barreau de Grenoble" },
  { name: "Juridica Lyon", specialization: "Droit des sociétés", city: "Lyon", postal_code: "69003", bar_association: "Barreau de Lyon" },
  { name: "Cabinet Mercier Avocats", specialization: "Droit de la construction", city: "Toulon", postal_code: "83000", bar_association: "Barreau de Toulon" },
  { name: "SCP Laurent & Associés", specialization: "Droit des contrats", city: "Angers", postal_code: "49000", bar_association: "Barreau d'Angers" },
  { name: "Cabinet Gauthier", specialization: "Droit de la consommation", city: "Tours", postal_code: "37000", bar_association: "Barreau de Tours" },
  { name: "Avocats des Alpes", specialization: "Droit rural", city: "Chambéry", postal_code: "73000", bar_association: "Barreau de Chambéry" },
  { name: "Cabinet Marie-Anne Petit", specialization: "Droit des étrangers", city: "Rouen", postal_code: "76000", bar_association: "Barreau de Rouen" },
  { name: "Justitia Avocats", specialization: "Droit administratif", city: "Caen", postal_code: "14000", bar_association: "Barreau de Caen" },
  { name: "Cabinet François Legal", specialization: "Droit numérique", city: "Paris", postal_code: "75009", bar_association: "Barreau de Paris" },
  { name: "SCP Girard-Blanc", specialization: "Droit sportif", city: "Marseille", postal_code: "13008", bar_association: "Barreau de Marseille" },
  { name: "Cabinet Hélène Morin", specialization: "Droit de la presse", city: "Paris", postal_code: "75002", bar_association: "Barreau de Paris" },
  { name: "Avocats Méditerranée", specialization: "Droit maritime", city: "Nice", postal_code: "06300", bar_association: "Barreau de Nice" },
  { name: "Cabinet Pierre & Associés", specialization: "Droit européen", city: "Strasbourg", postal_code: "67100", bar_association: "Barreau de Strasbourg" },
];

// Contenus fictifs pour les publications
const postTemplates = [
  // Droit du travail
  { title: "Licenciement pour faute grave : les essentiels", content: "Comprendre les critères qui caractérisent une faute grave et les conséquences pour le salarié. Un point juridique essentiel pour anticiper et gérer ces situations délicates.", platform: "linkedin" },
  { title: "Télétravail : vos droits en 2024", content: "Le télétravail s'est généralisé mais connaissez-vous vraiment vos droits ? Tour d'horizon des obligations de l'employeur et des droits du salarié.", platform: "linkedin" },
  { title: "Rupture conventionnelle : mode d'emploi", content: "La rupture conventionnelle permet une séparation à l'amiable entre employeur et salarié. Découvrez les étapes clés de cette procédure.", platform: "facebook" },
  
  // Droit des affaires
  { title: "Création d'entreprise : les pièges à éviter", content: "Se lancer dans l'entrepreneuriat demande préparation. Voici les erreurs juridiques les plus fréquentes à éviter lors de la création de votre société.", platform: "linkedin" },
  { title: "Transmission d'entreprise : anticiper pour réussir", content: "La transmission d'une entreprise familiale nécessite une préparation minutieuse. Nos conseils pour une transition réussie.", platform: "linkedin" },
  { title: "Contrats commerciaux : les clauses essentielles", content: "Un contrat bien rédigé protège votre activité. Focus sur les clauses indispensables à intégrer dans vos contrats commerciaux.", platform: "google_business" },
  
  // Droit de la famille
  { title: "Divorce par consentement mutuel", content: "Le divorce par consentement mutuel est la procédure la plus rapide. Découvrez les conditions et le déroulement de cette procédure simplifiée.", platform: "facebook" },
  { title: "Garde alternée : organisation pratique", content: "La garde alternée implique une organisation précise. Comment mettre en place ce mode de garde dans l'intérêt de l'enfant.", platform: "linkedin" },
  { title: "Pension alimentaire : calcul et révision", content: "Comment est calculée la pension alimentaire ? Quand peut-on demander une révision ? Réponses à vos questions.", platform: "facebook" },
  
  // Droit pénal
  { title: "Garde à vue : connaître ses droits", content: "En cas de garde à vue, certains droits fondamentaux vous protègent. L'essentiel à savoir pour faire valoir vos droits.", platform: "linkedin" },
  { title: "Plainte ou main courante : que choisir ?", content: "Victime d'une infraction ? Comprendre la différence entre plainte et main courante pour faire le bon choix.", platform: "facebook" },
  
  // Droit fiscal
  { title: "Optimisation fiscale légale : nos conseils", content: "Réduire légalement sa charge fiscale est possible. Découvrez les dispositifs en vigueur pour optimiser votre situation.", platform: "linkedin" },
  { title: "Contrôle fiscal : comment s'y préparer", content: "Un contrôle fiscal peut être stressant. Voici comment vous y préparer et quels documents rassembler.", platform: "google_business" },
  
  // Droit immobilier
  { title: "Achat immobilier : les étapes clés", content: "De la recherche du bien à la signature chez le notaire, les étapes essentielles d'un achat immobilier réussi.", platform: "facebook" },
  { title: "Troubles du voisinage : que faire ?", content: "Nuisances sonores, haies mal entretenues... Comment régler les conflits de voisinage de manière amiable ou judiciaire.", platform: "linkedin" },
  { title: "Bail commercial : points de vigilance", content: "La négociation d'un bail commercial demande attention. Les clauses à surveiller avant de signer.", platform: "linkedin" },
  
  // Générique
  { title: "Médiation : une alternative au procès", content: "La médiation permet de résoudre de nombreux litiges sans passer par le tribunal. Découvrez cette solution efficace et rapide.", platform: "linkedin" },
  { title: "Nos permanences juridiques gratuites", content: "Chaque premier mardi du mois, nous proposons des consultations gratuites. Prenez rendez-vous pour poser vos questions juridiques.", platform: "google_business" },
  { title: "Nouveau ! Consultations en visioconférence", content: "Pour faciliter vos démarches, nous proposons désormais des consultations en visioconférence. Contactez-nous pour prendre rendez-vous.", platform: "facebook" },
  { title: "L'importance de l'écrit en droit", content: "Pourquoi un accord verbal ne suffit pas toujours ? L'importance de formaliser vos engagements par écrit.", platform: "linkedin" },
  { title: "Délais de prescription : attention aux dates", content: "En matière juridique, les délais sont cruciaux. Ne laissez pas passer la date limite pour agir.", platform: "linkedin" },
  { title: "Aide juridictionnelle : qui peut en bénéficier ?", content: "L'aide juridictionnelle permet d'accéder à la justice gratuitement. Êtes-vous éligible ? Les conditions détaillées.", platform: "facebook" },
  { title: "Réforme de la justice : ce qui change", content: "Les dernières réformes modifient certaines procédures. Ce qu'il faut retenir des nouveaux textes en vigueur.", platform: "linkedin" },
  { title: "Protection des données personnelles", content: "Le RGPD impose des obligations aux entreprises. Êtes-vous en conformité ? Les points essentiels à vérifier.", platform: "google_business" },
];

const statuses: Array<'brouillon' | 'programme' | 'publie' | 'cm_review'> = ['brouillon', 'programme', 'publie', 'cm_review'];
const platforms: Array<'linkedin' | 'facebook' | 'google_business' | 'instagram'> = ['linkedin', 'facebook', 'google_business', 'instagram'];

function getRandomDate(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

function getRandomTime(): string {
  const hours = Math.floor(Math.random() * 12) + 8; // 8h-20h
  const minutes = Math.random() > 0.5 ? '00' : '30';
  return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function seedCMDemoData(): Promise<{ success: boolean; message: string; stats?: any }> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: "Utilisateur non connecté" };
    }

    console.log("Starting CM demo data seed for user:", user.id);

    // 1. Create law firms
    const firmsToCreate = lawFirmData.map(firm => ({
      name: firm.name,
      city: firm.city,
      postal_code: firm.postal_code,
      bar_association: firm.bar_association,
      email: `contact@${firm.name.toLowerCase().replace(/[^a-z]/g, '')}.fr`,
      phone: `0${Math.floor(Math.random() * 9) + 1} ${String(Math.floor(Math.random() * 100)).padStart(2, '0')} ${String(Math.floor(Math.random() * 100)).padStart(2, '0')} ${String(Math.floor(Math.random() * 100)).padStart(2, '0')} ${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`,
      is_active: true,
    }));

    const { data: createdFirms, error: firmsError } = await supabase
      .from('law_firms')
      .insert(firmsToCreate)
      .select();

    if (firmsError) {
      console.error("Error creating firms:", firmsError);
      return { success: false, message: `Erreur création cabinets: ${firmsError.message}` };
    }

    console.log(`Created ${createdFirms?.length || 0} law firms`);

    // 2. Create CM assignments for each firm
    const assignmentsToCreate = (createdFirms || []).map(firm => ({
      cm_user_id: user.id,
      lawyer_user_id: user.id, // For demo, CM is also the lawyer
      law_firm_id: firm.id,
      is_active: true,
    }));

    const { error: assignmentsError } = await supabase
      .from('cm_assignments')
      .insert(assignmentsToCreate);

    if (assignmentsError) {
      console.error("Error creating assignments:", assignmentsError);
      // Continue anyway - we can still create publications
    } else {
      console.log(`Created ${assignmentsToCreate.length} CM assignments`);
    }

    // 3. Create publications for each firm
    let totalPublications = 0;
    const allPublications: any[] = [];

    for (const firm of createdFirms || []) {
      // 5 to 12 posts per firm
      const numPosts = Math.floor(Math.random() * 8) + 5;
      const shuffledTemplates = shuffleArray(postTemplates);
      
      for (let i = 0; i < numPosts; i++) {
        const template = shuffledTemplates[i % shuffledTemplates.length];
        const statusChoice = getRandomItem(statuses);
        
        // Determine actual DB status and validation_status
        const isCMReview = statusChoice === 'cm_review';
        const actualStatus = isCMReview ? 'brouillon' : statusChoice;
        const validationStatus = isCMReview ? 'cm_review' : null;
        
        // Date logic based on status
        let scheduledDate: string;
        if (actualStatus === 'publie') {
          scheduledDate = getRandomDate(-Math.floor(Math.random() * 60) - 1);
        } else if (actualStatus === 'programme') {
          scheduledDate = getRandomDate(Math.floor(Math.random() * 30) + 1);
        } else {
          scheduledDate = getRandomDate(Math.floor(Math.random() * 14) + 1);
        }

        allPublications.push({
          user_id: user.id,
          law_firm_id: firm.id,
          title: template.title,
          content: `${template.content}\n\n#${firm.name.replace(/[^a-zA-Z]/g, '')} #Avocat #Droit`,
          platform: template.platform as any,
          status: actualStatus as any,
          validation_status: validationStatus as any,
          scheduled_date: scheduledDate,
          scheduled_time: getRandomTime(),
          source: 'socialpulse' as const,
          published_at: actualStatus === 'publie' ? `${scheduledDate}T10:00:00Z` : null,
        });

        totalPublications++;
      }
    }

    // Insert publications in batches
    const batchSize = 50;
    for (let i = 0; i < allPublications.length; i += batchSize) {
      const batch = allPublications.slice(i, i + batchSize);
      const { error: pubsError } = await supabase
        .from('publications')
        .insert(batch);

      if (pubsError) {
        console.error("Error creating publications batch:", pubsError);
      }
    }

    console.log(`Created ${totalPublications} publications`);

    return {
      success: true,
      message: "Données de démonstration créées avec succès !",
      stats: {
        firms: createdFirms?.length || 0,
        publications: totalPublications,
      }
    };

  } catch (error) {
    console.error("Seed error:", error);
    return { success: false, message: `Erreur: ${error}` };
  }
}

export async function clearCMDemoData(): Promise<{ success: boolean; message: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: "Utilisateur non connecté" };
    }

    // Get firm IDs assigned to this CM
    const { data: assignments } = await supabase
      .from('cm_assignments')
      .select('law_firm_id')
      .eq('cm_user_id', user.id);

    const firmIds = (assignments || []).map(a => a.law_firm_id).filter(Boolean);

    if (firmIds.length > 0) {
      // Delete publications for these firms
      await supabase
        .from('publications')
        .delete()
        .in('law_firm_id', firmIds);

      // Delete assignments
      await supabase
        .from('cm_assignments')
        .delete()
        .eq('cm_user_id', user.id);

      // Delete firms (only those created for demo)
      await supabase
        .from('law_firms')
        .delete()
        .in('id', firmIds);
    }

    return { success: true, message: "Données de démonstration supprimées" };
  } catch (error) {
    return { success: false, message: `Erreur: ${error}` };
  }
}
