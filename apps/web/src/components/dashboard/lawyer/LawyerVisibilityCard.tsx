import { Eye, TrendingUp, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LawyerVisibilityCardProps {
  totalReach: number;
  previousMonthReach?: number;
  activeNetworks: string[];
  loading?: boolean;
}

export function LawyerVisibilityCard({
  totalReach,
  previousMonthReach = 9000,
  activeNetworks,
  loading,
}: LawyerVisibilityCardProps) {
  // Calculate growth percentage
  const growthPercent = previousMonthReach > 0 
    ? Math.round(((totalReach - previousMonthReach) / previousMonthReach) * 100) 
    : 0;
  const isPositiveGrowth = growthPercent > 0;

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-48" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3 text-base font-medium">
          <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-900/20">
            <Eye className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          </div>
          Votre visibilité ce mois-ci
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main metric */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold tracking-tight">
            {formatNumber(totalReach)}
          </span>
          <span className="text-sm text-muted-foreground">vues</span>
        </div>

        {/* Growth indicator */}
        <div className="flex items-center gap-2">
          {isPositiveGrowth ? (
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{growthPercent}% vs mois précédent
            </Badge>
          ) : growthPercent < 0 ? (
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
              {growthPercent}% vs mois précédent
            </Badge>
          ) : (
            <Badge variant="secondary">
              Stable vs mois précédent
            </Badge>
          )}
        </div>

        {/* Active networks */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Réseaux actifs :</span>
          {activeNetworks.length > 0 ? (
            activeNetworks.map((network) => (
              <Badge key={network} variant="outline" className="capitalize text-xs">
                {network === 'google_business' ? 'Google' : network}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">Aucun réseau connecté</span>
          )}
        </div>

        {/* Disclaimer */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-xs text-muted-foreground flex items-center gap-1 cursor-help">
                <Info className="h-3 w-3" />
                Indicateurs illustratifs de visibilité.
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-xs">
                Ces données sont des estimations basées sur les audiences des plateformes.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
