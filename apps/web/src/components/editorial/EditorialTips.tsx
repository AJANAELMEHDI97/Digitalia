import { Info, Linkedin, Instagram, Facebook, Twitter, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialPlatform } from "@/hooks/usePublications";

interface EditorialTipsProps {
  platform: SocialPlatform | null;
  className?: string;
}

interface TipContent {
  icon: typeof Linkedin;
  color: string;
  tone: string;
  textStyle: string;
  objective: string;
  tips: string[];
}

const EDITORIAL_TIPS: Record<SocialPlatform, TipContent> = {
  linkedin: {
    icon: Linkedin,
    color: "#0A66C2",
    tone: "Professionnel et pédagogique",
    textStyle: "Texte structuré, longueur moyenne à longue",
    objective: "Informer et renforcer votre expertise",
    tips: [
      "Utilisez des phrases complètes et des paragraphes",
      "Vulgarisez les concepts juridiques",
      "Apportez de la valeur informative",
    ],
  },
  instagram: {
    icon: Instagram,
    color: "#E1306C",
    tone: "Accessible et humain",
    textStyle: "Texte court, légende simple",
    objective: "Sensibiliser et créer de la proximité",
    tips: [
      "Privilégiez un ton direct et chaleureux",
      "Rendez le droit plus compréhensible",
      "L'image est essentielle sur ce réseau",
    ],
  },
  facebook: {
    icon: Facebook,
    color: "#1877F2",
    tone: "Convivial et engageant",
    textStyle: "Texte de longueur moyenne",
    objective: "Engager et informer votre communauté",
    tips: [
      "Posez des questions pour susciter les réactions",
      "Partagez des actualités juridiques accessibles",
      "Humanisez votre pratique",
    ],
  },
  twitter: {
    icon: Twitter,
    color: "#000000",
    tone: "Concis et percutant",
    textStyle: "Texte très court (280 caractères max)",
    objective: "Partager des insights rapides",
    tips: [
      "Allez droit au but",
      "Utilisez des hashtags pertinents",
      "Réagissez à l'actualité juridique",
    ],
  },
  blog: {
    icon: Newspaper,
    color: "#9333EA",
    tone: "Approfondi et expert",
    textStyle: "Article long format, structuré avec titres",
    objective: "Démontrer votre expertise et améliorer votre SEO",
    tips: [
      "Structurez avec des sous-titres clairs",
      "Approfondissez les sujets juridiques",
      "Optimisez pour le référencement naturel",
    ],
  },
  google_business: {
    icon: Newspaper,
    color: "#4285F4",
    tone: "Local et informatif",
    textStyle: "Texte court (max 1500 caractères), avec image",
    objective: "Améliorer votre visibilité locale et attirer des clients",
    tips: [
      "Partagez des actualités de votre cabinet",
      "Annoncez vos événements et permanences",
      "Mettez en avant vos domaines d'expertise",
    ],
  },
};

export function EditorialTips({ platform, className }: EditorialTipsProps) {
  if (!platform) {
    return (
      <div className={cn("rounded-lg border border-dashed p-4 bg-muted/30", className)}>
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p>
              Sélectionnez un réseau dans la prévisualisation pour voir les conseils éditoriaux adaptés.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tips = EDITORIAL_TIPS[platform];
  const Icon = tips.icon;

  return (
    <div className={cn("rounded-lg border p-4 bg-muted/20", className)}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color: tips.color }} />
          <span className="text-sm font-medium">Conseils éditoriaux</span>
        </div>

        {/* Content */}
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground w-16 flex-shrink-0">Ton</span>
            <span>{tips.tone}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground w-16 flex-shrink-0">Style</span>
            <span>{tips.textStyle}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground w-16 flex-shrink-0">Objectif</span>
            <span>{tips.objective}</span>
          </div>
        </div>

        {/* Tips */}
        <div className="pt-2 border-t border-dashed">
          <ul className="space-y-1">
            {tips.tips.map((tip, index) => (
              <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Compact inline version for the preview area
export function EditorialTipsInline({ platform }: { platform: SocialPlatform | null }) {
  if (!platform) return null;

  const tips = EDITORIAL_TIPS[platform];

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-md px-3 py-2">
      <Info className="h-3.5 w-3.5 flex-shrink-0" />
      <span>
        <strong className="font-medium text-foreground">{tips.tone}</strong> · {tips.textStyle}
      </span>
    </div>
  );
}
