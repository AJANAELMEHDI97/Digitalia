import { Clock, AlertTriangle, ShieldAlert, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface AutoValidationInfo {
  hours: number;
  minutes: number;
  isBlocked: boolean;
  blockReason?: string;
}

interface AutoValidationCountdownProps {
  info: AutoValidationInfo;
  variant?: "banner" | "badge" | "compact" | "inline";
  className?: string;
}

export function AutoValidationCountdown({ 
  info, 
  variant = "banner",
  className 
}: AutoValidationCountdownProps) {
  const { hours, minutes, isBlocked, blockReason } = info;
  const isExpired = hours === 0 && minutes === 0 && !isBlocked;
  const isUrgent = hours < 4 && !isBlocked;
  const isVeryUrgent = hours < 2 && !isBlocked;

  // Format time display - ultra compact
  const formatTime = () => {
    if (hours > 0 && minutes > 0) {
      return `${hours}h${minutes < 10 ? '0' : ''}${minutes}`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    }
    return "0m";
  };

  // Blocked state - manual intervention required
  if (isBlocked) {
    if (variant === "badge") {
      return (
        <Badge 
          variant="outline" 
          className={cn(
            "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-950/30 dark:text-amber-400",
            className
          )}
        >
          <ShieldAlert className="h-3 w-3 mr-1" />
          Validation manuelle
        </Badge>
      );
    }

    if (variant === "compact") {
      return (
        <div className={cn(
          "flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400",
          className
        )}>
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Validation manuelle requise</span>
        </div>
      );
    }

    return (
      <div className={cn(
        "flex flex-col gap-1.5 px-3 py-2.5 rounded-lg text-sm",
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
        className
      )}>
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 flex-shrink-0" />
          <span className="font-medium">Validation automatique désactivée</span>
        </div>
        <p className="text-xs opacity-90 pl-6">
          {blockReason || "Intervention manuelle requise avant publication."}
        </p>
      </div>
    );
  }

  // Expired state
  if (isExpired) {
    if (variant === "badge") {
      return (
        <Badge 
          variant="outline" 
          className={cn(
            "border-red-300 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-950/30 dark:text-red-400 animate-pulse",
            className
          )}
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          Imminente
        </Badge>
      );
    }

    if (variant === "compact") {
      return (
        <div className={cn(
          "flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 animate-pulse",
          className
        )}>
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Validation imminente</span>
        </div>
      );
    }

    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 animate-pulse",
        className
      )}>
        <AlertTriangle className="h-4 w-4" />
        <span className="font-medium">Validation automatique imminente</span>
      </div>
    );
  }

  // Inline variant - ultra compact, just icon + time
  if (variant === "inline") {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 text-xs",
        isBlocked
          ? "text-amber-600 dark:text-amber-400"
          : isVeryUrgent 
            ? "text-red-600 dark:text-red-400"
            : isUrgent
              ? "text-amber-600 dark:text-amber-400"
              : "text-muted-foreground",
        className
      )}>
        <Timer className="h-3 w-3 flex-shrink-0" />
        <span>{isBlocked ? "off" : formatTime()}</span>
      </span>
    );
  }

  // Badge variant
  if (variant === "badge") {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          isVeryUrgent 
            ? "border-red-300 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-950/30 dark:text-red-400"
            : isUrgent
              ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-950/30 dark:text-amber-400"
              : "border-muted-foreground/30",
          className
        )}
      >
        <Timer className="h-3 w-3 mr-1" />
        {formatTime()}
      </Badge>
    );
  }

  // Compact variant
  if (variant === "compact") {
    return (
      <div className={cn(
        "flex items-center gap-1.5 text-xs",
        isVeryUrgent 
          ? "text-red-600 dark:text-red-400"
          : isUrgent
            ? "text-amber-600 dark:text-amber-400"
            : "text-muted-foreground",
        className
      )}>
        <Clock className="h-3.5 w-3.5" />
        <span>Validation auto dans {formatTime()}</span>
      </div>
    );
  }

  // Banner variant (default)
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
      isVeryUrgent 
        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
        : isUrgent 
          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
          : "bg-muted text-muted-foreground",
      className
    )}>
      <Clock className={cn(
        "h-4 w-4",
        isUrgent && "animate-pulse"
      )} />
      <span>
        Validation automatique dans{" "}
        <span className="font-medium">{formatTime()}</span>
      </span>
    </div>
  );
}
