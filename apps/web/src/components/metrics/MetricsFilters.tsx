import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Linkedin, Instagram, Facebook, Globe } from "lucide-react";

interface MetricsFiltersProps {
  selectedPlatform: string;
  selectedPeriod: string;
  selectedPerformance: string;
  onPlatformChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
  onPerformanceChange: (value: string) => void;
}

const platformOptions = [
  { value: "all", label: "Tous les réseaux", icon: Globe },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "facebook", label: "Facebook", icon: Facebook },
];

const periodOptions = [
  { value: "7d", label: "7 derniers jours" },
  { value: "30d", label: "30 derniers jours" },
  { value: "90d", label: "3 derniers mois" },
  { value: "all", label: "Toutes les dates" },
];

const performanceOptions = [
  { value: "all", label: "Toutes performances" },
  { value: "good", label: "Bonnes performances" },
  { value: "medium", label: "Engagement correct" },
  { value: "improve", label: "À améliorer" },
];

export function MetricsFilters({
  selectedPlatform,
  selectedPeriod,
  selectedPerformance,
  onPlatformChange,
  onPeriodChange,
  onPerformanceChange,
}: MetricsFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Platform Filter */}
      <Select value={selectedPlatform} onValueChange={onPlatformChange}>
        <SelectTrigger className="w-[180px] bg-background">
          <SelectValue placeholder="Réseau" />
        </SelectTrigger>
        <SelectContent>
          {platformOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <option.icon className="h-4 w-4" />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Period Filter */}
      <Select value={selectedPeriod} onValueChange={onPeriodChange}>
        <SelectTrigger className="w-[180px] bg-background">
          <SelectValue placeholder="Période" />
        </SelectTrigger>
        <SelectContent>
          {periodOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Performance Filter */}
      <Select value={selectedPerformance} onValueChange={onPerformanceChange}>
        <SelectTrigger className="w-[180px] bg-background">
          <SelectValue placeholder="Performance" />
        </SelectTrigger>
        <SelectContent>
          {performanceOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Reset Button */}
      {(selectedPlatform !== "all" || selectedPeriod !== "all" || selectedPerformance !== "all") && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            onPlatformChange("all");
            onPeriodChange("all");
            onPerformanceChange("all");
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          Réinitialiser
        </Button>
      )}
    </div>
  );
}
