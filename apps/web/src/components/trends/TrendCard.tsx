import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlatformBadge } from "@/components/ui/platform-badge";
import {
  TrendTopic,
  getAttentionLabel,
  getEvolutionLabel,
  getRelevanceInfo,
} from "@/types/trend";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  ChevronRight,
  Flame,
  Eye,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendCardProps {
  trend: TrendTopic;
  onClick: () => void;
}

export function TrendCard({ trend, onClick }: TrendCardProps) {
  const relevanceInfo = getRelevanceInfo(trend.relevance);

  const getEvolutionIcon = () => {
    switch (trend.evolution) {
      case "rising":
        return <TrendingUp className="h-3.5 w-3.5" />;
      case "falling":
        return <TrendingDown className="h-3.5 w-3.5" />;
      default:
        return <Minus className="h-3.5 w-3.5" />;
    }
  };

  const getEvolutionColor = () => {
    switch (trend.evolution) {
      case "rising":
        return "text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400";
      case "falling":
        return "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const getAttentionColor = () => {
    switch (trend.attentionLevel) {
      case "high":
        return "text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400";
      case "medium":
        return "text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const getRelevanceColor = () => {
    switch (trend.relevance) {
      case "pertinent":
        return "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20";
      case "watch":
        return "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20";
      default:
        return "border-muted bg-muted/30";
    }
  };

  const getRelevanceIcon = () => {
    switch (trend.relevance) {
      case "pertinent":
        return <Flame className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />;
      case "watch":
        return <Eye className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />;
      default:
        return <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  return (
    <Card
      className="hover:shadow-md transition-all duration-200 cursor-pointer group border-l-4"
      style={{
        borderLeftColor:
          trend.attentionLevel === "high"
            ? "hsl(var(--destructive))"
            : trend.attentionLevel === "medium"
            ? "hsl(var(--warning, 45 93% 47%))"
            : "hsl(var(--muted-foreground))",
      }}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {trend.title}
            </h3>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </div>

        {/* Intensity bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Intensité</span>
            <span className="font-medium">{trend.intensity}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                trend.intensity >= 70
                  ? "bg-red-500"
                  : trend.intensity >= 40
                  ? "bg-amber-500"
                  : "bg-green-500"
              )}
              style={{ width: `${trend.intensity}%` }}
            />
          </div>
        </div>

        {/* Indicators */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge
            variant="outline"
            className={cn("text-xs px-2 py-0.5", getAttentionColor())}
          >
            {getAttentionLabel(trend.attentionLevel)}
          </Badge>
          <Badge
            variant="outline"
            className={cn("text-xs px-2 py-0.5 flex items-center gap-1", getEvolutionColor())}
          >
            {getEvolutionIcon()}
            {getEvolutionLabel(trend.evolution)}
          </Badge>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{trend.peakRegion}</span>
        </div>

        {/* Platforms */}
        <div className="flex items-center gap-1.5 mb-3">
          {trend.platforms.map((platform) => (
            <PlatformBadge key={platform} platform={platform} />
          ))}
        </div>

        {/* Relevance indicator */}
        <div
          className={cn(
            "rounded-md border p-2 flex items-center gap-2",
            getRelevanceColor()
          )}
        >
          {getRelevanceIcon()}
          <span className="text-xs font-medium">{relevanceInfo.label}</span>
        </div>
      </CardContent>
    </Card>
  );
}
