import { Link2, ShieldCheck, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SocialPlatformPreviewCard, SocialPlatformId } from "./SocialPlatformPreviewCard";

interface PlatformInfo {
  id: SocialPlatformId;
  name: string;
  description: string;
}

const PLATFORMS: PlatformInfo[] = [
  { id: "linkedin", name: "LinkedIn", description: "Partagez du contenu professionnel" },
  { id: "facebook", name: "Facebook", description: "Publiez sur votre page Facebook" },
  { id: "instagram", name: "Instagram", description: "Partagez des visuels et stories" },
  { id: "twitter", name: "X (Twitter)", description: "Publiez des tweets" },
  { id: "google_business", name: "Google Business", description: "Gérez votre fiche Google" },
];

export function SocialConnectionsPreviewTab() {
  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Réseaux sociaux
            </CardTitle>
            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Contrôle avocat · Aucun automatisme
            </Badge>
          </div>
          <CardDescription>
            Gérez vos connexions en toute sécurité
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <AlertDescription className="text-emerald-700 dark:text-emerald-300 text-sm">
              <p className="font-medium text-emerald-800 dark:text-emerald-200">
                Connexions sécurisées et encadrées
              </p>
              <span className="mt-1 block">
                Les réseaux sociaux sont activables uniquement après validation du cadre déontologique et des paramètres du cabinet.
              </span>
              <span className="text-xs opacity-90 mt-1 block">
                Aucune publication automatique n'est possible sans accord explicite de l'avocat.
              </span>
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {PLATFORMS.map((platform) => (
              <SocialPlatformPreviewCard
                key={platform.id}
                platform={platform.id}
                name={platform.name}
                description={platform.description}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 pt-4 border-t border-border/50 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Toutes les connexions sont soumises à validation et configuration sécurisée.</span>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
