import { Card, CardContent } from "@/components/ui/card";
import { TrendTopic } from "@/types/trend";
import { Flame, Eye, AlertCircle, TrendingUp } from "lucide-react";

interface TrendStatsProps {
  trends: TrendTopic[];
}

export function TrendStats({ trends }: TrendStatsProps) {
  const pertinentCount = trends.filter((t) => t.relevance === "pertinent").length;
  const watchCount = trends.filter((t) => t.relevance === "watch").length;
  const risingCount = trends.filter((t) => t.evolution === "rising").length;
  const highAttentionCount = trends.filter((t) => t.attentionLevel === "high").length;

  const stats = [
    {
      label: "À fort potentiel",
      value: pertinentCount,
      icon: Flame,
      color: "text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400",
    },
    {
      label: "À surveiller",
      value: watchCount,
      icon: Eye,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400",
    },
    {
      label: "En hausse",
      value: risingCount,
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400",
    },
    {
      label: "Attention forte",
      value: highAttentionCount,
      icon: AlertCircle,
      color: "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
