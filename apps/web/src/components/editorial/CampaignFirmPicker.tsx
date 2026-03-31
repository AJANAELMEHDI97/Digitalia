import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LawFirm } from "@/contexts/LawFirmContext";
import { Search, Building2, X, CheckSquare, Square } from "lucide-react";

interface CampaignFirmPickerProps {
  firms: LawFirm[];
  selectedFirmIds: string[];
  onSelectionChange: (ids: string[]) => void;
  startDate?: Date;
  endDate?: Date;
}

const SPECIALTY_OPTIONS = [
  "Droit du travail",
  "Droit de la famille",
  "Droit des affaires",
  "Droit pénal",
  "Droit immobilier",
  "Droit fiscal",
  "Droit de la propriété intellectuelle",
  "Droit de la consommation",
  "Droit de l'environnement",
  "Droit de la santé",
  "Droit des étrangers",
  "Droit social",
  "Droit des contrats",
  "Droit de la construction",
];

export function CampaignFirmPicker({
  firms,
  selectedFirmIds,
  onSelectionChange,
  startDate,
  endDate,
}: CampaignFirmPickerProps) {
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");

  const filteredFirms = useMemo(() => {
    let result = firms;

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.city?.toLowerCase().includes(q) ||
          f.bar_association?.toLowerCase().includes(q)
      );
    }

    // Filter by specialty
    if (specialtyFilter && specialtyFilter !== "all") {
      result = result.filter((f) =>
        f.specialization_areas?.some(
          (s) => s.toLowerCase() === specialtyFilter.toLowerCase()
        )
      );
    }

    return result;
  }, [firms, search, specialtyFilter]);

  const toggleFirm = (firmId: string) => {
    if (selectedFirmIds.includes(firmId)) {
      onSelectionChange(selectedFirmIds.filter((id) => id !== firmId));
    } else {
      onSelectionChange([...selectedFirmIds, firmId]);
    }
  };

  const selectAll = () => {
    const allFilteredIds = filteredFirms.map((f) => f.id);
    const merged = new Set([...selectedFirmIds, ...allFilteredIds]);
    onSelectionChange(Array.from(merged));
  };

  const deselectAll = () => {
    const filteredIds = new Set(filteredFirms.map((f) => f.id));
    onSelectionChange(selectedFirmIds.filter((id) => !filteredIds.has(id)));
  };

  const allFilteredSelected = filteredFirms.length > 0 && filteredFirms.every((f) => selectedFirmIds.includes(f.id));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Cabinets concernés *</Label>
        {selectedFirmIds.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {selectedFirmIds.length} cabinet{selectedFirmIds.length > 1 ? "s" : ""} sélectionné{selectedFirmIds.length > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Filters row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un cabinet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
          <SelectTrigger className="w-[200px] h-9 text-sm">
            <SelectValue placeholder="Spécialité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes spécialités</SelectItem>
            {SPECIALTY_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Select all / Deselect all */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs px-2"
          onClick={allFilteredSelected ? deselectAll : selectAll}
        >
          {allFilteredSelected ? (
            <>
              <Square className="h-3 w-3 mr-1" />
              Tout désélectionner
            </>
          ) : (
            <>
              <CheckSquare className="h-3 w-3 mr-1" />
              Tout sélectionner ({filteredFirms.length})
            </>
          )}
        </Button>
      </div>

      {/* Firms list */}
      <ScrollArea className="h-40 rounded-md border">
        <div className="p-2 space-y-1">
          {filteredFirms.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun cabinet trouvé
            </p>
          ) : (
            filteredFirms.map((firm) => {
              const isSelected = selectedFirmIds.includes(firm.id);
              return (
                <label
                  key={firm.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-primary/5 border border-primary/20"
                      : "hover:bg-muted/50 border border-transparent"
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleFirm(firm.id)}
                  />
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{firm.name}</p>
                    <div className="flex items-center gap-2">
                      {firm.city && (
                        <span className="text-xs text-muted-foreground">{firm.city}</span>
                      )}
                      {firm.specialization_areas && firm.specialization_areas.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          · {firm.specialization_areas.slice(0, 2).join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Selected firms summary chips */}
      {selectedFirmIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedFirmIds.slice(0, 5).map((id) => {
            const firm = firms.find((f) => f.id === id);
            if (!firm) return null;
            return (
              <Badge
                key={id}
                variant="outline"
                className="text-xs pl-2 pr-1 py-0.5 gap-1"
              >
                {firm.name}
                <button
                  type="button"
                  onClick={() => toggleFirm(id)}
                  className="hover:bg-muted rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          {selectedFirmIds.length > 5 && (
            <Badge variant="secondary" className="text-xs">
              +{selectedFirmIds.length - 5} autres
            </Badge>
          )}
        </div>
      )}

      {selectedFirmIds.length === 0 && (
        <p className="text-sm text-destructive">
          Sélectionnez au moins un cabinet
        </p>
      )}
    </div>
  );
}
