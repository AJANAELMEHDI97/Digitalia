import { AlertTriangle, Clock, CalendarX, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FirmStats } from "@/hooks/useCMWorkspace";
import { Publication } from "@/hooks/usePublications";
import { differenceInDays, parseISO, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

interface CMEditorialAlertsProps {
  firmStats: FirmStats[];
  allPublications: Publication[];
}

interface Alert {
  type: 'warning' | 'info';
  icon: React.ElementType;
  message: string;
  firmName?: string;
}

export function CMEditorialAlerts({ firmStats, allPublications }: CMEditorialAlertsProps) {
  const alerts: Alert[] = [];

  // Check for old drafts (more than 7 days)
  const oldDrafts = allPublications.filter(p => {
    if (p.status !== 'brouillon') return false;
    const createdDate = parseISO(p.created_at);
    return differenceInDays(new Date(), createdDate) > 7;
  });

  if (oldDrafts.length > 0) {
    alerts.push({
      type: 'warning',
      icon: Clock,
      message: `${oldDrafts.length} brouillon${oldDrafts.length > 1 ? 's' : ''} datent de plus de 7 jours`,
    });
  }

  // Check for firms with no activity this week
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  firmStats.forEach(fs => {
    const firmPubs = allPublications.filter(p => p.law_firm_id === fs.firm.id);
    const hasActivityThisWeek = firmPubs.some(p => {
      const scheduledDate = parseISO(p.scheduled_date);
      return isWithinInterval(scheduledDate, { start: weekStart, end: weekEnd });
    });

    if (!hasActivityThisWeek && fs.total > 0) {
      alerts.push({
        type: 'info',
        icon: CalendarX,
        message: `Aucune publication programmée cette semaine`,
        firmName: fs.firm.name,
      });
    }
  });

  // Check for firms with many pending validations
  firmStats.forEach(fs => {
    if (fs.pending >= 3) {
      alerts.push({
        type: 'warning',
        icon: AlertTriangle,
        message: `${fs.pending} publications en attente de validation`,
        firmName: fs.firm.name,
      });
    }
  });

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            Alertes éditoriales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            ✓ Aucune alerte pour le moment
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Alertes éditoriales
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {alerts.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.slice(0, 5).map((alert, index) => (
          <div 
            key={index}
            className={`flex items-start gap-2 p-2 rounded-lg ${
              alert.type === 'warning' ? 'bg-amber-50 dark:bg-amber-950/20' : 'bg-muted/50'
            }`}
          >
            <alert.icon className={`h-4 w-4 mt-0.5 shrink-0 ${
              alert.type === 'warning' ? 'text-amber-600' : 'text-muted-foreground'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground">{alert.message}</p>
              {alert.firmName && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Building2 className="h-3 w-3" />
                  {alert.firmName}
                </p>
              )}
            </div>
          </div>
        ))}
        {alerts.length > 5 && (
          <p className="text-xs text-muted-foreground text-center pt-1">
            +{alerts.length - 5} autre{alerts.length - 5 > 1 ? 's' : ''} alerte{alerts.length - 5 > 1 ? 's' : ''}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
