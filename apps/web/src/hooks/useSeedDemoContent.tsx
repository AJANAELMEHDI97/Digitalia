import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { format, addDays } from "date-fns";

// Publications à valider (statut a_valider) - proposées par SocialPulse
const PENDING_PUBLICATIONS = [
  {
    content: "📚 Le saviez-vous ? En droit français, le délai de prescription de droit commun est de 5 ans. Ce délai court à compter du jour où le titulaire du droit a connu ou aurait dû connaître les faits lui permettant de l'exercer. Une règle essentielle à garder en tête !",
    image_url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
    days_offset: 1,
    platform: "linkedin" as const,
    source: "socialpulse" as const,
  },
  {
    content: "⚖️ Accès au droit : Saviez-vous que vous pouvez bénéficier d'une consultation juridique gratuite dans les Maisons de la Justice et du Droit ? Un service public précieux pour tous les citoyens.",
    image_url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    days_offset: 2,
    platform: "linkedin" as const,
    source: "socialpulse" as const,
  },
  {
    content: "🏛️ La médiation : une alternative efficace au contentieux. Moins coûteuse, plus rapide et souvent plus satisfaisante pour les parties. #DroitDesAffaires #Médiation",
    image_url: "https://images.unsplash.com/photo-1521791055366-0d553872125f?w=800&q=80",
    days_offset: 3,
    platform: "instagram" as const,
    source: "socialpulse" as const,
  },
  {
    content: "🔒 Protection des données : Le RGPD vous confère des droits essentiels. Une question sur vos droits ? N'hésitez pas à consulter.",
    image_url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
    days_offset: 4,
    platform: "twitter" as const,
    source: "socialpulse" as const,
  },
];

// Publications programmées (déjà validées)
const SCHEDULED_PUBLICATIONS = [
  {
    content: "📝 Rappel important : Tout contrat doit respecter les conditions essentielles de validité : consentement, capacité, contenu licite et certain. Un contrat qui ne respecte pas ces conditions peut être annulé.",
    image_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80",
    days_offset: 5,
    platform: "linkedin" as const,
    source: "manual" as const,
  },
  {
    content: "👔 Les droits des salariés : En cas de licenciement, l'employeur doit respecter une procédure stricte. Le non-respect peut entraîner des indemnités significatives.",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    days_offset: 7,
    platform: "linkedin" as const,
    source: "socialpulse" as const,
  },
];

// Brouillons (en cours de rédaction)
const DRAFT_PUBLICATIONS = [
  {
    content: "💼 Nouvelle réforme du droit des successions : les points clés à retenir pour vos clients...",
    image_url: null,
    days_offset: 0,
    platform: "linkedin" as const,
    source: "manual" as const,
  },
];

// Articles de blog - 25 articles couvrant diverses thématiques juridiques
const BLOG_ARTICLES = [
  // === DROIT DU TRAVAIL ===
  {
    title: "Licenciement économique : vos droits en tant que salarié",
    content: `Face à un licenciement économique, il est essentiel de connaître vos droits pour vous assurer que la procédure est respectée et obtenir les meilleures conditions de départ.

**Définition du licenciement économique**
C'est un licenciement effectué pour un motif non inhérent à la personne du salarié : difficultés économiques, mutations technologiques, réorganisation, cessation d'activité.

**La procédure obligatoire**
L'employeur doit respecter plusieurs étapes :
- Recherche de reclassement interne
- Consultation des représentants du personnel
- Entretien préalable
- Notification motivée du licenciement

**Vos indemnités**
- Indemnité légale ou conventionnelle de licenciement
- Indemnité compensatrice de préavis
- Indemnité compensatrice de congés payés
- Eventuellement : supra-légal négocié

**Le contrat de sécurisation professionnelle (CSP)**
Dans les entreprises de moins de 1000 salariés, vous avez droit au CSP qui offre un accompagnement renforcé vers le retour à l'emploi.

**Que faire si vous contestez ?**
Vous disposez de 12 mois pour saisir le Conseil de prud'hommes si vous estimez que le licenciement est abusif.`,
    image_url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80",
    days_offset: -5,
    status: "programme" as const,
    source: "socialpulse" as const,
  },
  {
    title: "Télétravail : le nouveau cadre juridique en 2025",
    content: `Le télétravail s'est imposé durablement dans le paysage professionnel français. Quelles sont les règles actuelles et les droits des salariés ?

**Le cadre légal du télétravail**
Le télétravail est défini par le Code du travail comme toute forme d'organisation du travail utilisant les technologies de l'information, dans laquelle un travail qui aurait pu être exécuté dans les locaux de l'employeur est effectué hors de ces locaux.

**Mise en place du télétravail**
Le télétravail peut être mis en place par :
- Un accord collectif
- Une charte élaborée par l'employeur
- Un simple accord entre l'employeur et le salarié

**Les obligations de l'employeur**
- Prise en charge des coûts liés au télétravail
- Respect du droit à la déconnexion
- Garantie de l'égalité de traitement
- Maintien du lien avec la communauté de travail

**Les droits du télétravailleur**
Le télétravailleur bénéficie des mêmes droits que les salariés en présentiel : formation, entretiens professionnels, accès aux informations syndicales.

**Accident du travail en télétravail**
Un accident survenu pendant les heures de télétravail est présumé être un accident du travail. Cette présomption peut être renversée par l'employeur.`,
    image_url: "https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=800&q=80",
    days_offset: 3,
    status: "a_valider" as const,
    source: "socialpulse" as const,
  },
  {
    title: "Harcèlement moral au travail : comment le reconnaître et agir",
    content: `Le harcèlement moral au travail est un délit grave qui peut avoir des conséquences dévastatrices sur la santé des victimes. Voici comment l'identifier et s'en défendre.

**Définition juridique**
Le harcèlement moral se caractérise par des agissements répétés ayant pour objet ou effet une dégradation des conditions de travail susceptible de porter atteinte aux droits et à la dignité du salarié, d'altérer sa santé ou de compromettre son avenir professionnel.

**Les comportements caractéristiques**
- Critiques incessantes et injustifiées
- Mise à l'écart et isolement
- Tâches dégradantes ou inadaptées
- Surveillance excessive
- Propos vexatoires ou humiliants

**Comment réagir ?**
1. Documenter les faits (dates, témoins, écrits)
2. Alerter le médecin du travail
3. Signaler à l'employeur ou aux représentants du personnel
4. Saisir l'inspection du travail

**Les recours juridiques**
- Conseil de prud'hommes pour obtenir réparation
- Dépôt de plainte au pénal (2 ans de prison et 30 000€ d'amende)
- Saisine du Défenseur des droits

**L'obligation de l'employeur**
L'employeur a une obligation de prévention et de protection. Sa responsabilité peut être engagée même s'il n'est pas l'auteur des faits.`,
    image_url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
    days_offset: 8,
    status: "a_valider" as const,
    source: "socialpulse" as const,
  },
  {
    title: "Rupture conventionnelle : avantages et précautions",
    content: `La rupture conventionnelle est devenue un mode privilégié de séparation entre employeur et salarié. Mais attention aux pièges !

**Qu'est-ce que la rupture conventionnelle ?**
C'est un mode de rupture amiable du CDI, d'un commun accord entre l'employeur et le salarié. Elle ouvre droit aux allocations chômage.

**Les étapes de la procédure**
1. Un ou plusieurs entretiens obligatoires
2. Signature de la convention
3. Délai de rétractation de 15 jours calendaires
4. Demande d'homologation à la DREETS
5. Délai d'instruction de 15 jours ouvrables

**Le calcul de l'indemnité**
L'indemnité ne peut être inférieure à l'indemnité légale de licenciement. Elle est exonérée de charges sociales et d'impôt dans certaines limites.

**Les précautions à prendre**
- Ne jamais signer sous la pression
- Vérifier le calcul de l'indemnité
- S'assurer de l'ouverture des droits au chômage
- Négocier si possible au-delà du minimum légal

**Quand la refuser ?**
Si vous suspectez que l'employeur cherche à contourner un licenciement, ou si les conditions proposées sont défavorables. Vous n'êtes jamais obligé d'accepter.`,
    image_url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    days_offset: 12,
    status: "programme" as const,
    source: "manual" as const,
  },

  // === DROIT DE LA FAMILLE ===
  {
    title: "Divorce par consentement mutuel : procédure complète et conseils",
    content: `Le divorce par consentement mutuel est la procédure la plus rapide et la moins conflictuelle pour mettre fin à un mariage. Voici tout ce que vous devez savoir.

**Qu'est-ce que le divorce par consentement mutuel ?**
Il s'agit d'un divorce où les deux époux sont d'accord sur le principe de la séparation et sur l'ensemble de ses conséquences : partage des biens, pension alimentaire, garde des enfants, etc.

**Les étapes de la procédure**
1. Consultation de chacun des époux par son propre avocat
2. Rédaction de la convention de divorce
3. Délai de réflexion de 15 jours
4. Signature de la convention
5. Dépôt chez le notaire

**Délais et coûts**
La procédure peut être finalisée en 2 à 3 mois. Les honoraires d'avocat varient généralement entre 1 500 et 3 000 euros par époux.

**Les points de vigilance**
- S'assurer d'un partage équitable des biens
- Anticiper les questions de résidence des enfants
- Prévoir une clause de révision pour la pension alimentaire

**Mon conseil d'avocat**
Même si vous êtes d'accord avec votre conjoint, prenez le temps de bien comprendre chaque clause de la convention. Un divorce est définitif.`,
    image_url: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&q=80",
    days_offset: 5,
    status: "a_valider" as const,
    source: "socialpulse" as const,
  },
  {
    title: "Garde alternée : conditions et organisation pratique",
    content: `La garde alternée, ou résidence alternée, permet à l'enfant de vivre alternativement chez chacun de ses parents. Comment la mettre en place efficacement ?

**Conditions de la garde alternée**
Pour que la garde alternée fonctionne, plusieurs conditions doivent être réunies :
- Proximité géographique des domiciles
- Disponibilité des deux parents
- Capacité à communiquer sur les questions éducatives
- Stabilité du mode de vie

**L'intérêt supérieur de l'enfant**
Le juge aux affaires familiales statue toujours en fonction de l'intérêt de l'enfant. L'âge, les besoins spécifiques et les habitudes de vie sont pris en compte.

**Organisation du temps**
Plusieurs formules existent :
- Une semaine / une semaine
- 2 jours / 2 jours / 3 jours
- Un mois / un mois (plus rare)

**Aspects financiers**
La garde alternée n'exclut pas le versement d'une pension alimentaire si les revenus des parents sont déséquilibrés. Les allocations familiales peuvent être partagées.

**Conseils pour réussir**
- Établir des règles éducatives cohérentes
- Faciliter les transitions pour l'enfant
- Maintenir une communication respectueuse
- Être flexible en cas d'imprévus`,
    image_url: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&q=80",
    days_offset: 15,
    status: "programme" as const,
    source: "socialpulse" as const,
  },
  {
    title: "Pension alimentaire : calcul, révision et impayés",
    content: `La pension alimentaire est une contribution essentielle pour l'entretien et l'éducation des enfants. Voici les règles qui l'encadrent.

**Calcul de la pension alimentaire**
Le montant est fixé en fonction de :
- Les ressources et charges de chaque parent
- Les besoins de l'enfant (âge, santé, scolarité)
- Le mode de garde choisi

**La table de référence**
Le Ministère de la Justice publie une table indicative qui peut servir de base au calcul. Elle prend en compte les revenus et le nombre d'enfants.

**Révision de la pension**
La pension peut être révisée en cas de :
- Changement significatif des revenus
- Modification des besoins de l'enfant
- Changement du mode de garde

**Que faire en cas d'impayés ?**
1. Mise en demeure par courrier recommandé
2. Saisie sur salaire via huissier
3. Procédure de paiement direct par la CAF
4. Plainte pour abandon de famille (délit pénal)

**L'Agence de recouvrement (ARIPA)**
En cas d'impayés, l'ARIPA peut se substituer au parent défaillant et engager les procédures de recouvrement.`,
    image_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80",
    days_offset: 20,
    status: "a_valider" as const,
    source: "socialpulse" as const,
  },

  // === DROIT PÉNAL ===
  {
    title: "Garde à vue : vos droits face à la police",
    content: `La garde à vue est une mesure privative de liberté qui doit être strictement encadrée. Connaître vos droits est essentiel pour vous protéger.

**Durée de la garde à vue**
- 24 heures en droit commun
- Prolongation possible de 24h sur autorisation du procureur
- 96 heures maximum pour certaines infractions (terrorisme, criminalité organisée)

**Vos droits fondamentaux**
Dès le placement en garde à vue, vous avez le droit :
- D'être informé des motifs de votre placement
- De faire prévenir un proche
- D'être examiné par un médecin
- De vous entretenir avec un avocat (30 minutes)
- De garder le silence

**L'assistance de l'avocat**
L'avocat peut assister à tous les interrogatoires et confrontations. Il a accès au dossier de procédure. Si vous n'avez pas d'avocat, un avocat commis d'office vous sera désigné.

**Les auditions**
Vous pouvez refuser de répondre aux questions. Votre silence ne peut pas être retenu contre vous. Lisez attentivement le procès-verbal avant de le signer.

**À la sortie de garde à vue**
Trois issues possibles :
- Libération sans suite
- Convocation ultérieure devant le tribunal
- Comparution immédiate`,
    image_url: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&q=80",
    days_offset: 7,
    status: "programme" as const,
    source: "socialpulse" as const,
  },
  {
    title: "Violences conjugales : les protections juridiques disponibles",
    content: `Les violences conjugales constituent un fléau contre lequel le droit offre de nombreuses protections. Voici les dispositifs à connaître.

**Définition des violences conjugales**
Elles englobent les violences physiques, psychologiques, sexuelles et économiques exercées par un partenaire ou ex-partenaire.

**L'ordonnance de protection**
Délivrée par le juge aux affaires familiales en urgence, elle permet :
- L'éviction du conjoint violent du domicile
- L'interdiction d'approcher la victime
- L'attribution du logement à la victime
- Des mesures sur les enfants

**Le téléphone grave danger**
Attribué aux victimes les plus menacées, il permet d'alerter les forces de l'ordre en cas de danger imminent.

**Le dépôt de plainte**
La plainte peut être déposée au commissariat, à la gendarmerie ou par courrier au procureur. Une association peut vous accompagner.

**Les sanctions pénales**
Les violences conjugales sont des circonstances aggravantes :
- Violences sans ITT : 3 ans de prison
- Violences avec ITT : 5 ans de prison
- Violences ayant entraîné la mort : réclusion criminelle

**Les ressources d'aide**
- 3919 (numéro national)
- Associations locales d'aide aux victimes
- Hébergement d'urgence`,
    image_url: "https://images.unsplash.com/photo-1591522811280-a8759970b03f?w=800&q=80",
    days_offset: 25,
    status: "a_valider" as const,
    source: "socialpulse" as const,
  },

  // === DROIT DES AFFAIRES ===
  {
    title: "Création d'entreprise : les 7 étapes juridiques essentielles",
    content: `Créer son entreprise est une aventure passionnante qui nécessite une préparation juridique rigoureuse. Voici les étapes clés pour partir sur de bonnes bases.

**1. Choisir la forme juridique adaptée**
Auto-entrepreneur, EURL, SARL, SAS... Chaque statut a ses avantages fiscaux et sociaux. Le choix dépend de votre activité, vos revenus prévisionnels et votre situation personnelle.

**2. Rédiger les statuts**
Document fondateur de votre société, les statuts définissent les règles de fonctionnement. Ne négligez pas cette étape, elle conditionne votre liberté de gestion future.

**3. Constituer le capital social**
Le montant minimum varie selon la forme juridique. Pensez à bien documenter les apports de chaque associé.

**4. Domicilier l'entreprise**
Chez vous, en pépinière, en centre d'affaires... L'adresse du siège social a des implications fiscales et pratiques.

**5. Publier l'annonce légale**
Obligation légale pour informer les tiers de la création de votre société.

**6. Immatriculer l'entreprise**
Dépôt du dossier au guichet unique (INPI) pour obtenir votre numéro SIRET.

**7. Souscrire les assurances obligatoires**
RC Pro, mutuelle, prévoyance... Certaines sont obligatoires selon votre activité.

**Conseil d'expert**
Faites-vous accompagner dès le départ. Les erreurs de structure sont coûteuses à corriger par la suite.`,
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    days_offset: 10,
    status: "programme" as const,
    source: "manual" as const,
  },
  {
    title: "Contrats commerciaux : les clauses essentielles à négocier",
    content: `Un contrat commercial bien rédigé protège votre entreprise et sécurise vos relations d'affaires. Voici les clauses à ne jamais négliger.

**L'objet du contrat**
Définissez précisément les prestations ou produits concernés. L'ambiguïté est source de litiges.

**Les conditions de prix et paiement**
- Prix ferme ou révisable
- Échéances de paiement
- Pénalités de retard
- Acomptes éventuels

**La durée et les conditions de résiliation**
- Contrat à durée déterminée ou indéterminée
- Préavis de résiliation
- Causes de résiliation anticipée

**Les clauses de responsabilité**
- Plafonnement des dommages-intérêts
- Exclusion de certaines responsabilités
- Obligations d'assurance

**La clause de confidentialité**
Essentielle pour protéger vos informations stratégiques, elle doit survivre à la fin du contrat.

**La clause attributive de juridiction**
Choisissez le tribunal compétent en cas de litige. Préférez une juridiction proche de votre siège.

**La clause compromissoire**
Alternative au contentieux judiciaire, l'arbitrage peut être plus rapide et confidentiel.

**Conseil pratique**
Ne signez jamais un contrat sans l'avoir lu intégralement et, si besoin, fait relire par un avocat.`,
    image_url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
    days_offset: 18,
    status: "a_valider" as const,
    source: "socialpulse" as const,
  },
  {
    title: "Recouvrement de créances : stratégies efficaces pour être payé",
    content: `Les impayés peuvent mettre en péril la trésorerie de votre entreprise. Voici les méthodes pour récupérer vos créances efficacement.

**La phase amiable**
Toujours commencer par :
1. Relance téléphonique
2. Courrier de relance simple
3. Mise en demeure par recommandé AR

**L'injonction de payer**
Procédure rapide et peu coûteuse (environ 50€) pour les créances certaines, liquides et exigibles. Le juge statue sans audience.

**Le référé provision**
Si le débiteur conteste mais que la créance n'est pas sérieusement contestable, le juge des référés peut ordonner un paiement provisionnel.

**La procédure au fond**
Pour les litiges complexes ou les créances contestées, une procédure devant le tribunal compétent sera nécessaire.

**Les mesures conservatoires**
Avant même le jugement, vous pouvez demander :
- Une saisie conservatoire sur les comptes bancaires
- Un nantissement sur les parts sociales
- Une hypothèque provisoire

**L'exécution forcée**
Une fois le titre exécutoire obtenu :
- Saisie-attribution sur les comptes
- Saisie-vente des biens
- Saisie des rémunérations

**Conseil préventif**
Vérifiez la solvabilité de vos clients avant de contracter et exigez des garanties pour les grosses commandes.`,
    image_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
    days_offset: 22,
    status: "programme" as const,
    source: "socialpulse" as const,
  },

  // === NUMÉRIQUE & DONNÉES ===
  {
    title: "RGPD en 2025 : Les 5 nouvelles obligations à connaître",
    content: `Le Règlement Général sur la Protection des Données continue d'évoluer. En 2025, plusieurs nouvelles obligations s'imposent aux entreprises.

**1. Renforcement du consentement explicite**
Les entreprises doivent désormais obtenir un consentement encore plus clair et spécifique pour chaque type de traitement de données. Le simple bandeau cookie ne suffit plus.

**2. Obligation de désignation d'un DPO étendue**
Le seuil de désignation obligatoire d'un Délégué à la Protection des Données a été abaissé. De nombreuses PME sont désormais concernées.

**3. Nouvelles règles sur les transferts internationaux**
Suite aux évolutions réglementaires, les transferts de données vers certains pays tiers nécessitent des garanties supplémentaires documentées.

**4. Délais de notification réduits**
En cas de violation de données, le délai de notification aux autorités passe de 72 à 48 heures pour les incidents les plus graves.

**5. Sanctions alourdies**
Les amendes maximales ont été revues à la hausse, avec une attention particulière portée aux récidivistes.

**Conclusion**
Ces évolutions imposent une mise à jour de vos procédures internes. N'hésitez pas à consulter un professionnel pour vous accompagner dans cette transition.`,
    image_url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
    days_offset: 2,
    status: "a_valider" as const,
    source: "socialpulse" as const,
  },
  {
    title: "Droit à l'oubli : comment faire supprimer vos données en ligne",
    content: `Le droit à l'effacement, communément appelé "droit à l'oubli", permet à chacun de demander la suppression de ses données personnelles. Mode d'emploi.

**Fondement juridique**
L'article 17 du RGPD consacre le droit à l'effacement. Il s'applique dans plusieurs situations :
- Données plus nécessaires à la finalité initiale
- Retrait du consentement
- Opposition au traitement
- Traitement illicite

**Les limites du droit à l'oubli**
Ce droit n'est pas absolu. Il peut être refusé si les données sont nécessaires pour :
- L'exercice de la liberté d'expression
- Le respect d'une obligation légale
- L'archivage d'intérêt public
- La constatation de droits en justice

**Procédure auprès des moteurs de recherche**
Google, Bing et autres proposent des formulaires de demande de déréférencement. La réponse doit intervenir dans le mois.

**Recours en cas de refus**
1. Réclamation auprès de la CNIL
2. Saisine du tribunal judiciaire

**Conseil pratique**
Documentez les préjudices subis du fait de la présence des informations en ligne. Cela renforcera votre demande.`,
    image_url: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80",
    days_offset: 28,
    status: "programme" as const,
    source: "socialpulse" as const,
  },
  {
    title: "Intelligence artificielle et responsabilité juridique",
    content: `L'essor de l'IA pose des questions juridiques inédites. Qui est responsable quand une IA cause un dommage ?

**Le cadre réglementaire européen**
Le AI Act européen, entré en vigueur progressivement, classe les systèmes d'IA selon leur niveau de risque et impose des obligations croissantes.

**La question de la responsabilité**
En l'état actuel du droit, l'IA n'a pas de personnalité juridique. La responsabilité incombe donc :
- Au concepteur (défaut de conception)
- À l'exploitant (mauvaise utilisation)
- À l'utilisateur (négligence)

**Les régimes applicables**
- Responsabilité du fait des produits défectueux
- Responsabilité contractuelle
- Responsabilité délictuelle classique

**Cas particuliers**
- Véhicules autonomes : régime spécifique en préparation
- IA médicale : obligation de supervision humaine
- Décisions automatisées : droit à l'explication (RGPD)

**Recommandations pour les entreprises**
- Documenter les processus de décision de l'IA
- Mettre en place une supervision humaine
- Prévoir des assurances adaptées
- Informer les utilisateurs de l'utilisation de l'IA`,
    image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    days_offset: 35,
    status: "brouillon" as const,
    source: "manual" as const,
  },

  // === IMMOBILIER ===
  {
    title: "Bail commercial : les 5 pièges à éviter absolument",
    content: `La signature d'un bail commercial engage votre entreprise pour plusieurs années. Voici les erreurs les plus courantes et comment les éviter.

**Piège n°1 : Négliger la durée d'engagement**
Un bail commercial dure minimum 9 ans. Assurez-vous de bien comprendre les conditions de résiliation triennale avant de signer.

**Piège n°2 : Ignorer la clause de destination**
Cette clause définit l'activité autorisée dans le local. Une activité non prévue peut justifier la résiliation du bail.

**Piège n°3 : Sous-estimer les charges**
Au-delà du loyer, vérifiez précisément quelles charges vous incombent : taxe foncière, travaux, assurances...

**Piège n°4 : Oublier la clause de révision**
Le loyer peut être révisé annuellement. Comprenez bien l'indice de référence utilisé et son évolution historique.

**Piège n°5 : Mal négocier le droit au bail**
Le droit au bail (ou pas de porte) représente souvent une somme importante. Faites-le évaluer par un professionnel.

**Avant de signer**
- Faites vérifier le bail par un avocat
- Visitez le local à différentes heures
- Renseignez-vous sur le voisinage
- Vérifiez la conformité aux normes ERP`,
    image_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    days_offset: 14,
    status: "a_valider" as const,
    source: "socialpulse" as const,
  },
  {
    title: "Vente immobilière : les obligations du vendeur",
    content: `Vendre un bien immobilier implique de nombreuses obligations légales. Leur non-respect peut entraîner l'annulation de la vente ou des dommages-intérêts.

**Les diagnostics obligatoires**
Le DDT (Dossier de Diagnostic Technique) doit contenir :
- Diagnostic de Performance Énergétique (DPE)
- État des risques naturels et technologiques
- Diagnostic amiante (biens avant 1997)
- Diagnostic plomb (biens avant 1949)
- État de l'installation électrique et gaz

**L'obligation d'information**
Le vendeur doit informer l'acheteur de tous les éléments susceptibles d'influencer sa décision :
- Servitudes
- Procédures en cours
- Travaux votés non réalisés

**La garantie des vices cachés**
Le vendeur est responsable des défauts cachés qui rendent le bien impropre à son usage. Cette garantie ne peut être exclue entre professionnels et particuliers.

**Le délai de rétractation**
L'acheteur non professionnel dispose de 10 jours pour se rétracter après la signature du compromis, sans avoir à se justifier.

**Conseils pratiques**
- Conservez tous les documents relatifs au bien
- Soyez transparent sur les défauts connus
- Faites réaliser les diagnostics par des professionnels certifiés`,
    image_url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    days_offset: 30,
    status: "programme" as const,
    source: "manual" as const,
  },
  {
    title: "Copropriété : droits et obligations des copropriétaires",
    content: `Vivre en copropriété implique de respecter des règles collectives tout en préservant ses droits individuels. Tour d'horizon du cadre juridique.

**Le règlement de copropriété**
Document fondateur, il définit :
- La destination de l'immeuble
- Les conditions de jouissance des parties privatives et communes
- Les règles de répartition des charges

**Les assemblées générales**
Participation obligatoire aux décisions collectives :
- Majorité simple (article 24) : décisions courantes
- Majorité absolue (article 25) : travaux d'amélioration
- Double majorité (article 26) : modification du règlement

**Les charges de copropriété**
Deux catégories :
- Charges générales : proportionnelles aux tantièmes
- Charges spéciales : selon l'utilité pour chaque lot

**Les travaux en parties privatives**
Certains travaux nécessitent une autorisation :
- Modification de la façade
- Percement de murs porteurs
- Changement de destination du lot

**Litiges avec le syndic**
En cas de mauvaise gestion :
- Mise en demeure
- Demande de convocation d'AG extraordinaire
- Révocation et changement de syndic`,
    image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    days_offset: 38,
    status: "a_valider" as const,
    source: "socialpulse" as const,
  },

  // === PROTECTION DU CONSOMMATEUR ===
  {
    title: "Droit de rétractation : ce que les e-commerçants doivent savoir",
    content: `Le droit de rétractation est une protection essentielle du consommateur en ligne. Voici les règles à respecter pour les professionnels.

**Principe du droit de rétractation**
Pour tout achat à distance, le consommateur dispose de 14 jours pour retourner le produit sans avoir à justifier de motifs.

**Délai et point de départ**
- Biens : 14 jours à compter de la réception
- Services : 14 jours à compter de la conclusion du contrat
- Contenu numérique : particularités selon le téléchargement

**Les exceptions légales**
Certains produits ne sont pas concernés :
- Biens personnalisés
- Produits périssables
- Journaux et magazines
- Contenu numérique téléchargé avec accord exprès

**Obligations du professionnel**
- Informer clairement sur le droit de rétractation
- Fournir un formulaire type
- Rembourser dans les 14 jours suivant le retour
- Prendre en charge les frais de retour (sauf mention contraire)

**Sanctions en cas de non-respect**
Le délai de rétractation est prolongé de 12 mois si l'information n'a pas été fournie. Des amendes administratives peuvent s'appliquer.`,
    image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    days_offset: 4,
    status: "programme" as const,
    source: "socialpulse" as const,
  },
  {
    title: "Garantie légale de conformité : vos droits pendant 2 ans",
    content: `Depuis 2022, la garantie légale de conformité a été renforcée. Voici ce que les consommateurs doivent savoir pour faire valoir leurs droits.

**Qu'est-ce que la garantie légale de conformité ?**
Elle oblige le vendeur à livrer un bien conforme au contrat et répond des défauts de conformité existant lors de la délivrance.

**Durée de la garantie**
- 2 ans pour les biens neufs
- 1 an pour les biens d'occasion
- Présomption de défaut de 24 mois

**Qu'est-ce qu'un défaut de conformité ?**
- Le bien ne correspond pas à la description
- Il ne possède pas les qualités promises
- Il ne répond pas aux attentes légitimes du consommateur

**Les recours du consommateur**
En cas de défaut, le consommateur peut demander :
1. La réparation ou le remplacement (sans frais)
2. À défaut, la réduction du prix ou la résolution

**Délais et formalités**
- Signaler le défaut dans les 2 ans
- Conserver la preuve d'achat
- Mettre en demeure le vendeur si nécessaire

**Différence avec la garantie commerciale**
La garantie commerciale (facultative) s'ajoute à la garantie légale et ne peut jamais la réduire.`,
    image_url: "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&q=80",
    days_offset: 32,
    status: "a_valider" as const,
    source: "socialpulse" as const,
  },

  // === SUCCESSION ET PATRIMOINE ===
  {
    title: "Succession : pourquoi et comment refuser un héritage ?",
    content: `Contrairement aux idées reçues, hériter n'est pas toujours une bonne nouvelle. Dans certains cas, refuser une succession peut être la décision la plus sage.

**Quand refuser un héritage ?**
La principale raison est le passif successoral : si les dettes du défunt dépassent la valeur des biens, accepter l'héritage vous rendrait personnellement débiteur.

**Les trois options du successeur**
1. **Acceptation pure et simple** : vous héritez de tout, actif comme passif
2. **Acceptation à concurrence de l'actif net** : vos biens personnels sont protégés
3. **Renonciation** : vous êtes considéré comme n'ayant jamais été héritier

**Comment renoncer ?**
La renonciation doit être faite par déclaration au greffe du tribunal judiciaire du lieu d'ouverture de la succession. Cette démarche est gratuite.

**Délai pour décider**
Vous disposez de 4 mois pour vous prononcer. Passé ce délai, tout héritier peut vous mettre en demeure de prendre parti.

**Conséquences de la renonciation**
- Vos propres enfants prennent votre place (représentation)
- Vous ne pouvez pas cibler certains biens
- La décision est en principe irrévocable

**Mon conseil**
Avant toute décision, faites dresser un inventaire complet du patrimoine du défunt.`,
    image_url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
    days_offset: 40,
    status: "brouillon" as const,
    source: "manual" as const,
  },
  {
    title: "Testament : rédaction et validité juridique",
    content: `Le testament permet d'organiser la transmission de son patrimoine selon ses souhaits. Encore faut-il qu'il soit juridiquement valide.

**Les différentes formes de testament**
1. **Testament olographe** : écrit entièrement à la main, daté et signé
2. **Testament authentique** : reçu par deux notaires ou un notaire et deux témoins
3. **Testament mystique** : remis cacheté au notaire

**Conditions de validité**
- Capacité juridique du testateur
- Absence de vice du consentement
- Respect des formes prescrites
- Contenu licite

**Les limites à la liberté de tester**
La réserve héréditaire protège les héritiers réservataires :
- 1 enfant : 1/2 du patrimoine réservé
- 2 enfants : 2/3 réservé
- 3 enfants et plus : 3/4 réservé

**Révocation du testament**
Le testament peut être révoqué à tout moment par :
- Un nouveau testament
- Un acte notarié de révocation
- La destruction volontaire

**Conservation du testament**
Le dépôt chez un notaire est recommandé. L'inscription au Fichier Central des Dispositions de Dernières Volontés garantit sa découverte.`,
    image_url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    days_offset: 45,
    status: "a_valider" as const,
    source: "socialpulse" as const,
  },

  // === DROIT ADMINISTRATIF ===
  {
    title: "Permis de construire : procédure et recours",
    content: `Obtenir un permis de construire peut s'avérer complexe. Voici les étapes clés et les recours possibles en cas de refus.

**Constitution du dossier**
Le formulaire Cerfa doit être accompagné de :
- Plan de situation
- Plan de masse
- Plan de coupe
- Photographies du terrain
- Notice descriptive

**Délais d'instruction**
- 2 mois pour une maison individuelle
- 3 mois pour les autres constructions
- Délais allongés en secteurs protégés

**La décision de la mairie**
Trois issues possibles :
- Accord exprès
- Accord tacite (absence de réponse)
- Refus motivé

**Recours en cas de refus**
1. Recours gracieux auprès du maire (2 mois)
2. Recours hiérarchique auprès du préfet
3. Recours contentieux devant le tribunal administratif

**Le recours des tiers**
Les voisins peuvent contester un permis accordé. Le délai est de 2 mois à compter de l'affichage sur le terrain.

**Conseils pratiques**
- Consulter le PLU avant de déposer
- Soigner la présentation du dossier
- Anticiper les demandes de pièces complémentaires
- Afficher le permis dès son obtention`,
    image_url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
    days_offset: 48,
    status: "programme" as const,
    source: "manual" as const,
  },

  // === DROIT FISCAL ===
  {
    title: "Contrôle fiscal : vos droits et les bonnes pratiques",
    content: `Face à un contrôle fiscal, la connaissance de vos droits et une bonne préparation sont essentielles. Voici les clés pour bien réagir.

**Les différents types de contrôle**
- Contrôle sur pièces : depuis les bureaux de l'administration
- Vérification de comptabilité : sur place, pour les professionnels
- Examen de situation fiscale personnelle (ESFP) : pour les particuliers

**Vos droits fondamentaux**
- Être informé préalablement (avis de vérification)
- Être assisté par un conseil
- Débat oral et contradictoire
- Délai de réponse aux propositions de rectification

**La charte du contribuable vérifié**
Document remis avec l'avis de vérification, elle détaille vos garanties. Son non-respect peut entraîner l'annulation du contrôle.

**Durée du contrôle**
- 3 mois maximum pour les petites entreprises
- 6 mois en cas de comptabilité informatisée complexe
- Possibilité de suspension

**Contester les rectifications**
1. Réponse aux observations du vérificateur
2. Recours hiérarchique
3. Commission départementale de conciliation
4. Réclamation contentieuse
5. Tribunal administratif

**Conseils préventifs**
- Tenir une comptabilité rigoureuse
- Conserver les justificatifs 6 ans minimum
- Ne jamais refuser de communiquer des documents`,
    image_url: "https://images.unsplash.com/photo-1554224155-3a58e9bb6e1a?w=800&q=80",
    days_offset: 52,
    status: "a_valider" as const,
    source: "socialpulse" as const,
  },
];

export function useSeedDemoContent() {
  const { user } = useAuth();
  const hasSeeded = useRef(false);

  useEffect(() => {
    if (!user || hasSeeded.current) return;

    const seedIfNeeded = async () => {
      // Check if user already has publications
      const { data: existing, error: checkError } = await supabase
        .from("publications")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (checkError) {
        console.error("Error checking existing publications:", checkError);
        return;
      }

      // If user already has content, don't seed
      if (existing && existing.length > 0) {
        hasSeeded.current = true;
        return;
      }

      const today = new Date();
      
      // Create pending publications (a_valider)
      const pendingPubs = PENDING_PUBLICATIONS.map((pub) => ({
        user_id: user.id,
        content: pub.content,
        image_url: pub.image_url,
        scheduled_date: format(addDays(today, pub.days_offset), "yyyy-MM-dd"),
        scheduled_time: "09:00",
        platform: pub.platform,
        status: "a_valider" as const,
        source: pub.source,
      }));

      // Create scheduled publications (programme)
      const scheduledPubs = SCHEDULED_PUBLICATIONS.map((pub) => ({
        user_id: user.id,
        content: pub.content,
        image_url: pub.image_url,
        scheduled_date: format(addDays(today, pub.days_offset), "yyyy-MM-dd"),
        scheduled_time: "10:00",
        platform: pub.platform,
        status: "programme" as const,
        source: pub.source,
      }));

      // Create draft publications (brouillon)
      const draftPubs = DRAFT_PUBLICATIONS.map((pub) => ({
        user_id: user.id,
        content: pub.content,
        image_url: pub.image_url,
        scheduled_date: format(today, "yyyy-MM-dd"),
        scheduled_time: "09:00",
        platform: pub.platform,
        status: "brouillon" as const,
        source: pub.source,
      }));

      // Create blog articles
      const blogArticles = BLOG_ARTICLES.map((article) => ({
        user_id: user.id,
        title: article.title,
        content: article.content,
        image_url: article.image_url,
        scheduled_date: format(addDays(today, article.days_offset), "yyyy-MM-dd"),
        scheduled_time: "09:00",
        platform: "blog" as const,
        status: article.status,
        source: article.source,
      }));

      const allPublications = [...pendingPubs, ...scheduledPubs, ...draftPubs, ...blogArticles];

      const { error: insertError } = await supabase
        .from("publications")
        .insert(allPublications);

      if (insertError) {
        console.error("Error seeding demo content:", insertError);
      } else {
        console.log("Demo content seeded successfully:", allPublications.length, "publications including", blogArticles.length, "blog articles");
        hasSeeded.current = true;
      }
    };

    seedIfNeeded();
  }, [user]);
}
