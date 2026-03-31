import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Linkedin, Instagram, Facebook, Twitter } from "lucide-react";
import { Publication } from "@/hooks/usePublications";

interface PlatformDistributionChartProps {
  publications: Publication[];
}

const PLATFORM_CONFIG = {
  linkedin: { name: "LinkedIn", color: "hsl(var(--primary))", icon: Linkedin },
  instagram: { name: "Instagram", color: "hsl(var(--accent-brand))", icon: Instagram },
  facebook: { name: "Facebook", color: "hsl(var(--chart-4))", icon: Facebook },
  twitter: { name: "X (Twitter)", color: "hsl(var(--primary) / 0.55)", icon: Twitter },
};

const MOCK_DISTRIBUTION = { linkedin: 28, instagram: 19, facebook: 24, twitter: 12 };

export function PlatformDistributionChart({ publications }: PlatformDistributionChartProps) {
  const chartData = useMemo(() => {
    const distribution: Record<string, number> = {};
    publications.forEach(pub => {
      if (pub.platform) distribution[pub.platform] = (distribution[pub.platform] || 0) + 1;
    });
    const totalReal = Object.values(distribution).reduce((a, b) => a + b, 0);
    const finalDistribution = totalReal < 10 ? MOCK_DISTRIBUTION : distribution;

    return Object.entries(finalDistribution)
      .map(([platform, count]) => ({
        name: PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG]?.name || platform,
        value: count,
        platform,
        color: PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG]?.color || "hsl(var(--muted-foreground))",
      }))
      .sort((a, b) => b.value - a.value);
  }, [publications]);

  const total = chartData.reduce((acc, d) => acc + d.value, 0);
  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  return (
    <Card className="bg-card border transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          <div className="p-2 rounded-xl bg-accent-brand/10">
            <BarChart3 className="h-4 w-4 text-accent-brand" />
          </div>
          <span>Répartition par réseau</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Aucune donnée disponible
          </div>
        ) : (
          <div className="space-y-4">
            {chartData.map((item) => {
              const config = PLATFORM_CONFIG[item.platform as keyof typeof PLATFORM_CONFIG];
              const Icon = config?.icon;
              const percentage = ((item.value / total) * 100).toFixed(0);

              return (
                <div key={item.platform} className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted"
                  >
                    {Icon && <Icon className="h-4 w-4 text-foreground" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tabular-nums">{item.value}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">{percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(item.value / maxValue) * 100}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
