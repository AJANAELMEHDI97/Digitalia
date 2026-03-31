import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { THEMATIC_LABELS, type MediaItem } from "@/data/mockMedia";
import {
  CheckCircle2,
  FileText,
  Newspaper,
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
  Calendar,
  BarChart3,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MediaDetailSheetProps {
  media: MediaItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PLATFORM_ICONS = {
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
};

const PLATFORM_LABELS = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  facebook: 'Facebook',
  twitter: 'X (Twitter)',
};

export function MediaDetailSheet({ media, open, onOpenChange }: MediaDetailSheetProps) {
  const navigate = useNavigate();

  if (!media) return null;

  const handleCreatePost = () => {
    navigate(`/editor?mediaUrl=${encodeURIComponent(media.imageUrl)}`);
    onOpenChange(false);
  };

  const handleCreateArticle = () => {
    navigate(`/blog?action=create&mediaUrl=${encodeURIComponent(media.imageUrl)}`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          {/* Status */}
          <Badge className="w-fit bg-emerald-500/90 text-white border-0 gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Média validé
          </Badge>
          
          <SheetTitle className="text-xl font-bold text-left">
            {media.title}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Image Preview */}
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
            <img
              src={media.imageUrl}
              alt={media.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleCreatePost}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Créer un post
            </Button>
            <Button
              variant="outline"
              onClick={handleCreateArticle}
              className="gap-2"
            >
              <Newspaper className="h-4 w-4" />
              Créer un article
            </Button>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Usage recommandé
            </h4>
            <p className="text-sm text-foreground leading-relaxed">
              {media.description}
            </p>
          </div>

          {/* Thematic */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Thématique
            </h4>
            <Badge variant="outline" className="text-sm">
              {THEMATIC_LABELS[media.thematic]}
            </Badge>
          </div>

          {/* Compatible Platforms */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Réseaux compatibles
            </h4>
            <div className="flex flex-wrap gap-2">
              {media.platforms.map((platform) => {
                const Icon = PLATFORM_ICONS[platform];
                return (
                  <div
                    key={platform}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{PLATFORM_LABELS[platform]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content Types */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Types de contenu
            </h4>
            <div className="flex gap-2">
              {media.contentTypes.includes('post') && (
                <Badge variant="secondary" className="gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Posts
                </Badge>
              )}
              {media.contentTypes.includes('article') && (
                <Badge variant="secondary" className="gap-1.5">
                  <Newspaper className="h-3.5 w-3.5" />
                  Articles
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wider">Utilisations</span>
              </div>
              <p className="text-2xl font-bold tabular-nums">{media.usageCount}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wider">Ajouté le</span>
              </div>
              <p className="text-sm font-medium">
                {format(new Date(media.createdAt), 'd MMM yyyy', { locale: fr })}
              </p>
            </div>
          </div>

          {/* Usage History */}
          {media.usageHistory.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Historique d'utilisation
              </h4>
              <div className="space-y-2">
                {media.usageHistory.map((usage, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    {usage.type === 'post' ? (
                      <FileText className="h-4 w-4 text-primary" />
                    ) : (
                      <Newspaper className="h-4 w-4 text-primary" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{usage.title}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(usage.date), 'd MMM yyyy', { locale: fr })}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {usage.type === 'post' ? 'Post' : 'Article'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
