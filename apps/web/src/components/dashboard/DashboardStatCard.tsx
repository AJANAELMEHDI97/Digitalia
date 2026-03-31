import { memo } from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Plus, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardStatCardProps {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  href?: string;
  trend?: string;
  trendDirection?: "up" | "down";
  isAddButton?: boolean;
  tooltip?: string;
}

export const DashboardStatCard = memo(function DashboardStatCard({
  label,
  value,
  icon: Icon,
  loading,
  href,
  trend,
  trendDirection = "up",
  isAddButton,
  tooltip,
}: DashboardStatCardProps) {
  if (isAddButton) {
    return (
      <Link to={href || "/editor"}>
        <div className="rounded-lg border-2 border-dashed border-border h-full w-full transition-all duration-150 hover:border-primary/30 hover:bg-muted/40 cursor-pointer">
          <div className="p-4 flex flex-col items-center justify-center h-full min-h-[72px]">
            <Plus className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </Link>
    );
  }

  const content = (
    <div className={cn(
      "rounded-lg border bg-card p-4 transition-all duration-150 w-full",
      href && "cursor-pointer hover:shadow-elevated"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
        </div>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground/40 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px] text-xs">
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {loading ? (
        <Skeleton className="h-7 w-16" />
      ) : (
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold tracking-tight tabular-nums">{value}</span>
          {trend && (
            <span className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium",
              trendDirection === "up" 
                ? "bg-[hsl(var(--perf-good-bg))] text-[hsl(var(--perf-good-text))]" 
                : "bg-[hsl(var(--perf-poor-bg))] text-[hsl(var(--perf-poor-text))]"
            )}>
              {trendDirection === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link to={href} className="block w-full">{content}</Link>;
  }

  return <div className="w-full">{content}</div>;
});
