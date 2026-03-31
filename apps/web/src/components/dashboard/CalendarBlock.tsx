import { Link } from "react-router-dom";
import { Calendar, Star, ArrowRight, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlatformBadge } from "@/components/ui/platform-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Publication } from "@/hooks/usePublications";
import { useKeyDates } from "@/hooks/useKeyDates";
import { format, parseISO, isAfter, startOfDay, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";

interface CalendarBlockProps {
  publications: Publication[];
  loading: boolean;
}

export function CalendarBlock({ publications, loading }: CalendarBlockProps) {
  const today = startOfDay(new Date());
  const { getUpcomingKeyDates, loading: keyDatesLoading } = useKeyDates();
  
  const upcomingPublications = publications
    .filter((p) => p.status === "programme" && isAfter(parseISO(p.scheduled_date), today))
    .sort((a, b) => parseISO(a.scheduled_date).getTime() - parseISO(b.scheduled_date).getTime())
    .slice(0, 3);

  const upcomingKeyDates = getUpcomingKeyDates(3);

  return (
    <Card className="bg-card border transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="p-2 rounded-xl bg-primary/10">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <span>Calendrier & Opportunités</span>
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
            <Link to="/calendar">
              Voir le calendrier
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upcoming publications */}
        <div>
          <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            Prochaines publications
          </h4>
          {loading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : upcomingPublications.length === 0 ? (
            <p className="text-sm text-muted-foreground py-3">Aucune publication programmée</p>
          ) : (
            <div className="space-y-2">
              {upcomingPublications.map((pub) => {
                const days = differenceInDays(parseISO(pub.scheduled_date), today);
                return (
                  <Link
                    key={pub.id}
                    to="/calendar"
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all duration-200"
                  >
                    <div className="text-center min-w-[48px]">
                      <div className="text-2xl font-bold text-primary tabular-nums">
                        {format(parseISO(pub.scheduled_date), "d")}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase font-medium">
                        {format(parseISO(pub.scheduled_date), "MMM", { locale: fr })}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{pub.content}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {pub.platform && <PlatformBadge platform={pub.platform} />}
                        <span className="text-xs text-muted-foreground">
                          {pub.scheduled_time.slice(0, 5)}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs font-medium">
                      {days === 0 ? "Aujourd'hui" : days === 1 ? "Demain" : `J+${days}`}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Key dates */}
        <div>
          <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <Star className="h-3.5 w-3.5" />
            Dates clés à venir
          </h4>
          {keyDatesLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : upcomingKeyDates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-3">Aucune date clé à venir</p>
          ) : (
            <div className="space-y-2">
              {upcomingKeyDates.map((kd) => {
                const keyDateDate = kd.date;
                const days = keyDateDate ? differenceInDays(keyDateDate, today) : 0;
                
                return (
                  <Link
                    key={kd.id}
                    to="/calendar"
                    className="flex items-center gap-4 p-3 rounded-xl border border-dashed border-primary/20 hover:bg-primary/5 transition-all duration-200"
                  >
                    <div className="text-center min-w-[48px]">
                      <div className="text-2xl font-bold text-primary tabular-nums">
                        {keyDateDate ? format(keyDateDate, "d") : "-"}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase font-medium">
                        {keyDateDate ? format(keyDateDate, "MMM", { locale: fr }) : "-"}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{kd.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{kd.category}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs font-medium bg-primary/10 text-primary border-0">
                      {days === 0 ? "Aujourd'hui" : `J+${days}`}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
