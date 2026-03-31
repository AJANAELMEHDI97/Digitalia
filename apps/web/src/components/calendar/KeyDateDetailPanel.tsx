import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlatformBadge } from "@/components/ui/platform-badge";
import type { KeyDate } from "@/hooks/useKeyDates";
import { KEY_DATE_CATEGORIES } from "@/data/mockKeyDates";
import { 
  CalendarDays, 
  Lightbulb, 
  X, 
  Megaphone,
  RefreshCw,
  Calendar as CalendarIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KeyDateDetailPanelProps {
  keyDate: KeyDate;
  onClose: () => void;
  onCreatePublication?: () => void;
}

export function KeyDateDetailPanel({ 
  keyDate, 
  onClose,
  onCreatePublication 
}: KeyDateDetailPanelProps) {
  const categoryKey = keyDate.category as keyof typeof KEY_DATE_CATEGORIES;
  const category = KEY_DATE_CATEGORIES[categoryKey] || { label: keyDate.category, color: "bg-gray-500" };
  
  // Format date for display (using month_day from database)
  const [month, day] = keyDate.month_day.split("-");
  const monthNames = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
  ];
  const displayDate = `${parseInt(day)} ${monthNames[parseInt(month) - 1]}`;

  return (
    <Card className="border-l-4 border-l-[hsl(var(--keydate-text))] animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg keydate">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base leading-tight">{keyDate.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant="outline" className="text-xs">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {displayDate}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {category.label}
                </Badge>
                {keyDate.is_recurring && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Récurrent
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Description */}
        <div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {keyDate.description}
          </p>
        </div>

        {/* Importance */}
        {keyDate.importance && (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">Pourquoi cette date est importante</p>
                <p className="text-sm text-muted-foreground">{keyDate.importance}</p>
              </div>
            </div>
          </div>
        )}

        {/* Speaking opportunities */}
        {keyDate.speaking_opportunities && keyDate.speaking_opportunities.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Megaphone className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Opportunités de prise de parole</p>
            </div>
            <ul className="space-y-1.5">
              {keyDate.speaking_opportunities.map((opp, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                  {opp}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended platforms */}
        {keyDate.recommended_platforms && keyDate.recommended_platforms.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Réseaux recommandés</p>
            <div className="flex items-center gap-2">
              {keyDate.recommended_platforms.map((platform) => (
                <PlatformBadge key={platform} platform={platform as "linkedin" | "instagram" | "facebook" | "twitter"} />
              ))}
            </div>
          </div>
        )}

        {/* Action */}
        {onCreatePublication && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-3">
              Vous n'êtes pas obligé de publier. Cette date est une suggestion d'opportunité éditoriale.
            </p>
            <Button onClick={onCreatePublication} className="w-full">
              Créer une publication pour cette date
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
