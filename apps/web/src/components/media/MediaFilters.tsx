import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { THEMATIC_LABELS, type MediaItem } from "@/data/mockMedia";
import { Linkedin, Instagram, Facebook, Twitter, FileText, Newspaper } from "lucide-react";

interface MediaFiltersProps {
  selectedThematic: MediaItem['thematic'] | 'all';
  selectedContentType: 'all' | 'post' | 'article';
  selectedPlatform: 'all' | 'linkedin' | 'instagram' | 'facebook' | 'twitter';
  onThematicChange: (value: MediaItem['thematic'] | 'all') => void;
  onContentTypeChange: (value: 'all' | 'post' | 'article') => void;
  onPlatformChange: (value: 'all' | 'linkedin' | 'instagram' | 'facebook' | 'twitter') => void;
}

const THEMATICS: (MediaItem['thematic'] | 'all')[] = [
  'all', 'travail', 'penal', 'famille', 'numerique', 'immobilier', 'commercial', 'general'
];

const PLATFORMS = [
  { value: 'all' as const, label: 'Tous', icon: null },
  { value: 'linkedin' as const, label: 'LinkedIn', icon: Linkedin },
  { value: 'instagram' as const, label: 'Instagram', icon: Instagram },
  { value: 'facebook' as const, label: 'Facebook', icon: Facebook },
  { value: 'twitter' as const, label: 'X', icon: Twitter },
];

export function MediaFilters({
  selectedThematic,
  selectedContentType,
  selectedPlatform,
  onThematicChange,
  onContentTypeChange,
  onPlatformChange,
}: MediaFiltersProps) {
  return (
    <div className="space-y-6">
      {/* Thématiques */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Thématique juridique
        </h3>
        <div className="flex flex-wrap gap-2">
          {THEMATICS.map((thematic) => (
            <Badge
              key={thematic}
              variant={selectedThematic === thematic ? "default" : "outline"}
              className={`cursor-pointer transition-all ${
                selectedThematic === thematic 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              }`}
              onClick={() => onThematicChange(thematic)}
            >
              {thematic === 'all' ? 'Toutes' : THEMATIC_LABELS[thematic]}
            </Badge>
          ))}
        </div>
      </div>

      {/* Type de contenu */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Type de contenu
        </h3>
        <div className="flex gap-2">
          <Button
            variant={selectedContentType === 'all' ? "default" : "outline"}
            size="sm"
            onClick={() => onContentTypeChange('all')}
            className="gap-2"
          >
            Tous
          </Button>
          <Button
            variant={selectedContentType === 'post' ? "default" : "outline"}
            size="sm"
            onClick={() => onContentTypeChange('post')}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Posts
          </Button>
          <Button
            variant={selectedContentType === 'article' ? "default" : "outline"}
            size="sm"
            onClick={() => onContentTypeChange('article')}
            className="gap-2"
          >
            <Newspaper className="h-4 w-4" />
            Articles
          </Button>
        </div>
      </div>

      {/* Réseau cible */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Réseau cible
        </h3>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant={selectedPlatform === value ? "default" : "outline"}
              size="sm"
              onClick={() => onPlatformChange(value)}
              className="gap-2"
            >
              {Icon && <Icon className="h-4 w-4" />}
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
