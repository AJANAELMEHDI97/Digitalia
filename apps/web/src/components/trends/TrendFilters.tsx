import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TREND_CATEGORIES, TIME_PERIODS } from "@/data/mockTrends";
import { Calendar, Filter } from "lucide-react";

interface TrendFiltersProps {
  selectedCategory: string;
  selectedPeriod: string;
  onCategoryChange: (category: string) => void;
  onPeriodChange: (period: string) => void;
}

export function TrendFilters({
  selectedCategory,
  selectedPeriod,
  onCategoryChange,
  onPeriodChange,
}: TrendFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Time period selector */}
      <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
        {TIME_PERIODS.map((period) => (
          <Button
            key={period.id}
            variant={selectedPeriod === period.id ? "default" : "ghost"}
            size="sm"
            onClick={() => onPeriodChange(period.id)}
            className="text-xs"
          >
            <Calendar className="h-3 w-3 mr-1.5" />
            {period.label}
          </Button>
        ))}
      </div>

      {/* Category filter */}
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full sm:w-[220px]">
          <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Thématique" />
        </SelectTrigger>
        <SelectContent>
          {TREND_CATEGORIES.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
