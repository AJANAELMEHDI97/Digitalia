import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { JudicialEvent } from "@/hooks/useJudicialEvents";
import { 
  LEGAL_THEMATICS, 
  SENSITIVITY_CONFIG 
} from "@/data/mockJudicialEvents";
import { 
  X, 
  Scale,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  MessageCircle,
  TrendingUp,
  ExternalLink,
  Calendar as CalendarIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface JudicialEventDetailPanelProps {
  event: JudicialEvent;
  onClose: () => void;
  onCreatePublication?: () => void;
  onContactCM?: () => void;
}

const SENSITIVITY_ICONS = {
  opportune: CheckCircle,
  surveiller: Eye,
  eviter: XCircle,
};

export function JudicialEventDetailPanel({ 
  event, 
  onClose,
  onCreatePublication,
  onContactCM
}: JudicialEventDetailPanelProps) {
  const navigate = useNavigate();
  const thematicKey = event.thematic as keyof typeof LEGAL_THEMATICS;
  const thematic = LEGAL_THEMATICS[thematicKey] || { label: event.thematic, color: "bg-gray-500" };
  const eventSensitivity = event.sensitivity || "surveiller";
  const sensitivity = SENSITIVITY_CONFIG[eventSensitivity];
  const SensitivityIcon = SENSITIVITY_ICONS[eventSensitivity];
  
  const formattedDate = format(parseISO(event.date), "d MMMM yyyy", { locale: fr });
  const formattedEndDate = event.end_date 
    ? format(parseISO(event.end_date), "d MMMM yyyy", { locale: fr }) 
    : null;

  const handleViewTrend = (trendId: string) => {
    navigate(`/trends?search=${encodeURIComponent(trendId)}`);
  };

  const handleContactCM = () => {
    if (onContactCM) {
      onContactCM();
    } else {
      navigate("/assistant");
    }
  };

  return (
    <Card className="border-l-4 border-l-[hsl(var(--event-text))] animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg judicial-event">
              <Scale className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base leading-tight">{event.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {formattedDate}
                  {formattedEndDate && ` - ${formattedEndDate}`}
                </Badge>
                <Badge className={cn(thematic.color, "text-white text-xs")}>
                  {thematic.label}
                </Badge>
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
        <p className="text-sm text-muted-foreground leading-relaxed">
          {event.description}
        </p>

        {/* Sensitivity indicator */}
        <div className={cn("rounded-lg p-3", sensitivity.bgColor)}>
          <div className="flex items-start gap-2">
            <SensitivityIcon className={cn("h-5 w-5 flex-shrink-0", sensitivity.color)} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("text-sm font-semibold", sensitivity.color)}>
                  {sensitivity.label}
                </span>
              </div>
              {event.sensitivity_reason && (
                <p className="text-sm text-muted-foreground">
                  {event.sensitivity_reason}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Speaking guidance */}
        {event.speaking_guidance && (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">Conseil éditorial</p>
                <p className="text-sm text-muted-foreground">{event.speaking_guidance}</p>
              </div>
            </div>
          </div>
        )}

        {/* Linked trends */}
        {event.linked_trends && event.linked_trends.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Tendances liées</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {event.linked_trends.map((trend) => (
                <Badge 
                  key={trend} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => handleViewTrend(trend)}
                >
                  #{trend}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 border-t space-y-2">
          {eventSensitivity === "opportune" && onCreatePublication && (
            <Button onClick={onCreatePublication} className="w-full">
              Créer une publication
            </Button>
          )}
          
          {eventSensitivity === "surveiller" && (
            <>
              <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                Ce sujet nécessite une approche prudente
              </p>
              <div className="flex gap-2">
                {onCreatePublication && (
                  <Button variant="outline" onClick={onCreatePublication} className="flex-1">
                    Créer avec précaution
                  </Button>
                )}
                <Button variant="secondary" onClick={handleContactCM} className="flex-1">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contacter mon CM
                </Button>
              </div>
            </>
          )}

          {eventSensitivity === "eviter" && (
            <>
              <p className="text-xs text-red-600 dark:text-red-400 text-center">
                <XCircle className="h-3 w-3 inline mr-1" />
                Il est recommandé de ne pas s'exprimer sur ce sujet
              </p>
              <Button variant="secondary" onClick={handleContactCM} className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contacter mon CM
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
