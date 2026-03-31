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
import { Filter, FileText, CalendarDays, Linkedin, Instagram, Facebook, Twitter } from "lucide-react";

export type CalendarFilterType = "all" | "publications" | "key-dates";
export type CalendarPlatformFilter = "all" | "linkedin" | "instagram" | "facebook" | "twitter";

interface CalendarFiltersProps {
  filterType: CalendarFilterType;
  platformFilter: CalendarPlatformFilter;
  showDrafts: boolean;
  showToValidate: boolean;
  showScheduled: boolean;
  onFilterTypeChange: (type: CalendarFilterType) => void;
  onPlatformFilterChange: (platform: CalendarPlatformFilter) => void;
  onShowDraftsChange: (show: boolean) => void;
  onShowToValidateChange: (show: boolean) => void;
  onShowScheduledChange: (show: boolean) => void;
}

const PLATFORM_OPTIONS = [
  { value: "all", label: "Tous les réseaux", icon: null },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "twitter", label: "X (Twitter)", icon: Twitter },
];

export function CalendarFilters({
  filterType,
  platformFilter,
  showDrafts,
  showToValidate,
  showScheduled,
  onFilterTypeChange,
  onPlatformFilterChange,
  onShowDraftsChange,
  onShowToValidateChange,
  onShowScheduledChange,
}: CalendarFiltersProps) {
  const activeFiltersCount = [
    filterType !== "all",
    platformFilter !== "all",
    !showDrafts,
    !showToValidate,
    !showScheduled,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Type filter buttons */}
      <div className="flex items-center bg-muted/50 rounded-lg p-1">
        <Button
          variant={filterType === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => onFilterTypeChange("all")}
          className="text-xs h-8"
        >
          Tout
        </Button>
        <Button
          variant={filterType === "publications" ? "default" : "ghost"}
          size="sm"
          onClick={() => onFilterTypeChange("publications")}
          className="text-xs h-8"
        >
          <FileText className="h-3 w-3 mr-1.5" />
          Publications
        </Button>
        <Button
          variant={filterType === "key-dates" ? "default" : "ghost"}
          size="sm"
          onClick={() => onFilterTypeChange("key-dates")}
          className="text-xs h-8"
        >
          <CalendarDays className="h-3 w-3 mr-1.5" />
          Dates clés
        </Button>
      </div>

      {/* Platform filter */}
      <Select value={platformFilter} onValueChange={(v) => onPlatformFilterChange(v as CalendarPlatformFilter)}>
        <SelectTrigger className="w-[160px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PLATFORM_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <div className="flex items-center gap-2">
                {opt.icon && <opt.icon className="h-3.5 w-3.5" />}
                <span>{opt.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Advanced filters */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            Filtres
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
          <div className="space-y-4">
            <div className="text-sm font-medium">Afficher les statuts</div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-drafts"
                  checked={showDrafts}
                  onCheckedChange={(checked) => onShowDraftsChange(!!checked)}
                />
                <Label htmlFor="show-drafts" className="text-sm font-normal cursor-pointer">
                  Brouillons
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-to-validate"
                  checked={showToValidate}
                  onCheckedChange={(checked) => onShowToValidateChange(!!checked)}
                />
                <Label htmlFor="show-to-validate" className="text-sm font-normal cursor-pointer">
                  À valider
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-scheduled"
                  checked={showScheduled}
                  onCheckedChange={(checked) => onShowScheduledChange(!!checked)}
                />
                <Label htmlFor="show-scheduled" className="text-sm font-normal cursor-pointer">
                  Programmés
                </Label>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
