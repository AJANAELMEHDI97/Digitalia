import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { PlatformBadge } from "@/components/ui/platform-badge";
import { Separator } from "@/components/ui/separator";
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
  Flame,
  Eye,
  AlertCircle,
  MessageSquare,
  Globe,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendDetailSheetProps {
  trend: TrendTopic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrendDetailSheet({
  trend,
  open,
  onOpenChange,
}: TrendDetailSheetProps) {
  if (!trend) return null;

  const relevanceInfo = getRelevanceInfo(trend.relevance);

  const getEvolutionIcon = () => {
    switch (trend.evolution) {
      case "rising":
        return <TrendingUp className="h-4 w-4" />;
      case "falling":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
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

  const getRelevanceStyle = () => {
    switch (trend.relevance) {
      case "pertinent":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30";
      case "watch":
        return "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30";
      default:
        return "border-muted bg-muted/50";
    }
  };

  const getRelevanceIcon = () => {
    switch (trend.relevance) {
      case "pertinent":
        return <Flame className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case "watch":
        return <Eye className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl leading-tight pr-8">
            {trend.title}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Détail de la tendance {trend.title}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Intensity meter */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Intensité du sujet
              </span>
              <span className="font-semibold">{trend.intensity}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  trend.intensity >= 70
                    ? "bg-gradient-to-r from-orange-500 to-red-500"
                    : trend.intensity >= 40
                    ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                    : "bg-gradient-to-r from-green-500 to-emerald-500"
                )}
                style={{ width: `${trend.intensity}%` }}
              />
            </div>
          </div>

          {/* Indicators row */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={cn("px-3 py-1", getAttentionColor())}
            >
              Attention {getAttentionLabel(trend.attentionLevel).toLowerCase()}
            </Badge>
            <Badge
              variant="outline"
              className={cn("px-3 py-1 flex items-center gap-1.5", getEvolutionColor())}
            >
              {getEvolutionIcon()}
              {getEvolutionLabel(trend.evolution)}
            </Badge>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Description
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {trend.description}
            </p>
          </div>

          {/* Why trending */}
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Pourquoi ce sujet fait du bruit
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {trend.whyTrending}
            </p>
          </div>

          <Separator />

          {/* Geographic activity */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              Zones les plus actives
            </h4>
            <div className="flex flex-wrap gap-2">
              {trend.regions.map((region) => (
                <Badge
                  key={region}
                  variant={region === trend.peakRegion ? "default" : "outline"}
                  className="px-3 py-1"
                >
                  <MapPin className="h-3 w-3 mr-1.5" />
                  {region}
                  {region === trend.peakRegion && (
                    <span className="ml-1.5 text-xs opacity-75">(principal)</span>
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Active platforms */}
          <div>
            <h4 className="font-medium mb-3">Réseaux les plus actifs</h4>
            <div className="flex flex-wrap gap-2">
              {trend.platforms.map((platform) => (
                <PlatformBadge key={platform} platform={platform} />
              ))}
            </div>
          </div>

          <Separator />

          {/* Editorial recommendation */}
          <div className={cn("rounded-lg border p-4", getRelevanceStyle())}>
            <div className="flex items-start gap-3">
              {getRelevanceIcon()}
              <div className="flex-1">
                <h4 className="font-medium mb-1">{relevanceInfo.label}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {relevanceInfo.description}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-current/10">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {trend.editorialRecommendation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
