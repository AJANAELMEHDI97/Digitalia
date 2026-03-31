import { Link } from "react-router-dom";
import { BarChart3, ArrowRight, Eye, Heart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlatformBadge } from "@/components/ui/platform-badge";
import { mockPublications, PublicationMetrics } from "@/data/mockMetrics";

interface MetricsBlockProps {
  limit?: number;
}

function getTopPerformingPublications(limit: number = 3): PublicationMetrics[] {
  return [...mockPublications]
    .sort((a, b) => b.reach - a.reach)
    .slice(0, limit);
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function MetricsBlock({ limit = 3 }: MetricsBlockProps) {
  const topPublications = getTopPerformingPublications(limit);

  // Calculate totals
  const totalReach = mockPublications.reduce((acc, p) => acc + p.reach, 0);
  const avgEngagementRate = mockPublications.reduce((acc, p) => acc + p.engagementRate, 0) / mockPublications.length;

  return (
    <Card className="bg-card border transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/20">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
            </div>
            <span>Performances</span>
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
            <Link to="/metrics">
              Voir tout
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <Eye className="h-3.5 w-3.5" />
              <span className="uppercase tracking-wider font-medium">Portée totale</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums">{formatNumber(totalReach)}</span>
              <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12%
              </Badge>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <Heart className="h-3.5 w-3.5" />
              <span className="uppercase tracking-wider font-medium">Taux d'engagement</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums">{avgEngagementRate.toFixed(1)}%</span>
              <span className="text-xs text-muted-foreground">stable</span>
            </div>
          </div>
        </div>

        {/* Top performing publications */}
        <div>
          <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Meilleures publications
          </h4>
          <div className="space-y-2">
            {topPublications.map((pub, index) => (
              <Link
                key={pub.id}
                to="/metrics"
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all duration-200"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {index + 1}
                </div>
                {pub.imageUrl && (
                  <img 
                    src={pub.imageUrl} 
                    alt="" 
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{pub.content}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <PlatformBadge platform={pub.platform} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold tabular-nums">{formatNumber(pub.reach)}</div>
                  <div className="text-xs text-muted-foreground">vues</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
