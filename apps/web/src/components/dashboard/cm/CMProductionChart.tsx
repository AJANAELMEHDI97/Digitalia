import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { Publication } from "@/hooks/usePublications";
import { startOfMonth, isWithinInterval, endOfMonth, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface ProductionStat {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

interface CMProductionChartProps {
  publications: Publication[];
}

export function CMProductionChart({ publications }: CMProductionChartProps) {
  const stats = useMemo<ProductionStat[]>(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Filter publications created this month
    const monthPubs = publications.filter(pub => {
      const createdAt = parseISO(pub.created_at);
      return isWithinInterval(createdAt, { start: monthStart, end: monthEnd });
    });

    const total = monthPubs.length || 1; // Avoid division by zero

    const generated = monthPubs.length;
    const validated = monthPubs.filter(p => 
      p.status === 'programme' || p.status === 'publie'
    ).length;
    const published = monthPubs.filter(p => p.status === 'publie').length;
    const refused = monthPubs.filter(p => p.status === 'refuse').length;

    return [
      {
        label: "Générées ce mois",
        value: generated,
        color: "bg-primary",
        percentage: 100,
      },
      {
        label: "Validées CM",
        value: validated,
        color: "bg-emerald-500",
        percentage: (validated / total) * 100,
      },
      {
        label: "Publiées",
        value: published,
        color: "bg-blue-500",
        percentage: (published / total) * 100,
      },
      {
        label: "Refusées",
        value: refused,
        color: "bg-destructive",
        percentage: (refused / total) * 100,
      },
    ];
  }, [publications]);

  const maxValue = Math.max(...stats.map(s => s.value), 1);

  return (
    <Card className="bg-white/50 dark:bg-card/50 backdrop-blur-sm border-white/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Production éditoriale
        </CardTitle>
        <p className="text-xs text-muted-foreground">Ce mois-ci</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {stats.map((stat) => (
          <div key={stat.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{stat.label}</span>
              <span className="font-medium">{stat.value}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-500", stat.color)}
                style={{ width: `${(stat.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
