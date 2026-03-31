import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.svg";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, Shield, TrendingUp, Crown, ShieldCheck } from "lucide-react";

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

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/">
            <img src={logo} alt="SocialPulse" className="h-20 w-auto object-contain" />
          </Link>
          <Button asChild variant="outline">
            <Link to="/login">Connexion</Link>
          </Button>
        </div>
      </header>

      <main className="container py-16 px-4">
        {/* Page Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-sm font-semibold mb-4 shadow-sm">
            Nos formules
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
            Des offres adaptées à votre pratique
          </h1>
          <p className="text-lg text-muted-foreground">
            Choisissez l'offre qui correspond à vos besoins. Toutes incluent le contrôle total.
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto items-start">
          {offers.map((offer) => {
            const Icon = offer.icon;
            const isPopular = offer.popular;
            const isExpert = offer.name === "EXPERT";
            
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
              <Card
                key={offer.name}
                className={`shadow-sm relative flex flex-col transition-all duration-300 rounded-2xl ${
                  isPopular
                    ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 shadow-xl shadow-emerald-100/50"
                    : "bg-gradient-to-br from-white to-gray-50 border border-gray-100"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg">
                      Recommandé
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pt-8 pb-4">
                  <div className={`mx-auto mb-4 p-3 rounded-2xl ${iconContainerClass} shadow-sm`}>
                    <Icon className={`h-6 w-6 ${iconClass}`} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{offer.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {offer.subtitle}
                  </p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {/* Prix */}
                  <div className="mb-6 text-center">
                    {offer.pricePrefix && (
                      <span className="text-xs text-gray-500 block mb-1">{offer.pricePrefix}</span>
                    )}
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold text-gray-900">{offer.price} €</span>
                      <span className="text-sm text-gray-500">/ mois HT</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-8 flex-1">
                    {offer.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm"
                      >
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-emerald-600" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
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
                    asChild
                    className={`w-full rounded-full ${
                      isPopular 
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-200' 
                        : ''
                    }`}
                    variant={isPopular ? "default" : "outline"}
                  >
                    <Link to="/demo">
                      Demander une démo
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Reassurance Section */}
        <div className="mt-16 text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-emerald-100 shadow-sm">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <span className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">SocialPulse ne publie jamais sans votre validation.</span>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
