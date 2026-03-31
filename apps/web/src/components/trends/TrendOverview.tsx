import { TrendTopic, getRelevanceInfo } from "@/types/trend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Flame, 
  TrendingUp, 
  Eye, 
  Target, 
  Sparkles,
  ArrowUpRight,
  Minus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendOverviewProps {
  trends: TrendTopic[];
  onTrendClick: (trend: TrendTopic) => void;
}

export function TrendOverview({ trends, onTrendClick }: TrendOverviewProps) {
  // Top 3 trending now (highest intensity + rising)
  const hotTrends = trends
    .filter(t => t.evolution === "rising" || t.intensity > 70)
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 3);

  // Pertinent for your practice
  const relevantTrends = trends
    .filter(t => t.relevance === "pertinent")
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 4);

  // To watch (rising but not yet pertinent)
  const watchTrends = trends
    .filter(t => t.relevance === "watch" && t.evolution === "rising")
    .slice(0, 3);

  // Group by category with average intensity
  const categoryStats = trends.reduce((acc, trend) => {
    if (!acc[trend.category]) {
      acc[trend.category] = { count: 0, totalIntensity: 0 };
    }
    acc[trend.category].count++;
    acc[trend.category].totalIntensity += trend.intensity;
    return acc;
  }, {} as Record<string, { count: number; totalIntensity: number }>);

  const sortedCategories = Object.entries(categoryStats)
    .map(([name, stats]) => ({
      name,
      count: stats.count,
      avgIntensity: Math.round(stats.totalIntensity / stats.count),
    }))
    .sort((a, b) => b.avgIntensity - a.avgIntensity)
    .slice(0, 5);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Hot Trends - Main Column */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-900/30">
              <Flame className="h-4 w-4 text-orange-600" />
            </div>
            Tendances chaudes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {hotTrends.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucune tendance forte pour le moment
            </p>
          ) : (
            hotTrends.map((trend, index) => (
              <button
                key={trend.id}
                onClick={() => onTrendClick(trend)}
                className="w-full p-4 rounded-lg border bg-card hover:bg-muted/50 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  {/* Rank */}
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                    index === 0 ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30" :
                    index === 1 ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30" :
                    "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30"
                  )}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium group-hover:text-primary transition-colors">
                        {trend.title}
                      </h4>
                      {trend.evolution === "rising" && (
                        <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                      {trend.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {trend.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        Intensité {Math.round(trend.intensity)}%
                      </span>
                    </div>
                  </div>

                  {/* Intensity indicator */}
                  <div className="flex-shrink-0 w-16">
                    <div className="text-right mb-1">
                      <span className={cn(
                        "text-sm font-bold",
                        trend.intensity > 80 ? "text-red-600" :
                        trend.intensity > 60 ? "text-orange-600" :
                        "text-amber-600"
                      )}>
                        {Math.round(trend.intensity)}%
                      </span>
                    </div>
                    <Progress 
                      value={trend.intensity} 
                      className="h-1.5"
                    />
                  </div>
                </div>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      {/* Side Column */}
      <div className="space-y-4">
        {/* Pertinent for you */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              Pertinent pour vous
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {relevantTrends.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Aucune tendance pertinente identifiée
              </p>
            ) : (
              relevantTrends.map((trend) => {
                const relevanceInfo = getRelevanceInfo(trend.relevance);
                return (
                  <button
                    key={trend.id}
                    onClick={() => onTrendClick(trend)}
                    className="w-full p-2 rounded-md hover:bg-muted/50 transition-colors text-left flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="text-sm truncate flex-1">{trend.title}</span>
                    <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20">
                      {Math.round(trend.intensity)}%
                    </Badge>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* To watch */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-amber-600" />
              À surveiller
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {watchTrends.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Aucune tendance émergente
              </p>
            ) : (
              watchTrends.map((trend) => (
                <button
                  key={trend.id}
                  onClick={() => onTrendClick(trend)}
                  className="w-full p-2 rounded-md hover:bg-muted/50 transition-colors text-left flex items-center gap-2"
                >
                  <ArrowUpRight className="h-3 w-3 text-amber-600 flex-shrink-0" />
                  <span className="text-sm truncate flex-1">{trend.title}</span>
                  <span className="text-xs text-muted-foreground">{trend.category}</span>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Categories breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Par thématique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedCategories.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{cat.name}</span>
                  <span className="font-medium">{cat.count} tendances</span>
                </div>
                <Progress value={cat.avgIntensity} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
