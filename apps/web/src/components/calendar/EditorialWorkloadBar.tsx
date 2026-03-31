import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, AlertTriangle } from "lucide-react";
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from "date-fns";
import type { Publication } from "@/hooks/usePublications";
import type { LawFirm } from "@/contexts/LawFirmContext";

interface EditorialWorkloadBarProps {
  publications: Publication[];
  assignedFirms: LawFirm[];
  currentDate: Date;
}

const PUBS_PER_FIRM_PER_MONTH = 12; // ~3/week

export function EditorialWorkloadBar({ publications, assignedFirms, currentDate }: EditorialWorkloadBarProps) {
  const stats = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    const monthPubs = publications.filter(p => {
      const d = parseISO(p.scheduled_date);
      return isWithinInterval(d, { start: monthStart, end: monthEnd });
    });

    const programmed = monthPubs.filter(p => p.status === "programme" || p.status === "publie").length;
    const total = monthPubs.length;
    const target = assignedFirms.length * PUBS_PER_FIRM_PER_MONTH;
    const remaining = Math.max(0, target - total);
    const fillRate = target > 0 ? Math.round((total / target) * 100) : 0;

    return { programmed, total, target, remaining, fillRate };
  }, [publications, assignedFirms, currentDate]);

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Charge éditoriale du mois</span>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-xs text-muted-foreground">Programmées</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-500">{stats.remaining}</div>
          <div className="text-xs text-muted-foreground">Restantes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{stats.fillRate}%</div>
          <div className="text-xs text-muted-foreground">Remplissage</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Progress value={Math.min(stats.fillRate, 100)} className="flex-1 h-2" />
        {stats.fillRate >= 80 && (
          <Badge variant="default" className="text-xs whitespace-nowrap">
            <TrendingUp className="h-3 w-3 mr-1" />
            En bonne voie
          </Badge>
        )}
        {stats.fillRate < 50 && (
          <Badge variant="destructive" className="text-xs whitespace-nowrap">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Attention
          </Badge>
        )}
      </div>
    </div>
  );
}
