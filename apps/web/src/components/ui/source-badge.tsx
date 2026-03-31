import { Sparkles, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PublicationSource } from "@/hooks/usePublications";

interface SourceBadgeProps {
  source: PublicationSource;
  className?: string;
}

export function SourceBadge({ source, className }: SourceBadgeProps) {
  if (source === "socialpulse") {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "text-xs border-primary/50 text-primary bg-primary/5",
          className
        )}
      >
        <Sparkles className="h-3 w-3 mr-1" />
        Proposé par SocialPulse
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-xs text-muted-foreground",
        className
      )}
    >
      <User className="h-3 w-3 mr-1" />
      Créé par vous
    </Badge>
  );
}