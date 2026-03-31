import { TrendingUp, Minus, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PerformanceLevel } from "@/data/mockMetrics";

interface PerformanceBadgeProps {
  level: PerformanceLevel;
  className?: string;
}

const config = {
  good: {
    label: "Communication maîtrisée",
    icon: TrendingUp,
    variant: "good" as const,
  },
  medium: {
    label: "À optimiser",
    icon: Minus,
    variant: "average" as const,
  },
  improve: {
    label: "Sujet sensible",
    icon: TrendingDown,
    variant: "poor" as const,
  },
};

export function PerformanceBadge({ level, className }: PerformanceBadgeProps) {
  const { label, icon: Icon, variant } = config[level];

  return (
    <Badge variant={variant} className={cn("gap-1", className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
