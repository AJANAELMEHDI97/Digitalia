import React from "react";
import { Clock, AlertTriangle, Calendar, CalendarDays, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ValidationFilterType = 'all' | 'urgent' | 'today' | 'week' | 'expired';

interface ValidationFiltersProps {
  activeFilter: ValidationFilterType;
  onFilterChange: (filter: ValidationFilterType) => void;
  counts: {
    all: number;
    urgent: number;
    today: number;
    week: number;
    expired: number;
  };
}

const FILTERS: { key: ValidationFilterType; label: string; icon: React.ElementType; color?: string }[] = [
  { key: 'all', label: 'Tout', icon: Calendar },
  { key: 'urgent', label: 'Urgent', icon: AlertTriangle, color: 'text-amber-600' },
  { key: 'today', label: "Aujourd'hui", icon: Clock },
  { key: 'week', label: 'Cette semaine', icon: CalendarDays },
  { key: 'expired', label: 'Expirés', icon: AlertCircle, color: 'text-destructive' },
];

export function ValidationFilters({ activeFilter, onFilterChange, counts }: ValidationFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map(({ key, label, icon: Icon, color }) => (
        <Button
          key={key}
          variant={activeFilter === key ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(key)}
          className={cn(
            "gap-2",
            activeFilter !== key && color
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
          {counts[key] > 0 && (
            <Badge
              variant={activeFilter === key ? "secondary" : "outline"}
              className={cn(
                "ml-1 h-5 min-w-5 px-1.5",
                key === 'urgent' && activeFilter !== key && "bg-amber-100 text-amber-700 border-amber-300",
                key === 'expired' && activeFilter !== key && "bg-red-100 text-red-700 border-red-300"
              )}
            >
              {counts[key]}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
}

export default ValidationFilters;