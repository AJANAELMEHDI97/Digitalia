import { useState } from "react";
import { Copy, Linkedin, Instagram, Facebook, Twitter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePublications, Publication, SocialPlatform } from "@/hooks/usePublications";
import { toast } from "@/hooks/use-toast";

interface DuplicateButtonProps {
  publication: Publication;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  onDuplicated?: (newPublication: Publication) => void;
}

const PLATFORMS: { value: SocialPlatform; label: string; icon: typeof Linkedin; color: string }[] = [
  { value: "linkedin", label: "LinkedIn", icon: Linkedin, color: "#0A66C2" },
  { value: "instagram", label: "Instagram", icon: Instagram, color: "#E1306C" },
  { value: "facebook", label: "Facebook", icon: Facebook, color: "#1877F2" },
  { value: "twitter", label: "X (Twitter)", icon: Twitter, color: "#000000" },
];

export function DuplicateButton({ 
  publication, 
  variant = "outline", 
  size = "sm",
  onDuplicated 
}: DuplicateButtonProps) {
  const { createPublication } = usePublications();
  const [loading, setLoading] = useState(false);
  const [loadingPlatform, setLoadingPlatform] = useState<SocialPlatform | null>(null);

  // Filter out the current platform if set
  const availablePlatforms = PLATFORMS.filter(p => p.value !== publication.platform);

  const handleDuplicate = async (targetPlatform: SocialPlatform) => {
    setLoading(true);
    setLoadingPlatform(targetPlatform);

    const newPublication = await createPublication({
      content: publication.content,
      image_url: publication.image_url,
      scheduled_date: publication.scheduled_date,
      scheduled_time: publication.scheduled_time,
      status: "brouillon",
      source: publication.source,
      platform: targetPlatform,
      parent_id: publication.parent_id || publication.id,
    });

    setLoading(false);
    setLoadingPlatform(null);

    if (newPublication) {
      const platformLabel = PLATFORMS.find(p => p.value === targetPlatform)?.label || targetPlatform;
      toast({
        title: "Version créée",
        description: `Une version pour ${platformLabel} a été créée en brouillon.`,
      });
      onDuplicated?.(newPublication);
    }
  };

  if (availablePlatforms.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <Copy className="h-4 w-4 mr-1.5" />
          )}
          Décliner pour...
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {availablePlatforms.map((platform) => {
          const Icon = platform.icon;
          const isLoading = loadingPlatform === platform.value;
          
          return (
            <DropdownMenuItem
              key={platform.value}
              onClick={() => handleDuplicate(platform.value)}
              disabled={loading}
              className="cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Icon className="h-4 w-4 mr-2" style={{ color: platform.color }} />
              )}
              {platform.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
