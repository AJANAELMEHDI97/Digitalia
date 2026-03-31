import { CalendarDays, Scale, Sparkles, ArrowRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO, isAfter } from "date-fns";
import { fr } from "date-fns/locale";
import type { KeyDate } from "@/hooks/useKeyDates";
import type { JudicialEvent } from "@/hooks/useJudicialEvents";
import { useNavigate } from "react-router-dom";

interface EditorialOpportunitiesPanelProps {
  keyDates: KeyDate[];
  judicialEvents: JudicialEvent[];
  onCreateFromKeyDate: (keyDate: KeyDate) => void;
  onCreateFromEvent: (event: JudicialEvent) => void;
}

export function EditorialOpportunitiesPanel({
  keyDates,
  judicialEvents,
  onCreateFromKeyDate,
  onCreateFromEvent,
}: EditorialOpportunitiesPanelProps) {
  const navigate = useNavigate();
  const now = new Date();

  // Get upcoming key dates (next 3)
  const upcomingKeyDates = keyDates
    .filter(kd => {
      if (!kd.date) return false;
      return isAfter(kd.date, now);
    })
    .sort((a, b) => (a.date!.getTime() - b.date!.getTime()))
    .slice(0, 3);

  // Get upcoming judicial events (next 3, opportune ones first)
  const upcomingEvents = judicialEvents
    .filter(e => isAfter(parseISO(e.date), now) && e.sensitivity !== "eviter")
    .sort((a, b) => {
      if (a.sensitivity === "opportune" && b.sensitivity !== "opportune") return -1;
      if (b.sensitivity === "opportune" && a.sensitivity !== "opportune") return 1;
      return parseISO(a.date).getTime() - parseISO(b.date).getTime();
    })
    .slice(0, 3);

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Opportunités éditoriales
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Dates */}
        {upcomingKeyDates.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <CalendarDays className="h-3.5 w-3.5 text-[hsl(var(--keydate-text))]" />
              <span className="text-xs font-medium text-muted-foreground">Dates clés à venir</span>
            </div>
            <div className="space-y-2">
              {upcomingKeyDates.map(kd => (
                <div key={kd.id} className="flex items-start justify-between gap-2 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{kd.title}</p>
                    {kd.date && (
                      <p className="text-xs text-muted-foreground">
                        {format(kd.date, "d MMM", { locale: fr })}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 flex-shrink-0"
                    onClick={() => onCreateFromKeyDate(kd)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Judicial Events */}
        {upcomingEvents.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Scale className="h-3.5 w-3.5 text-[hsl(var(--event-text))]" />
              <span className="text-xs font-medium text-muted-foreground">Actualités judiciaires</span>
            </div>
            <div className="space-y-2">
              {upcomingEvents.map(event => (
                <div key={event.id} className="flex items-start justify-between gap-2 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(event.date), "d MMM", { locale: fr })}
                      </p>
                      {event.sensitivity === "opportune" && (
                        <Badge variant="opportune" className="text-[10px] px-1.5 py-0">Opportune</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 flex-shrink-0"
                    onClick={() => onCreateFromEvent(event)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcomingKeyDates.length === 0 && upcomingEvents.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune opportunité éditoriale à venir
          </p>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => navigate("/trends")}
        >
          Voir toutes les actualités
          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
