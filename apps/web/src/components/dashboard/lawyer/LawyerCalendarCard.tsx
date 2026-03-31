import { Link } from "react-router-dom";
import { Calendar, Clock, ChevronRight, MapPin, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PlatformBadge } from "@/components/ui/platform-badge";
import { usePublications, Publication } from "@/hooks/usePublications";
import { useKeyDates } from "@/hooks/useKeyDates";
import { format, isToday, isTomorrow, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { useMemo } from "react";

interface LawyerCalendarCardProps {
  publications?: Publication[];
  loading?: boolean;
}

export function LawyerCalendarCard({ publications: propPublications, loading: propLoading }: LawyerCalendarCardProps) {
  const { publications: hookPublications, loading: hookLoading } = usePublications();
  const { getUpcomingKeyDates, loading: keyDatesLoading } = useKeyDates();

  const publications = propPublications || hookPublications;
  const loading = propLoading ?? hookLoading;

  // Get upcoming scheduled publications (next 3)
  const upcomingPublications = useMemo(() => {
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');
    
    return publications
      .filter(p => p.status === 'programme' && p.scheduled_date >= todayStr)
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
      .slice(0, 3);
  }, [publications]);

  // Get upcoming key dates (next 3)
  const upcomingKeyDates = useMemo(() => {
    return getUpcomingKeyDates(3);
  }, [getUpcomingKeyDates]);

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Aujourd'hui";
    if (isTomorrow(date)) return "Demain";
    const days = differenceInDays(date, new Date());
    if (days <= 7) return `J+${days}`;
    return format(date, 'dd MMM', { locale: fr });
  };

  const formatKeyDateLabel = (date: Date) => {
    if (isToday(date)) return "Aujourd'hui";
    if (isTomorrow(date)) return "Demain";
    const days = differenceInDays(date, new Date());
    if (days <= 7) return `J+${days}`;
    return format(date, 'dd MMM', { locale: fr });
  };

  const isLoading = loading || keyDatesLoading;

  return (
    <Card className="bg-card border transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/20">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <span>Calendrier</span>
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
            <Link to="/calendar">
              Voir tout
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : (
          <>
            {/* Upcoming publications */}
            {upcomingPublications.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Prochaines publications
                </p>
                {upcomingPublications.map((pub) => (
                  <Link
                    key={pub.id}
                    to={`/editor?id=${pub.id}`}
                    className="block p-3 rounded-lg border hover:bg-muted/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">
                          {pub.content.substring(0, 50)}...
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {pub.platform && (
                            <PlatformBadge platform={pub.platform} className="h-5" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {pub.scheduled_time?.substring(0, 5) || '09:00'}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {formatDateLabel(pub.scheduled_date)}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {upcomingPublications.length === 0 && (
              <div className="text-center py-3 text-sm text-muted-foreground">
                Aucune publication programmée
              </div>
            )}

            {/* Key dates separator */}
            {upcomingKeyDates.length > 0 && (
              <>
                <div className="border-t my-3" />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Star className="h-3 w-3" />
                    Dates clés à venir
                  </p>
                  {upcomingKeyDates.map((keyDate) => (
                    <div
                      key={keyDate.id}
                      className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{keyDate.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {keyDate.description}
                          </p>
                        </div>
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs shrink-0">
                          {keyDate.date ? formatKeyDateLabel(keyDate.date) : keyDate.month_day}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
