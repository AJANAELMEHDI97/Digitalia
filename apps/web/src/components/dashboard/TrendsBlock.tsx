import { Link } from "react-router-dom";
import { TrendingUp, ArrowRight, Flame, Eye, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrends } from "@/hooks/useTrends";
import { getRelevanceInfo } from "@/types/trend";

interface TrendsBlockProps {
  limit?: number;
}

export function TrendsBlock({ limit = 3 }: TrendsBlockProps) {
  const { trends, loading, getTopTrends } = useTrends();
  const topTrends = getTopTrends(limit);

  return (
    <Card className="bg-card border transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/20">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <span>Tendances</span>
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
            <Link to="/trends">
              Explorer
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(limit)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {topTrends.map((trend) => {
              const relevanceInfo = getRelevanceInfo(trend.relevance);
              
              return (
                <Link
                  key={trend.id}
                  to="/trends"
                  className="block p-4 rounded-xl border hover:bg-muted/30 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-sm">{trend.title}</h4>
                        {trend.evolution === "rising" && (
                          <Flame className="h-3.5 w-3.5 text-orange-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Target className="h-3.5 w-3.5" />
                          {trend.category}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5" />
                          Intensité {Math.round(trend.intensity)}%
                        </span>
                      </div>
                    </div>
                    <Badge 
                      variant="outline"
                      className={`text-xs flex-shrink-0 font-medium ${
                        trend.relevance === "pertinent" 
                          ? "border-emerald-300 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" 
                          : trend.relevance === "watch"
                          ? "border-amber-300 text-amber-600 bg-amber-50 dark:bg-amber-900/20"
                          : ""
                      }`}
                    >
                      {relevanceInfo.label}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        
        {!loading && topTrends.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            Aucune tendance pertinente pour le moment
          </p>
        )}
      </CardContent>
    </Card>
  );
}
