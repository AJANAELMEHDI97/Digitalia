import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { startOfWeek, endOfWeek, addWeeks, parseISO, isWithinInterval, format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Publication } from "@/hooks/usePublications";
import type { LawFirm } from "@/contexts/LawFirmContext";

interface EditorialGapsAlertsProps {
  publications: Publication[];
  assignedFirms: LawFirm[];
  currentDate: Date;
}

export function EditorialGapsAlerts({ publications, assignedFirms, currentDate }: EditorialGapsAlertsProps) {
  const [showAll, setShowAll] = useState(false);

  const gaps = useMemo(() => {
    const thisWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const nextWeekStart = startOfWeek(addWeeks(currentDate, 1), { weekStartsOn: 1 });
    const nextWeekEnd = endOfWeek(addWeeks(currentDate, 1), { weekStartsOn: 1 });

    const alerts: { firmName: string; firmId: string; period: string }[] = [];

    assignedFirms.forEach(firm => {
      const firmPubs = publications.filter(p => p.law_firm_id === firm.id);

      const thisWeekPubs = firmPubs.filter(p => {
        const d = parseISO(p.scheduled_date);
        return isWithinInterval(d, { start: thisWeekStart, end: thisWeekEnd });
      });

      const nextWeekPubs = firmPubs.filter(p => {
        const d = parseISO(p.scheduled_date);
        return isWithinInterval(d, { start: nextWeekStart, end: nextWeekEnd });
      });

      if (thisWeekPubs.length === 0) {
        alerts.push({
          firmName: firm.name,
          firmId: firm.id,
          period: "cette semaine"
        });
      }

      if (nextWeekPubs.length === 0) {
        alerts.push({
          firmName: firm.name,
          firmId: firm.id,
          period: "semaine prochaine"
        });
      }
    });

    return alerts;
  }, [publications, assignedFirms, currentDate]);

  if (gaps.length === 0) return null;

  const visibleGaps = showAll ? gaps : gaps.slice(0, 3);

  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
          Trous éditoriaux détectés
        </span>
        <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
          {gaps.length}
        </Badge>
      </div>
      <div className="space-y-1">
        {visibleGaps.map((gap, i) => (
          <p key={`${gap.firmId}-${gap.period}-${i}`} className="text-xs text-amber-700 dark:text-amber-400">
            <span className="font-medium">{gap.firmName}</span> : aucune publication prévue {gap.period}
          </p>
        ))}
      </div>
      {gaps.length > 3 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="mt-2 h-7 text-xs text-amber-600"
        >
          {showAll ? (
            <>Voir moins <ChevronUp className="h-3 w-3 ml-1" /></>
          ) : (
            <>+{gaps.length - 3} autres <ChevronDown className="h-3 w-3 ml-1" /></>
          )}
        </Button>
      )}
    </div>
  );
}
