import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { Target, CheckCircle2, Sparkles } from "lucide-react";
import { Publication } from "@/hooks/usePublications";
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, startOfDay } from "date-fns";

interface WeeklyGoalChartProps {
  publications: Publication[];
  weeklyGoal?: number;
}

export function WeeklyGoalChart({ publications, weeklyGoal = 5 }: WeeklyGoalChartProps) {
  const weeklyStats = useMemo(() => {
    const today = startOfDay(new Date());
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

    const weekPublications = publications.filter(p => {
      const pubDate = parseISO(p.scheduled_date);
      return isWithinInterval(pubDate, { start: weekStart, end: weekEnd });
    });

    const programmed = weekPublications.filter(p => p.status === "programme").length;
    const validated = weekPublications.filter(p => p.status === "a_valider").length;
    const total = programmed + validated;
    const percentage = Math.min(100, Math.round((total / weeklyGoal) * 100));

    return { total, programmed, validated, percentage };
  }, [publications, weeklyGoal]);

  const chartData = [
    {
      name: "Progression",
      value: weeklyStats.percentage,
      fill: weeklyStats.percentage >= 100 
        ? "hsl(var(--chart-1))" 
        : weeklyStats.percentage >= 60 
          ? "hsl(var(--primary))" 
          : "#f59e0b",
    }
  ];

  const isGoalReached = weeklyStats.percentage >= 100;

  return (
    <Card className={`
      bg-card border transition-all duration-200 hover:shadow-md
      ${isGoalReached ? 'border-emerald-200 dark:border-emerald-800/30' : ''}
    `}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          <div className={`p-2 rounded-xl ${isGoalReached ? 'bg-emerald-100 dark:bg-emerald-900/20' : 'bg-amber-100 dark:bg-amber-900/20'}`}>
            {isGoalReached ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <Target className="h-4 w-4 text-amber-600" />
            )}
          </div>
          <span>Objectif hebdomadaire</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex items-center gap-6">
          <div className="relative h-[120px] w-[120px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="72%" 
                outerRadius="100%" 
                data={chartData}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  background={{ fill: 'hsl(var(--muted))' }}
                  dataKey="value"
                  cornerRadius={12}
                  fill={chartData[0].fill}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold tracking-tight tabular-nums">{weeklyStats.percentage}%</span>
              {isGoalReached && <Sparkles className="h-4 w-4 text-amber-500 mt-1" />}
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <div className="text-3xl font-bold tracking-tight tabular-nums">
                {weeklyStats.total} <span className="text-lg font-normal text-muted-foreground">/ {weeklyGoal}</span>
              </div>
              <p className="text-sm text-muted-foreground">publications cette semaine</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Programmées</span>
                <span className="font-semibold text-emerald-600 tabular-nums">{weeklyStats.programmed}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">En attente</span>
                <span className="font-semibold text-amber-600 tabular-nums">{weeklyStats.validated}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
