import React, { useEffect, useState, memo } from "react";
import { Clock, AlertTriangle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ValidationTimeInfo } from "@/hooks/useValidationSLA";

interface ValidationSLATimerProps {
  timeInfo: ValidationTimeInfo;
  variant?: "compact" | "full";
  showProgress?: boolean;
  className?: string;
}

export const ValidationSLATimer = memo(function ValidationSLATimer({
  timeInfo,
  variant = "compact",
  showProgress = false,
  className,
}: ValidationSLATimerProps) {
  const [, setTick] = useState(0);

  // Update every minute
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const { hoursRemaining, minutesRemaining, percentRemaining, isExpired, isUrgent, isCritical } = timeInfo;

  // Format time display
  const formatTime = () => {
    if (isExpired) return "Expiré";
    if (hoursRemaining >= 24) {
      const days = Math.floor(hoursRemaining / 24);
      return `${days}j ${hoursRemaining % 24}h`;
    }
    if (hoursRemaining > 0) {
      return `${hoursRemaining}h ${minutesRemaining}m`;
    }
    return `${minutesRemaining}m`;
  };

  // Determine color based on status
  const getColorClass = () => {
    if (isExpired) return "text-destructive";
    if (isCritical) return "text-red-600 dark:text-red-400";
    if (percentRemaining <= 50) return "text-amber-600 dark:text-amber-400";
    return "text-muted-foreground";
  };

  const getProgressColor = () => {
    if (isExpired) return "bg-destructive";
    if (isCritical) return "bg-red-500";
    if (percentRemaining <= 50) return "bg-amber-500";
    return "bg-primary";
  };

  if (variant === "compact") {
    return (
      <Badge
        variant="outline"
        className={cn(
          "gap-1.5 font-mono text-xs",
          isExpired && "border-destructive bg-destructive/10",
          isCritical && !isExpired && "border-red-500 bg-red-500/10",
          isUrgent && "border-amber-500",
          className
        )}
      >
        {isExpired ? (
          <AlertTriangle className="h-3 w-3 text-destructive" />
        ) : isCritical ? (
          <AlertTriangle className="h-3 w-3 text-red-500" />
        ) : isUrgent ? (
          <Zap className="h-3 w-3 text-amber-500" />
        ) : (
          <Clock className="h-3 w-3" />
        )}
        <span className={getColorClass()}>{formatTime()}</span>
      </Badge>
    );
  }

  // Full variant with progress bar
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {isExpired ? (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          ) : isCritical ? (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          ) : isUrgent ? (
            <Zap className="h-4 w-4 text-amber-500" />
          ) : (
            <Clock className="h-4 w-4 text-muted-foreground" />
          )}
          <span className={cn("font-medium", getColorClass())}>
            {isExpired ? "Délai expiré" : `Temps restant: ${formatTime()}`}
          </span>
        </div>
        {isUrgent && !isExpired && (
          <Badge variant="outline" className="border-amber-500 text-amber-600 text-xs">
            Urgent
          </Badge>
        )}
      </div>
      {showProgress && !isExpired && (
        <Progress 
          value={percentRemaining} 
          className={cn("h-1.5", getProgressColor())}
        />
      )}
      {isExpired && (
        <p className="text-xs text-muted-foreground">
          Le délai de validation est dépassé. Selon vos paramètres, cette publication ne sera pas publiée automatiquement.
        </p>
      )}
    </div>
  );
});

export default ValidationSLATimer;