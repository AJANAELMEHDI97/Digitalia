import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

const data = [
  { name: "Nouveaux", value: 41200, percentage: 32, trend: "up" as const },
  { name: "Abonnés", value: 33500, percentage: 26, trend: "up" as const },
  { name: "Partages", value: 22300, percentage: 17, trend: "up" as const },
  { name: "Sponsorisé", value: 18450, percentage: 14, trend: "up" as const },
  { name: "Recherche", value: 13000, percentage: 11, trend: "down" as const },
];

const BAR_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.75)",
  "hsl(var(--primary) / 0.55)",
  "hsl(var(--accent-brand))",
  "hsl(var(--accent-brand) / 0.65)",
];

const total = data.reduce((sum, item) => sum + item.value, 0);
const maxValue = Math.max(...data.map(d => d.value));

function formatNumber(num: number): string {
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toLocaleString("fr-FR");
}

export function ReachDonutChart() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Portée</CardTitle>
          <span className="text-2xl font-bold text-primary">{formatNumber(total)}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-0 space-y-3">
        {data.map((item, index) => (
          <div key={item.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">{item.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tabular-nums">
                  {item.value.toLocaleString("fr-FR")}
                </span>
                <span
                  className={`flex items-center gap-0.5 text-[10px] font-medium ${
                    item.trend === "up" ? "text-sp-success" : "text-destructive"
                  }`}
                >
                  {item.trend === "up" ? (
                    <TrendingUp className="h-2.5 w-2.5" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5" />
                  )}
                  {item.percentage}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: BAR_COLORS[index],
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
