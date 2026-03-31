import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { THEMATIC_LABELS, type MediaItem } from "@/data/mockMedia";
import { CheckCircle2, Eye, Linkedin, Instagram, Facebook, Twitter } from "lucide-react";

interface MediaCardProps {
  media: MediaItem;
  onViewDetails: (media: MediaItem) => void;
}

const PLATFORM_ICONS = {
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
};

export function MediaCard({ media, onViewDetails }: MediaCardProps) {
  return (
    <Card className="group overflow-hidden border-border/50 bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={media.imageUrl}
          alt={media.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* View button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="sm"
            className="gap-2 shadow-lg"
            onClick={() => onViewDetails(media)}
          >
            <Eye className="h-4 w-4" />
            Voir détails
          </Button>
        </div>

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-emerald-500/90 text-white border-0 gap-1 text-xs">
            <CheckCircle2 className="h-3 w-3" />
            Validé
          </Badge>
        </div>

        {/* Usage count */}
        {media.usageCount > 0 && (
          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Badge variant="secondary" className="bg-black/50 text-white border-0 text-xs">
              {media.usageCount} utilisation{media.usageCount > 1 ? 's' : ''}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-foreground line-clamp-1">
          {media.title}
        </h3>

        {/* Thematic */}
        <Badge variant="outline" className="text-xs">
          {THEMATIC_LABELS[media.thematic]}
        </Badge>

        {/* Platforms */}
        <div className="flex items-center gap-1.5">
          {media.platforms.map((platform) => {
            const Icon = PLATFORM_ICONS[platform];
            return (
              <div
                key={platform}
                className="p-1.5 rounded-md bg-muted/50"
              >
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
