import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import logo from "@/assets/logo.svg";
import cnilLogo from "@/assets/partners/cnil.jpg";
import rinLogo from "@/assets/partners/rin.jpg";
import cnbLogo from "@/assets/partners/cnb.jpg";
import { motion } from "framer-motion";
import { useRef } from "react";
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";
import { DeviceFrame } from "@/components/landing/DeviceFrame";
import { HeroScreensSlider } from "@/components/landing/HeroScreensSlider";
import { TestimonialCard } from "@/components/landing/TestimonialCard";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { Illustration3D } from "@/components/landing/Illustration3D";
import { 
  Check, 
  Shield, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  MessageCircle,
  Zap,
  ArrowRight,
  Star,
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
  ChevronRight,
  MousePointerClick,
  Bot,
  FileText,
  Gauge,
  Lock,
  ShieldCheck,
  UserCheck,
  Ban,
  Scale,
  Crown,
  Sparkles,
  Clock,
  CheckCircle,
  type LucideIcon
} from "lucide-react";

// Fictional posts for calendar preview
const fictionalPosts: {
  day: number;
  platform: string;
  platformIcon: LucideIcon;
  platformColor: string;
  title: string;
  preview: string;
  time: string;
  status: "publié" | "programmé" | "en attente";
}[] = [
  {
    day: 4,
    platform: "LinkedIn",
    platformIcon: Linkedin,
    platformColor: "#0077B5",
    title: "Réforme du droit du travail",
    preview: "Les nouvelles dispositions sur le télétravail entrent en vigueur ce mois-ci. Voici ce que vous devez savoir...",
    time: "09:00",
    status: "publié"
  },
  {
    day: 8,
    platform: "Twitter",
    platformIcon: Twitter,
    platformColor: "#1DA1F2",
    title: "Conseil pratique",
    preview: "3 erreurs fréquentes dans les contrats de bail commercial à éviter absolument.",
    time: "14:30",
    status: "programmé"
  },
  {
    day: 13,
    platform: "Facebook",
    platformIcon: Facebook,
    platformColor: "#1877F2",
    title: "Actualité fiscale",
    preview: "La nouvelle loi de finances apporte des modifications importantes pour les entreprises...",
    time: "11:00",
    status: "en attente"
  },
  {
    day: 19,
    platform: "LinkedIn",
    platformIcon: Linkedin,
    platformColor: "#0077B5",
    title: "Décision de justice",
    preview: "Analyse de l'arrêt récent de la Cour de cassation sur la responsabilité des dirigeants.",
    time: "10:15",
    status: "programmé"
  },
  {
    day: 23,
    platform: "Instagram",
    platformIcon: Instagram,
    platformColor: "#E1306C",
    title: "Coulisses du cabinet",
    preview: "Retour sur notre participation au Forum des Avocats 2024. Une belle rencontre !",
    time: "16:00",
    status: "en attente"
  }
];

// Animation variants - simplified for performance
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
};

// Social platforms
const socialPlatforms = [
  { icon: Linkedin, color: "#0077B5", name: "LinkedIn" },
  { icon: Instagram, color: "#E1306C", name: "Instagram" },
  { icon: Facebook, color: "#1877F2", name: "Facebook" },
  { icon: Twitter, color: "#1DA1F2", name: "Twitter" },
];

// Trust logos (partner references)
const trustLogos = [
  { src: cnbLogo, alt: "Conseil National des Barreaux" },
  { src: rinLogo, alt: "Règlement Intérieur National" },
  { src: cnilLogo, alt: "CNIL" },
];

// Reassurance badges for hero (simplified)
const reassuranceBadges = [
  { icon: ShieldCheck, text: "100% conforme RIN" },
  { icon: UserCheck, text: "Validation obligatoire" },
];

// Anti-fear section items with detailed explanations
const antiFearItems = [
  {
    icon: ShieldCheck,
    title: "Pas de publication automatique",
    description: "Vous gardez le contrôle total.",
    details: "Contrairement aux outils de marketing automation classiques, SocialPulse ne publie jamais rien sans votre validation explicite. Chaque contenu vous est soumis, vous pouvez le modifier, le rejeter ou le programmer. La publication n'intervient qu'après votre approbation formelle via un clic de validation.",
    examples: [
      "Interface de validation claire et intuitive",
      "Historique complet de vos décisions",
      "Possibilité de modification illimitée avant publication"
    ]
  },
  {
    icon: Scale,
    title: "Conformité déontologique",
    description: "Contenus pensés avec des avocats.",
    details: "Notre équipe inclut des professionnels du droit qui vérifient que chaque modèle de contenu respecte les règles du RIN. Les sujets sensibles sont signalés, les formulations sont adaptées à la communication des professions réglementées. Nous appliquons une charte éditoriale stricte validée par des avocats en exercice.",
    examples: [
      "Vocabulaire adapté aux règles professionnelles",
      "Pas de promesses de résultats garantis",
      "Respect absolu du secret professionnel"
    ]
  },
  {
    icon: UserCheck,
    title: "Responsabilité maîtrisée",
    description: "Chaque prise de parole est vérifiable.",
    details: "Vous restez l'unique responsable de vos publications, et c'est pour cela que nous vous donnons tous les outils pour exercer ce contrôle. Historique complet des modifications, traçabilité des validations, exports des contenus... Vous pouvez à tout moment prouver que vous avez vérifié et approuvé chaque communication.",
    examples: [
      "Historique horodaté de toutes les validations",
      "Export PDF des contenus publiés",
      "Traçabilité complète pour votre Ordre"
    ]
  },
];

// Features in bento style - reformulated for security emphasis
const bentoFeatures = [
  {
    id: "calendar",
    icon: Calendar,
    title: "Calendrier éditorial maîtrisé",
    description: "Visualisez et planifiez vos prises de parole. Chaque contenu attend votre validation.",
    size: "large",
    gradient: "from-blue-50 to-indigo-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600"
  },
  {
    id: "ai",
    icon: Bot,
    title: "IA encadrée et contrôlée",
    description: "Les prises de parole proposées par SocialPulse reposent sur une approche hybride, combinant intelligence artificielle et expertise de rédacteurs spécialisés en communication juridique. Cette complémentarité permet de produire des contenus adaptés à votre pratique, pertinents et responsables, toujours sous votre supervision, dans un cadre strictement déontologique.",
    size: "small",
    gradient: "from-violet-50 to-purple-50",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600"
  },
  {
    id: "validation",
    icon: MousePointerClick,
    title: "Validation déontologique",
    description: "Vous restez décisionnaire. Chaque publication est soumise à votre validation et reste en attente dans un délai convenu. Vous êtes informé selon vos préférences et pouvez, à tout moment, valider, demander une modification ou annuler la diffusion. Ce fonctionnement garantit une communication fluide, tout en vous laissant le dernier mot, dans le respect strict du cadre déontologique.",
    size: "small",
    gradient: "from-emerald-50 to-teal-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600"
  },
  {
    id: "metrics",
    icon: Gauge,
    title: "Suivi de vos prises de parole",
    description: "Mesurez l'impact de votre communication avec des indicateurs clairs.",
    size: "medium",
    gradient: "from-amber-50 to-orange-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600"
  },
  {
    id: "trends",
    icon: TrendingUp,
    title: "Veille juridique",
    description: "Restez informé des sujets d'actualité pertinents pour votre spécialité.",
    size: "medium",
    gradient: "from-rose-50 to-pink-50",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600"
  },
];

// Pricing offers
const offers = [
  {
    name: "ESSENTIEL",
    subtitle: "Présence déontologique maîtrisée",
    icon: Shield,
    price: "149",
    pricePrefix: null,
    features: [
      "1 à 2 publications par semaine",
      "1 réseau social",
      "Contenus rédigés via IA + expertise humaine",
      "Validation déontologique",
      "Statistiques essentielles",
      "Support standard",
    ],
    blogNote: "Aucun article de blog inclus",
  },
  {
    name: "AVANCÉ",
    subtitle: "Visibilité renforcée & SEO de soutien",
    icon: TrendingUp,
    popular: true,
    price: "299",
    pricePrefix: "À partir de",
    features: [
      "3 publications par semaine",
      "2 réseaux sociaux",
      "1 article de blog par semaine (optimisé SEO)",
      "Veille juridique ciblée",
      "Suivi de performance enrichi",
      "30 min/mois en visio avec un expert",
      "Priorité Community Manager",
    ],
  },
  {
    name: "EXPERT",
    subtitle: "Stratégie éditoriale complète & accompagnement premium",
    icon: Crown,
    price: "499",
    pricePrefix: "À partir de",
    features: [
      "5 publications par semaine",
      "3 réseaux sociaux",
      "2 à 3 articles de blog par semaine",
      "Ligne éditoriale personnalisée",
      "Veille juridique approfondie",
      "Reporting avancé",
      "1h/mois en visio avec expert dédié",
      "Support prioritaire",
    ],
  },
];

// Steps - recontextualized for lawyers
const steps = [
  {
    number: "1",
    title: "Recevez",
    subtitle: "des propositions conformes",
    description: "SocialPulse analyse l'actualité juridique et vous propose des contenus adaptés à votre spécialité, sans promesse commerciale.",
    icon: FileText
  },
  {
    number: "2",
    title: "Validez",
    subtitle: "en toute sérénité",
    description: "Relisez, ajustez si besoin et approuvez chaque prise de parole. Rien ne sort sans votre accord explicite.",
    icon: Check
  },
  {
    number: "3",
    title: "Publiez",
    subtitle: "en maîtrisant votre image",
    description: "Votre contenu validé est diffusé au moment optimal. Vous restez maître de votre communication.",
    icon: Zap
  },
];

// Testimonials with portrait hints
const testimonials = [
  {
    quote: "SocialPulse m'a permis de développer ma visibilité sans y passer des heures. Je valide les contenus en quelques clics et je me concentre sur mes dossiers.",
    author: "Maître Sophie D.",
    role: "Avocate en droit de la famille",
    avatar: "SD",
    portraitId: "sophie",
    featured: true
  },
  {
    quote: "Enfin une solution adaptée aux contraintes déontologiques de notre profession.",
    author: "Maître Marc L.",
    role: "Avocat en droit des affaires",
    avatar: "ML",
    portraitId: "marc"
  },
  {
    quote: "Le gain de temps est considérable. Je me concentre sur mes dossiers.",
    author: "Maître Laurent P.",
    role: "Avocat pénaliste",
    avatar: "LP"
  },
  {
    quote: "L'accompagnement éditorial est remarquable et très professionnel.",
    author: "Maître Laura B.",
    role: "Avocate en droit du travail",
    avatar: "LB",
    portraitId: "laura"
  },
  {
    quote: "Une interface intuitive et des contenus toujours pertinents.",
    author: "Cabinet Durand",
    role: "Droit immobilier",
    avatar: "CD"
  },
];

// Stats
const stats = [
  { value: "500+", label: "Avocats", suffix: "accompagnés" },
  { value: "15K+", label: "Publications", suffix: "validées" },
  { value: "2h", label: "Gagnées", suffix: "par semaine" },
  { value: "100%", label: "Contrôle", suffix: "garanti" },
];

export default function Index() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 animate-fade-in">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="SocialPulse" className="h-20" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#security" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Pourquoi SocialPulse
            </a>
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Fonctionnalités
            </a>
            <a href="#deontologie" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Déontologie & Sécurité
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Comment ça marche
            </a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Tarifs
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="text-gray-600">
              <Link to="/login">Connexion</Link>
            </Button>
            <Button asChild size="sm" className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-5">
              <Link to="/demo">
                Demander une démo
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - NEW LAYOUT: 2 columns */}
      <section ref={heroRef} className="relative pt-24 pb-16 md:pt-28 md:pb-24 overflow-hidden">
        {/* Static background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left column: Text content */}
            <motion.div 
              className="text-center lg:text-left"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {/* Main headline */}
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6"
                variants={fadeInUp}
              >
                Votre communication
                <br />
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  déontologique, sans compromis.
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 mb-8"
                variants={fadeInUp}
              >
                Développez votre visibilité sur les réseaux sociaux
                et transformez-la en rendez-vous qualifiés,{" "}
                <span className="font-medium text-gray-900">dans un cadre strictement déontologique.</span>
              </motion.p>
              
              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8"
                variants={fadeInUp}
              >
                <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-8 h-12 text-base shadow-lg shadow-gray-900/20" asChild>
                  <Link to="/demo">
                    Découvrir en démo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base border-gray-300" asChild>
                  <a href="#security">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Voir les garanties
                  </a>
                </Button>
              </motion.div>

              {/* REASSURANCE BADGES */}
              <motion.div 
                className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-8"
                variants={fadeInUp}
              >
                {reassuranceBadges.map((badge, i) => (
                  <span 
                    key={i}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500"
                  >
                    <badge.icon className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{badge.text}</span>
                    {i < reassuranceBadges.length - 1 && <span className="mx-2 text-gray-300">•</span>}
                  </span>
                ))}
              </motion.div>

              {/* Social proof */}
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                variants={fadeInUp}
              >
                <div className="flex -space-x-2">
                  {["SD", "MA", "LP", "CB", "TR"].map((initials, i) => (
                    <div 
                      key={i}
                      className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center text-white text-xs font-medium ring-2 ring-white"
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">500+ avocats</span> nous font confiance
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right column: 3D Illustration */}
            <motion.div 
              className="relative flex items-center justify-center"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <HeroScreensSlider className="w-full max-w-lg" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* POURQUOI SOCIALPULSE - Introduction Section */}
      <section id="security" className="py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 scroll-mt-20">
        <div className="container max-w-7xl mx-auto px-4">
          {/* New introductory text block */}
          <motion.div 
            className="text-center max-w-4xl mx-auto mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              Pourquoi{" "}
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                SocialPulse
              </span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              LA VISIBILITÉ EST AUJOURD'HUI UN LEVIER ESSENTIEL POUR DÉVELOPPER UN CABINET D'AVOCATS.
              <br />
              SocialPulse aide les avocats à émerger sur les réseaux sociaux,
              à <strong className="text-gray-800">valoriser leur expertise</strong> et à générer des <strong className="text-gray-800">rendez-vous qualifiés</strong>, dans un cadre strictement déontologique. 
              Chaque prise de parole est encadrée et soumise à validation, <strong className="text-gray-800">sans aucune publication automatique</strong>, 
              afin que l'avocat conserve le contrôle total <br />de sa communication.
              Grâce à une approche combinant intelligence artificielle et expertise humaine, 
              SocialPulse transforme la <strong className="text-gray-800">visibilité</strong> en <strong className="text-gray-800">opportunités concrètes</strong>, 
              sans jamais compromettre la responsabilité professionnelle.
            </p>
          </motion.div>

          {/* Trust bar - Moved below Pourquoi SocialPulse */}
          <motion.div 
            className="py-8 mb-16 border-y border-gray-200 bg-white/50 rounded-xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <p className="text-center text-sm text-gray-500 mb-6">
              Conforme aux exigences de la profession
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {trustLogos.map((logo, i) => (
                <div key={i} className="flex items-center justify-center h-12">
                  <img 
                    src={logo.src} 
                    alt={logo.alt} 
                    className="h-10 md:h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Guarantees sub-section */}
          <motion.div 
            id="deontologie"
            className="text-center max-w-3xl mx-auto mb-16 scroll-mt-24"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200 text-emerald-700 text-sm font-semibold mb-6">
              <ShieldCheck className="h-4 w-4" />
              Vos garanties
            </span>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Une communication{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                sans risque
              </span>
            </h3>
            <p className="text-xl text-gray-600">
              Conçu pour respecter les exigences spécifiques de votre profession.
            </p>
          </motion.div>
          
          {/* Two-column layout: Photo + Accordion */}
          <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
            {/* Left column - Video Player */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="hidden lg:block"
            >
              <div className="relative mb-6">
                {/* Decorative gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl transform rotate-3 scale-105" />
                
                {/* Video Player Container */}
                <div className="relative rounded-2xl shadow-xl overflow-hidden w-full aspect-video bg-gray-900">
                  <video 
                    className="w-full h-full object-cover"
                    controls
                    poster="/placeholder.svg"
                    preload="metadata"
                  >
                    {/* Placeholder video - à remplacer par la vraie vidéo */}
                    <source 
                      src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4" 
                      type="video/mp4" 
                    />
                    Votre navigateur ne supporte pas la lecture vidéo.
                  </video>
                </div>
                
                {/* Floating badge */}
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-3 flex items-center gap-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">100% conforme</span>
                </div>
              </div>
            </motion.div>
            
            {/* Right column - Accordion */}
            <Accordion type="single" collapsible className="space-y-4">
              {antiFearItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: i * 0.1, duration: 0.4 }
                    }
                  }}
                >
                  <AccordionItem 
                    value={`item-${i}`}
                    className="border-0 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
                  >
                    <AccordionTrigger className="px-6 py-5 hover:no-underline [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-emerald-50/50 [&[data-state=open]]:to-teal-50/30">
                      <div className="flex items-center gap-4 text-left">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <item.icon className="h-7 w-7 text-emerald-600" />
                          </div>
                          {/* Subtle pulse on hover */}
                          <div className="absolute inset-0 rounded-xl bg-emerald-400/20 scale-100 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-emerald-700 transition-colors duration-300">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-500 font-normal mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className="px-6 pb-6">
                      <div className="pl-[4.5rem] space-y-5">
                        {/* Detailed explanation */}
                        <p className="text-gray-600 leading-relaxed">
                          {item.details}
                        </p>
                        
                        {/* Guarantee badge */}
                        <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium pt-1">
                          <ShieldCheck className="h-4 w-4" />
                          <span>Garanti contractuellement</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>

          {/* Credibility footer */}
          <motion.div 
            className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-gray-900 to-gray-800 text-white text-sm shadow-lg">
              <Scale className="h-4 w-4 text-emerald-400" />
              <span>Pensé avec des avocats</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white border border-gray-200 text-gray-700 text-sm shadow-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Conforme aux règles déontologiques françaises</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats section */}
      <section className="py-16 bg-gray-50">
        <div className="container max-w-7xl mx-auto px-4">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                className="text-center group"
                variants={fadeInUp}
              >
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-1">
                  <AnimatedCounter value={stat.value} duration={2.5} />
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{stat.label}</span> {stat.suffix}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bento Features with Screenshots */}
      <section id="features" className="relative py-20 bg-white overflow-hidden">
        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-2xl mx-auto mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Fonctionnalités
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tout ce qu'il vous faut, en toute sécurité
            </h2>
            <p className="text-lg text-gray-600">
              Une plateforme complète, pensée pour les professionnels du droit qui veulent maîtriser leur image.
            </p>
          </motion.div>
          
          {/* Screenshots Grid */}
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            <FeatureShowcase type="validation" className="lg:col-span-2" />
            <FeatureShowcase type="metrics" />
          </div>

          {/* Bento grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Large card */}
            <motion.div 
              className="md:col-span-2 lg:col-span-2 row-span-2"
              variants={fadeInUp}
            >
              <Card className={`h-full bg-gradient-to-br ${bentoFeatures[0].gradient} border-0 overflow-hidden hover:shadow-lg transition-shadow`}>
                <CardContent className="p-8 h-full flex flex-col">
                  <div className={`w-12 h-12 rounded-xl ${bentoFeatures[0].iconBg} flex items-center justify-center mb-6`}>
                    <Calendar className={`h-6 w-6 ${bentoFeatures[0].iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{bentoFeatures[0].title}</h3>
                  <p className="text-gray-600 mb-6">{bentoFeatures[0].description}</p>
                  
                  {/* Mini calendar mockup with interactive posts */}
                  <div className="flex-1 bg-white/80 rounded-xl p-4 shadow-inner">
                    <div className="grid grid-cols-7 gap-2 text-center text-xs mb-3">
                      {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                        <span key={i} className="text-gray-400 font-medium">{d}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 28 }, (_, i) => {
                        const dayNumber = i + 1;
                        const post = fictionalPosts.find(p => p.day === dayNumber);
                        const isKeyDate = [6, 16, 26].includes(dayNumber);
                        
                        if (post) {
                          const PlatformIcon = post.platformIcon;
                          return (
                            <HoverCard key={i} openDelay={150} closeDelay={50}>
                              <HoverCardTrigger asChild>
                                <div 
                                  className="aspect-square rounded-lg flex items-center justify-center text-sm bg-primary text-white font-medium cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all shadow-sm"
                                >
                                  {dayNumber}
                                </div>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-72 p-4" side="top" align="center">
                                <div className="flex items-start gap-3">
                                  <div 
                                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: `${post.platformColor}15` }}
                                  >
                                    <PlatformIcon 
                                      className="h-4 w-4" 
                                      style={{ color: post.platformColor }} 
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-medium text-gray-500">{post.platform}</span>
                                      <span className="text-xs text-gray-400">{post.time}</span>
                                    </div>
                                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{post.title}</h4>
                                    <p className="text-xs text-gray-600 line-clamp-2">{post.preview}</p>
                                    <div className="mt-2">
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        post.status === 'publié' ? 'bg-emerald-100 text-emerald-700' :
                                        post.status === 'programmé' ? 'bg-blue-100 text-blue-700' :
                                        'bg-amber-100 text-amber-700'
                                      }`}>
                                        {post.status}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          );
                        }
                        
                        return (
                          <div 
                            key={i}
                            className={`aspect-square rounded-lg flex items-center justify-center text-sm ${
                              isKeyDate
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {dayNumber}
                          </div>
                        );
                      })}
                    </div>
                    {/* Legend */}
                    <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-primary shadow-sm" />
                        <span>Publication</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-emerald-100" />
                        <span>Date clé</span>
                      </div>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-2">
                      Survolez les jours colorés pour prévisualiser
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Small cards */}
            {bentoFeatures.slice(1).map((feature, i) => (
              <motion.div key={feature.id} variants={fadeInUp}>
                <Card className={`h-full bg-gradient-to-br ${feature.gradient} border-0 hover:shadow-lg transition-shadow`}>
                  <CardContent className="p-6">
                    <div className={`w-10 h-10 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4`}>
                      <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Additional features */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full bg-gradient-to-br from-gray-50 to-gray-100 border-0 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center mb-4">
                    <MessageCircle className="h-5 w-5 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Accompagnement CM</h3>
                  <p className="text-sm text-gray-600">Un expert dédié pour vous conseiller dans votre stratégie éditoriale.</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it works with visual steps */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center max-w-2xl mx-auto mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-4">
              Simple et sécurisé
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-gray-600">
              3 étapes pour une communication professionnelle, sans prise de risque.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                className="relative flex"
                variants={fadeInUp}
              >
                {/* Connector arrow (desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-4 lg:-right-5 translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <ChevronRight className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                )}
                
                <Card className="flex-1 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group relative">
                  {/* Step number badge */}
                  <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 flex items-center justify-center font-bold text-sm shadow-sm">
                    {step.number}
                  </div>
                  
                  <CardContent className="p-8 pt-14 text-center">
                    {/* Icon with pastel gradient */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                      <step.icon className="h-8 w-8 text-emerald-600" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-emerald-600 font-semibold text-sm mb-3">{step.subtitle}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials with improved cards */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center max-w-2xl mx-auto mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-4">
              Témoignages
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-lg text-gray-600">
              Découvrez ce que vos confrères disent de SocialPulse.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeInUp} className={t.featured ? "lg:col-span-2" : ""}>
                <TestimonialCard 
                  quote={t.quote}
                  author={t.author}
                  role={t.role}
                  avatar={t.avatar}
                  featured={t.featured}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-white via-emerald-50/30 to-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl" />
        
        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16 flex flex-col items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-sm font-semibold mb-4 shadow-sm">
              Nos formules
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 whitespace-nowrap text-center">
              Des offres adaptées à votre pratique
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-2xl">
              Choisissez l'offre qui correspond à vos besoins. Toutes incluent le contrôle total.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-start"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {offers.map((offer) => {
              const isPopular = offer.popular;
              const isEssentiel = offer.name === "ESSENTIEL";
              const isExpert = offer.name === "EXPERT";
              
              // Icon styles based on offer type
              const iconContainerClass = isPopular 
                ? "bg-gradient-to-br from-emerald-100 to-teal-100" 
                : isExpert 
                  ? "bg-gradient-to-br from-violet-100 to-indigo-100"
                  : "bg-gradient-to-br from-gray-100 to-gray-200";
              
              const iconClass = isPopular 
                ? "text-emerald-600" 
                : isExpert 
                  ? "text-violet-600"
                  : "text-gray-600";
              
              return (
                <motion.div 
                  key={offer.name} 
                  variants={scaleIn}
                  className="flex"
                >
                  <Card className={`h-full relative overflow-hidden transition-all duration-300 rounded-2xl ${
                    isPopular 
                      ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 shadow-xl shadow-emerald-100/50 hover:shadow-2xl hover:-translate-y-2' 
                      : 'bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1'
                  }`}>
                    {isPopular && (
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold shadow-lg">
                        Recommandé
                      </div>
                    )}
                    <CardContent className="p-8">
                      <div className={`w-14 h-14 rounded-2xl ${iconContainerClass} flex items-center justify-center mb-5 shadow-sm`}>
                        <offer.icon className={`h-7 w-7 ${iconClass}`} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{offer.name}</h3>
                      <p className="text-sm text-gray-500 mb-4">{offer.subtitle}</p>
                      
                      {/* Prix */}
                      <div className="mb-6">
                        {offer.pricePrefix && (
                          <span className="text-xs text-gray-500 block mb-1">{offer.pricePrefix}</span>
                        )}
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-gray-900">{offer.price} €</span>
                          <span className="text-sm text-gray-500">/ mois HT</span>
                        </div>
                      </div>
                      
                      <ul className="space-y-3 mb-6">
                        {offer.features.map((f, j) => (
                          <li key={j} className="flex items-start gap-3 text-sm">
                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="h-3 w-3 text-emerald-600" />
                            </div>
                            <span className="text-gray-700">{f}</span>
                          </li>
                        ))}
                        {offer.blogNote && (
                          <li className="flex items-start gap-3 text-sm text-gray-400 italic">
                            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs">—</span>
                            </div>
                            <span>{offer.blogNote}</span>
                          </li>
                        )}
                      </ul>
                      
                      <Button 
                        className={`w-full rounded-full group ${
                          isPopular 
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-200' 
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                        variant={isPopular ? "default" : "outline"}
                        asChild
                      >
                        <Link to="/demo">
                          Demander une démo
                          <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Reassurance under pricing */}
          <motion.div 
            className="mt-12 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-emerald-100 shadow-sm">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <span className="text-sm text-gray-600">
                Toutes les offres incluent : <span className="font-medium text-gray-900">validation avant publication</span> • <span className="font-medium text-gray-900">aucun contenu automatique</span> • <span className="font-medium text-gray-900">conformité déontologique</span>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gray-900 overflow-hidden">
        {/* Static background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
          >
            <div className="flex justify-center gap-2 mb-6">
              {socialPlatforms.map((p, i) => (
                <div 
                  key={p.name}
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: p.color }}
                >
                  <p.icon className="h-5 w-5 text-white" />
                </div>
              ))}
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Prêt à communiquer sereinement ?
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              Découvrez comment SocialPulse peut vous aider à développer votre visibilité, sans risque.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-8 h-12 shadow-lg" asChild>
                <Link to="/demo">
                  Découvrir en démo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" className="text-white hover:text-white hover:bg-white/10 rounded-full px-8 h-12" asChild>
                <Link to="/login">
                  J'ai déjà un compte
                </Link>
              </Button>
            </div>
            
            <p className="mt-6 text-sm text-gray-500 flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Réponse sous 24h • Sans engagement • Démo personnalisée
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-gray-100">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src={logo} alt="SocialPulse" className="h-16" />
              <span className="text-sm text-gray-500">
                © {new Date().getFullYear()} SocialPulse. Tous droits réservés.
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Mentions légales
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Confidentialité
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                CGU
              </a>
              <a href="mailto:contact@socialpulse.pro" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Contact
              </a>
            </div>
            <div className="flex items-center gap-2">
              {socialPlatforms.map((p) => (
                <a 
                  key={p.name}
                  href="#" 
                  className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <p.icon className="h-4 w-4 text-gray-600" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
