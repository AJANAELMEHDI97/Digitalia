import { useState } from "react";
import { Filter, Linkedin, Instagram, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export type DashboardPeriod = "today" | "week" | "month" | "all";
export type DashboardPlatform = "all" | "linkedin" | "instagram" | "facebook" | "twitter";

interface DashboardFiltersProps {
  period: DashboardPeriod;
  platform: DashboardPlatform;
  onPeriodChange: (period: DashboardPeriod) => void;
  onPlatformChange: (platform: DashboardPlatform) => void;
}

const PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: "today", label: "Aujourd'hui" },
  { value: "week", label: "Cette semaine" },
  { value: "month", label: "Ce mois" },
  { value: "all", label: "Tout" },
];

const PLATFORMS: { value: DashboardPlatform; label: string; icon?: React.ComponentType<{ className?: string }> }[] = [
  { value: "all", label: "Tous les réseaux" },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "X (Twitter)" },
];

export function DashboardFilters({
  period,
  platform,
  onPeriodChange,
  onPlatformChange,
}: DashboardFiltersProps) {
  const activeFiltersCount = (period !== "all" ? 1 : 0) + (platform !== "all" ? 1 : 0);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Period pills */}
      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
        {PERIODS.map((p) => (
          <Button
            key={p.value}
            variant={period === p.value ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => onPeriodChange(p.value)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Platform select */}
      <Select value={platform} onValueChange={(v) => onPlatformChange(v as DashboardPlatform)}>
        <SelectTrigger className="w-[160px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PLATFORMS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              <span className="flex items-center gap-2">
                {p.icon && <p.icon className="h-3 w-3" />}
                {p.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Active filters indicator */}
      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground"
          onClick={() => {
            onPeriodChange("all");
            onPlatformChange("all");
          }}
        >
          <X className="h-3 w-3 mr-1" />
          Réinitialiser
        </Button>
      )}
    </div>
  );
}
