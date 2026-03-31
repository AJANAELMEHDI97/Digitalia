import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MessageSquare, CheckCircle, Star, TrendingUp, TrendingDown } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

// Demo data for the stats
const DEMO_KPIS = {
  avgResponseTime: "2h 15min",
  conversationsThisMonth: 47,
  resolutionRate: 94,
  satisfactionScore: 4.8,
};

const DEMO_ACTIVITY = [
  { day: "Lun", opened: 8, closed: 6 },
  { day: "Mar", opened: 5, closed: 7 },
  { day: "Mer", opened: 12, closed: 10 },
  { day: "Jeu", opened: 6, closed: 8 },
  { day: "Ven", opened: 9, closed: 11 },
  { day: "Sam", opened: 2, closed: 3 },
  { day: "Dim", opened: 1, closed: 2 },
];

const DEMO_BY_TYPE = [
  { type: "Modification", count: 18, percentage: 38 },
  { type: "Question", count: 15, percentage: 32 },
  { type: "Urgence", count: 8, percentage: 17 },
  { type: "Autre", count: 6, percentage: 13 },
];

const DEMO_BY_URGENCY = [
  { level: "Basse", count: 12, color: "bg-emerald-500" },
  { level: "Normale", count: 28, color: "bg-amber-500" },
  { level: "Haute", count: 7, color: "bg-red-500" },
];

const DEMO_TRENDS = {
  responseTime: { value: -12, label: "vs mois dernier" },
  conversations: { value: +8, label: "vs mois dernier" },
  resolution: { value: +3, label: "vs mois dernier" },
};

const chartConfig = {
  opened: {
    label: "Ouvertes",
    color: "hsl(var(--primary))",
  },
  closed: {
    label: "Fermées",
    color: "hsl(var(--muted-foreground))",
  },
};

export function CMStats() {
  return (
    <div className="space-y-6">
      {/* KPIs Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold">{DEMO_KPIS.avgResponseTime}</p>
                <p className="text-xs text-muted-foreground">Temps de réponse moyen</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <TrendingDown className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">{DEMO_TRENDS.responseTime.value}%</span>
              <span className="text-muted-foreground">{DEMO_TRENDS.responseTime.label}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/50">
                <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold">{DEMO_KPIS.conversationsThisMonth}</p>
                <p className="text-xs text-muted-foreground">Conversations ce mois</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">+{DEMO_TRENDS.conversations.value}%</span>
              <span className="text-muted-foreground">{DEMO_TRENDS.conversations.label}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold">{DEMO_KPIS.resolutionRate}%</p>
                <p className="text-xs text-muted-foreground">Taux de résolution</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">+{DEMO_TRENDS.resolution.value}%</span>
              <span className="text-muted-foreground">{DEMO_TRENDS.resolution.label}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/50">
                <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold">{DEMO_KPIS.satisfactionScore}/5</p>
                <p className="text-xs text-muted-foreground">Score de satisfaction</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              Basé sur 23 évaluations
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Activité des 7 derniers jours</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={DEMO_ACTIVITY} barGap={2}>
              <XAxis 
                dataKey="day" 
                tickLine={false} 
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="opened" 
                fill="var(--color-opened)" 
                radius={[4, 4, 0, 0]}
                name="Ouvertes"
              />
              <Bar 
                dataKey="closed" 
                fill="var(--color-closed)" 
                radius={[4, 4, 0, 0]}
                name="Fermées"
              />
            </BarChart>
          </ChartContainer>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-primary" />
              <span className="text-xs text-muted-foreground">Ouvertes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-muted-foreground" />
              <span className="text-xs text-muted-foreground">Fermées</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Par type de demande</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {DEMO_BY_TYPE.map((item) => (
              <div key={item.type} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.type}</span>
                    <span className="text-muted-foreground">{item.count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right">{item.percentage}%</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* By Urgency */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Par niveau d'urgence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {DEMO_BY_URGENCY.map((item) => (
              <div key={item.level} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="flex-1 text-sm">{item.level}</span>
                <span className="text-sm font-medium">{item.count}</span>
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {Math.round((item.count / 47) * 100)}%
                </span>
              </div>
            ))}
            <div className="pt-3 mt-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total conversations</span>
                <span className="font-medium">47</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
