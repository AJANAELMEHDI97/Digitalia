import { Link } from "react-router-dom";
import { Scale, ChevronRight, AlertTriangle, CheckCircle2, Eye, Target, Lightbulb, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useJudicialEvents } from "@/hooks/useJudicialEvents";
import { format, parseISO, differenceInDays, isToday, isTomorrow } from "date-fns";
import { fr } from "date-fns/locale";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export function LawyerJudicialEventsCard() {
  const { events, loading, getUpcomingEvents } = useJudicialEvents();

  // Get upcoming events (next 3)
  const upcomingEvents = useMemo(() => {
    return getUpcomingEvents(3);
  }, [getUpcomingEvents]);

  // Calculate opportunities stats for the enriched footer section
  const opportunitiesStats = useMemo(() => {
    const eventsToAnalyze = upcomingEvents.length > 0 ? upcomingEvents : [
      { sensitivity: 'eviter', title: 'Procès Lactalis', thematic: 'Droit pénal', id: '1' },
      { sensitivity: 'opportune', title: 'Réforme RSA - Entrée en vigueur', thematic: 'Droit social', id: '2' },
      { sensitivity: 'opportune', title: 'Nouvelles normes RGPD', thematic: 'Droit numérique', id: '3' },
    ];
    
    const opportuneEvents = eventsToAnalyze.filter(e => e.sensitivity === 'opportune');
    const surveillerEvents = eventsToAnalyze.filter(e => e.sensitivity === 'surveiller');
    
    const suggestedEvent = opportuneEvents[0] || surveillerEvents[0];
    
    return {
      opportuneCount: opportuneEvents.length,
      surveillerCount: surveillerEvents.length,
      suggestion: suggestedEvent ? {
        title: suggestedEvent.title,
        thematic: suggestedEvent.thematic,
        id: suggestedEvent.id,
      } : null,
    };
  }, [upcomingEvents]);

  const formatDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Aujourd'hui";
    if (isTomorrow(date)) return "Demain";
    const days = differenceInDays(date, new Date());
    if (days <= 7) return `J+${days}`;
    return format(date, 'dd MMM', { locale: fr });
  };

  const getSensitivityConfig = (sensitivity: string | null) => {
    switch (sensitivity) {
      case 'opportune':
        return {
          icon: <CheckCircle2 className="h-3.5 w-3.5" />,
          label: 'Opportun',
          className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
          borderClass: 'border-emerald-200 dark:border-emerald-800/50',
        };
      case 'surveiller':
        return {
          icon: <Eye className="h-3.5 w-3.5" />,
          label: 'À surveiller',
          className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
          borderClass: 'border-amber-200 dark:border-amber-800/50',
        };
      case 'eviter':
        return {
          icon: <AlertTriangle className="h-3.5 w-3.5" />,
          label: 'À éviter',
          className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
          borderClass: 'border-red-200 dark:border-red-800/50',
        };
      default:
        return {
          icon: <Scale className="h-3.5 w-3.5" />,
          label: 'Neutre',
          className: 'bg-muted text-muted-foreground',
          borderClass: 'border-muted',
        };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Demo fallback
  const displayEvents = upcomingEvents.length > 0 ? upcomingEvents : [
    { 
      id: '1', 
      title: 'Procès Lactalis - Lait contaminé', 
      date: '2025-02-15', 
      sensitivity: 'eviter' as const,
      sensitivity_reason: 'Sujet médiatiquement sensible',
      thematic: 'Droit pénal' 
    },
    { 
      id: '2', 
      title: 'Réforme RSA - Entrée en vigueur', 
      date: '2025-02-20', 
      sensitivity: 'opportune' as const,
      sensitivity_reason: 'Expertise sociale valorisable',
      thematic: 'Droit social' 
    },
    { 
      id: '3', 
      title: 'Nouvelles normes RGPD', 
      date: '2025-03-01', 
      sensitivity: 'opportune' as const,
      sensitivity_reason: 'Prise de parole pédagogique recommandée',
      thematic: 'Droit numérique' 
    },
  ];

  return (
    <Card className="bg-card border transition-all duration-200 hover:shadow-md h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/20">
              <Scale className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <span>Actualité judiciaire</span>
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
            <Link to="/calendar">
              Voir tout
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex flex-col flex-1">
        <TooltipProvider>
          {displayEvents.map((event) => {
            const config = getSensitivityConfig(event.sensitivity);
            return (
              <Tooltip key={event.id}>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "p-3 rounded-lg border cursor-help transition-all hover:shadow-sm",
                    config.borderClass,
                    "bg-card"
                  )}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{event.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {event.thematic}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge className={cn("text-xs flex items-center gap-1", config.className)}>
                          {config.icon}
                          {config.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDateLabel(event.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <p className="text-sm">{event.sensitivity_reason || 'Pas de recommandation spécifique'}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>

        {/* Section secondaire enrichie */}
        <div className="mt-auto pt-3 border-t border-muted/50 space-y-2">
          {/* Indicateur d'opportunités */}
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <Target className="h-3.5 w-3.5" />
              {opportunitiesStats.opportuneCount} opportunité{opportunitiesStats.opportuneCount > 1 ? 's' : ''} ce mois
            </span>
            {opportunitiesStats.surveillerCount > 0 && (
              <span className="text-amber-600 dark:text-amber-400">
                {opportunitiesStats.surveillerCount} à surveiller
              </span>
            )}
          </div>
          
          {/* Suggestion contextuelle */}
          {opportunitiesStats.suggestion && (
            <div className="p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/50">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Lightbulb className="h-3 w-3 text-amber-500" />
                    Suggestion
                  </p>
                  <p className="text-sm font-medium line-clamp-1 mt-0.5">
                    {opportunitiesStats.suggestion.title}
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm" className="shrink-0 h-7 text-xs">
                  <Link to={`/editor?thematic=${encodeURIComponent(opportunitiesStats.suggestion.thematic)}`}>
                    Créer
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
          
          {/* Note de pied */}
          <p className="text-[10px] text-muted-foreground text-center">
            Basé sur les tendances juridiques actuelles
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
