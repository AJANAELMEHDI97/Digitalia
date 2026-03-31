import { Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutoValidationBannerProps {
  hours: number;
  minutes: number;
  className?: string;
}

export function AutoValidationBanner({ hours, minutes, className }: AutoValidationBannerProps) {
  const isUrgent = hours < 2;
  const isExpired = hours === 0 && minutes === 0;

  if (isExpired) {
    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
        className
      )}>
        <AlertCircle className="h-4 w-4" />
        <span>Validation automatique imminente</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
      isUrgent 
        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
        : "bg-muted text-muted-foreground",
      className
    )}>
      <Clock className="h-4 w-4" />
      <span>
        Validation auto dans{" "}
        <span className="font-medium">
          {hours > 0 && `${hours}h`}
          {minutes > 0 && `${minutes}min`}
        </span>
      </span>
      <span className="text-xs opacity-75">
        — Aucune action requise
      </span>
    </div>
  );
}
