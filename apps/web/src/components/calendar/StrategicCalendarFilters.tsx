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
import { Separator } from "@/components/ui/separator";
import { 
  Filter, 
  FileText, 
  CalendarDays, 
  Scale,
  Linkedin, 
  Instagram, 
  Facebook, 
  Twitter,
  Newspaper,
  CheckCircle,
  Eye,
  XCircle
} from "lucide-react";
import { LegalThematic, LEGAL_THEMATICS } from "@/data/mockJudicialEvents";
import { cn } from "@/lib/utils";

export type CalendarElementType = "all" | "publications" | "key-dates" | "events";
export type CalendarPlatformFilter = "all" | "linkedin" | "instagram" | "facebook" | "twitter" | "blog";
export type SensitivityFilter = "all" | "opportune" | "surveiller" | "eviter";

interface StrategicCalendarFiltersProps {
  elementType: CalendarElementType;
  platformFilter: CalendarPlatformFilter;
  thematicFilter: LegalThematic | "all";
  sensitivityFilter: SensitivityFilter;
  showDrafts: boolean;
  showToValidate: boolean;
  showScheduled: boolean;
  onElementTypeChange: (type: CalendarElementType) => void;
  onPlatformFilterChange: (platform: CalendarPlatformFilter) => void;
  onThematicFilterChange: (thematic: LegalThematic | "all") => void;
  onSensitivityFilterChange: (sensitivity: SensitivityFilter) => void;
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
  { value: "blog", label: "Blog", icon: Newspaper },
];

const SENSITIVITY_OPTIONS = [
  { value: "all", label: "Tous les niveaux", icon: null, color: "" },
  { value: "opportune", label: "Opportun", icon: CheckCircle, color: "text-emerald-600" },
  { value: "surveiller", label: "À surveiller", icon: Eye, color: "text-amber-600" },
  { value: "eviter", label: "À éviter", icon: XCircle, color: "text-red-600" },
];

export function StrategicCalendarFilters({
  elementType,
  platformFilter,
  thematicFilter,
  sensitivityFilter,
  showDrafts,
  showToValidate,
  showScheduled,
  onElementTypeChange,
  onPlatformFilterChange,
  onThematicFilterChange,
  onSensitivityFilterChange,
  onShowDraftsChange,
  onShowToValidateChange,
  onShowScheduledChange,
}: StrategicCalendarFiltersProps) {
  const activeFiltersCount = [
    elementType !== "all",
    platformFilter !== "all",
    thematicFilter !== "all",
    sensitivityFilter !== "all",
    !showDrafts,
    !showToValidate,
    !showScheduled,
  ].filter(Boolean).length;

  return (
    <div className="space-y-3 overflow-hidden">
      {/* Primary filters row */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
        {/* Type filter buttons */}
        <div className="flex items-center bg-muted/50 rounded-lg p-1">
          <Button
            variant={elementType === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => onElementTypeChange("all")}
            className="text-xs h-8"
          >
            Tout
          </Button>
          <Button
            variant={elementType === "publications" ? "default" : "ghost"}
            size="sm"
            onClick={() => onElementTypeChange("publications")}
            className="text-xs h-8"
          >
            <FileText className="h-3 w-3 mr-1.5" />
            Publications
          </Button>
          <Button
            variant={elementType === "key-dates" ? "default" : "ghost"}
            size="sm"
            onClick={() => onElementTypeChange("key-dates")}
            className="text-xs h-8"
          >
            <CalendarDays className="h-3 w-3 mr-1.5" />
            Dates clés
          </Button>
          <Button
            variant={elementType === "events" ? "default" : "ghost"}
            size="sm"
            onClick={() => onElementTypeChange("events")}
            className="text-xs h-8"
          >
            <Scale className="h-3 w-3 mr-1.5" />
            Actualité
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

        {/* Thematic filter */}
        <Select value={thematicFilter} onValueChange={(v) => onThematicFilterChange(v as LegalThematic | "all")}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Thématique" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes thématiques</SelectItem>
            {Object.entries(LEGAL_THEMATICS).map(([key, { label, color }]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", color)} />
                  <span>{label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sensitivity filter */}
        <Select value={sensitivityFilter} onValueChange={(v) => onSensitivityFilterChange(v as SensitivityFilter)}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Sensibilité" />
          </SelectTrigger>
          <SelectContent>
            {SENSITIVITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <div className="flex items-center gap-2">
                  {opt.icon && <opt.icon className={cn("h-3.5 w-3.5", opt.color)} />}
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
          <PopoverContent className="w-72" align="end">
            <div className="space-y-4">
              <div className="text-sm font-medium">Statuts des publications</div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="show-drafts"
                    checked={showDrafts}
                    onCheckedChange={(checked) => onShowDraftsChange(!!checked)}
                  />
                  <Label htmlFor="show-drafts" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-muted" />
                    Brouillons
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="show-to-validate"
                    checked={showToValidate}
                    onCheckedChange={(checked) => onShowToValidateChange(!!checked)}
                  />
                  <Label htmlFor="show-to-validate" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-amber-200 dark:bg-amber-900/50" />
                    À valider
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="show-scheduled"
                    checked={showScheduled}
                    onCheckedChange={(checked) => onShowScheduledChange(!!checked)}
                  />
                  <Label htmlFor="show-scheduled" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-900/50" />
                    Programmés
                  </Label>
                </div>
              </div>

              <Separator />

              <div className="text-xs text-muted-foreground">
                Utilisez les filtres pour afficher uniquement les éléments pertinents pour votre stratégie éditoriale.
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
