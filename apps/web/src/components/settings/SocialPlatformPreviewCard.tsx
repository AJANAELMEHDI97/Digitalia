import { Linkedin, Facebook, Instagram, Twitter, Building2, Info, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type SocialPlatformId = "linkedin" | "facebook" | "instagram" | "twitter" | "google_business";

interface SocialPlatformPreviewCardProps {
  platform: SocialPlatformId;
  name: string;
  description?: string;
}

const PLATFORM_ICONS: Record<SocialPlatformId, LucideIcon> = {
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  google_business: Building2,
};

const PLATFORM_COLORS: Record<SocialPlatformId, { bg: string; text: string }> = {
  linkedin: { bg: "bg-[#0A66C2]/10", text: "text-[#0A66C2]" },
  facebook: { bg: "bg-[#1877F2]/10", text: "text-[#1877F2]" },
  instagram: { bg: "bg-[#E1306C]/10", text: "text-[#E1306C]" },
  twitter: { bg: "bg-zinc-900/10 dark:bg-zinc-100/10", text: "text-zinc-900 dark:text-zinc-100" },
  google_business: { bg: "bg-[#4285F4]/10", text: "text-[#4285F4]" },
};

export function SocialPlatformPreviewCard({ platform, name, description }: SocialPlatformPreviewCardProps) {
  const Icon = PLATFORM_ICONS[platform];
  const colors = PLATFORM_COLORS[platform];

  const handleRequestActivation = () => {
    toast.success(`Demande d'activation pour ${name} enregistrée`, {
      description: "Votre demande sera traitée après validation du cadre déontologique.",
    });
  };

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-border/50 bg-muted/30">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", colors.bg)}>
          <Icon className={cn("h-5 w-5", colors.text)} />
        </div>
        <div>
          <p className="font-medium text-sm">{name}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 h-7"
            onClick={handleRequestActivation}
          >
            Demander l'activation
            <Info className="h-3 w-3 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[200px]">
          <p className="text-xs">Activation soumise à validation et configuration sécurisée.</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
