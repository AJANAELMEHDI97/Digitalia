import { Linkedin, Instagram, Facebook, Twitter, Newspaper, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SocialPlatform } from "@/hooks/usePublications";

interface PlatformBadgeProps {
  platform: SocialPlatform | null;
  className?: string;
}

const PLATFORM_CONFIG: Record<SocialPlatform, { label: string; icon: typeof Linkedin; bgColor: string; textColor: string }> = {
  linkedin: {
    label: "LinkedIn",
    icon: Linkedin,
    bgColor: "bg-[#0A66C2]/10",
    textColor: "text-[#0A66C2]",
  },
  instagram: {
    label: "Instagram",
    icon: Instagram,
    bgColor: "bg-[#E1306C]/10",
    textColor: "text-[#E1306C]",
  },
  facebook: {
    label: "Facebook",
    icon: Facebook,
    bgColor: "bg-[#1877F2]/10",
    textColor: "text-[#1877F2]",
  },
  twitter: {
    label: "X",
    icon: Twitter,
    bgColor: "bg-zinc-900/10 dark:bg-zinc-100/10",
    textColor: "text-zinc-900 dark:text-zinc-100",
  },
  blog: {
    label: "Blog",
    icon: Newspaper,
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-600 dark:text-purple-400",
  },
  google_business: {
    label: "Google",
    icon: Building2,
    bgColor: "bg-[#4285F4]/10",
    textColor: "text-[#4285F4]",
  },
};

export function PlatformBadge({ platform, className }: PlatformBadgeProps) {
  if (!platform) return null;

  const config = PLATFORM_CONFIG[platform];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs border-0",
        config.bgColor,
        config.textColor,
        className
      )}
    >
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}
