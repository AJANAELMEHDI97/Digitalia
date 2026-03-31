import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon, Sparkles, Loader2, X, Zap } from "lucide-react";
import { format, startOfMonth, endOfMonth, differenceInWeeks } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  CampaignConfig,
  SchedulingMode,
  LEGAL_THEMATICS,
  SOCIAL_PLATFORMS,
  EDITORIAL_TONES,
  FREQUENCIES,
  CONTENT_TYPES,
  PUBLISH_DAYS,
  DEFAULT_PUBLISH_DAYS,
  PUBLISH_TIMES,
  DEFAULT_PUBLISH_TIMES,
} from "@/hooks/useEditorialCampaign";
import { CampaignFirmPicker } from "./CampaignFirmPicker";
import { useLawFirmContextSafe } from "@/contexts/LawFirmContext";
import { useUserRole } from "@/hooks/useUserRole";

interface CampaignConfigStepProps {
  onGenerate: (config: CampaignConfig) => void;
  isGenerating: boolean;
  initialConfig?: CampaignConfig | null;
  generationProgress?: string | null;
}

export function CampaignConfigStep({
  onGenerate,
  isGenerating,
  initialConfig,
  generationProgress,
}: CampaignConfigStepProps) {
  const { assignedFirms } = useLawFirmContextSafe();
  const { isCommunityManager } = useUserRole();

  const now = new Date();
  const [startDate, setStartDate] = useState<Date>(
    initialConfig?.startDate || startOfMonth(now)
  );
  const [endDate, setEndDate] = useState<Date>(
    initialConfig?.endDate || endOfMonth(now)
  );
  const [selectedFirmIds, setSelectedFirmIds] = useState<string[]>(
    initialConfig?.selectedFirmIds || []
  );
  const [thematics, setThematics] = useState<string[]>(
    initialConfig?.thematics || []
  );
  const [platforms, setPlatforms] = useState<string[]>(
    initialConfig?.platforms || ["linkedin"]
  );
  const [tone, setTone] = useState(initialConfig?.tone || "professional");
  const [frequency, setFrequency] = useState(
    initialConfig?.frequency || "3_per_week"
  );
  const [contentTypes, setContentTypes] = useState<string[]>(
    initialConfig?.contentTypes || []
  );
  const [publishDays, setPublishDays] = useState<string[]>(
    initialConfig?.publishDays || DEFAULT_PUBLISH_DAYS
  );
  const [publishTimes, setPublishTimes] = useState<string[]>(
    initialConfig?.publishTimes || DEFAULT_PUBLISH_TIMES
  );
  const [schedulingMode, setSchedulingMode] = useState<SchedulingMode>(
    initialConfig?.schedulingMode || "manual"
  );

  const toggleThematic = (thematic: string) => {
    setThematics((prev) =>
      prev.includes(thematic) ? prev.filter((t) => t !== thematic) : [...prev, thematic]
    );
  };

  const togglePlatform = (platformId: string) => {
    setPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((p) => p !== platformId) : [...prev, platformId]
    );
  };

  const toggleContentType = (id: string) => {
    setContentTypes((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const togglePublishDay = (id: string) => {
    setPublishDays((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const togglePublishTime = (id: string) => {
    setPublishTimes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const showFirmPicker = isCommunityManager && assignedFirms.length > 0;

  // Calculate estimated publications
  const weeks = Math.max(1, differenceInWeeks(endDate, startDate) + 1);
  const pubsPerWeek = frequency === "1_per_week" ? 1 : frequency === "2_per_week" ? 2 : frequency === "3_per_week" ? 3 : 5;
  const estimatedPubs = Math.min(pubsPerWeek * weeks, 30);

  const handleSubmit = () => {
    if (thematics.length === 0 || platforms.length === 0) return;
    if (showFirmPicker && selectedFirmIds.length === 0) return;

    onGenerate({
      startDate,
      endDate,
      thematics,
      platforms,
      tone,
      frequency,
      selectedFirmIds: showFirmPicker ? selectedFirmIds : undefined,
      contentTypes: contentTypes.length > 0 ? contentTypes : undefined,
      publishDays: schedulingMode === "manual" && publishDays.length > 0 ? publishDays : undefined,
      publishTimes: schedulingMode === "manual" && publishTimes.length > 0 ? publishTimes : undefined,
      schedulingMode,
    });
  };

  const isValid =
    thematics.length > 0 &&
    platforms.length > 0 &&
    (!showFirmPicker || selectedFirmIds.length > 0);

  const SectionTitle = ({ num, children }: { num: number; children: React.ReactNode }) => (
    <div className="flex items-center gap-2.5">
      <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
        {num}
      </span>
      <Label className="text-sm font-semibold">{children}</Label>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* 1. Cabinets concernés */}
      {showFirmPicker && (
        <div className="space-y-2">
          <SectionTitle num={1}>Cabinets concernés *</SectionTitle>
          <CampaignFirmPicker
            firms={assignedFirms}
            selectedFirmIds={selectedFirmIds}
            onSelectionChange={setSelectedFirmIds}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      )}

      {/* 2. Période */}
      <div className="space-y-2">
        <SectionTitle num={showFirmPicker ? 2 : 1}>Période</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Date de début</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "d MMMM yyyy", { locale: fr }) : <span>Sélectionner</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  initialFocus
                  locale={fr}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Date de fin</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "d MMMM yyyy", { locale: fr }) : <span>Sélectionner</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && setEndDate(date)}
                  disabled={(date) => date < startDate}
                  initialFocus
                  locale={fr}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* 3. Fréquence */}
      <div className="space-y-2">
        <SectionTitle num={showFirmPicker ? 3 : 2}>Fréquence de publication</SectionTitle>
        <Select value={frequency} onValueChange={setFrequency}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FREQUENCIES.map((f) => (
              <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          ≈ <span className="font-medium text-foreground">{estimatedPubs} publications</span> sur la période
          {showFirmPicker && selectedFirmIds.length > 1 && (
            <> · <span className="font-medium text-foreground">{estimatedPubs * selectedFirmIds.length} au total</span> pour {selectedFirmIds.length} cabinets</>
          )}
        </p>
      </div>

      {/* 4. Types de contenus */}
      <div className="space-y-2">
        <SectionTitle num={showFirmPicker ? 4 : 3}>Types de contenus</SectionTitle>
        <div className="flex flex-wrap gap-3">
          {CONTENT_TYPES.map((ct) => (
            <label key={ct.id} className="flex items-center space-x-2 cursor-pointer">
              <Checkbox checked={contentTypes.includes(ct.id)} onCheckedChange={() => toggleContentType(ct.id)} />
              <span className="text-sm">{ct.label}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Si aucun format n'est sélectionné, l'IA mélange automatiquement les types.
        </p>
      </div>

      {/* 5. Mode de planification */}
      <div className="space-y-3">
        <SectionTitle num={showFirmPicker ? 5 : 4}>Planification des jours et heures</SectionTitle>
        <RadioGroup
          value={schedulingMode}
          onValueChange={(v) => setSchedulingMode(v as SchedulingMode)}
          className="flex gap-4"
        >
          <label className="flex items-center space-x-2 cursor-pointer">
            <RadioGroupItem value="manual" />
            <span className="text-sm">Manuel</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <RadioGroupItem value="auto" />
            <span className="text-sm flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Optimisé automatiquement
            </span>
          </label>
        </RadioGroup>

        {schedulingMode === "auto" ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-1.5 font-medium text-amber-700 dark:text-amber-400 mb-1">
              <Zap className="h-3.5 w-3.5" />
              Planification optimisée par SocialPulse
            </p>
            <p className="text-xs">
              Les jours et horaires seront sélectionnés automatiquement en fonction de l'historique
              de performance du cabinet, des données d'engagement sur les réseaux sociaux et de la spécialité juridique.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Jours de publication */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Jours de publication</Label>
              <div className="flex flex-wrap gap-3">
                {PUBLISH_DAYS.map((day) => (
                  <label key={day.id} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox checked={publishDays.includes(day.id)} onCheckedChange={() => togglePublishDay(day.id)} />
                    <span className="text-sm">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Heures recommandées */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Heures recommandées</Label>
              <div className="flex flex-wrap gap-3">
                {PUBLISH_TIMES.map((time) => (
                  <label key={time.id} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox checked={publishTimes.includes(time.id)} onCheckedChange={() => togglePublishTime(time.id)} />
                    <span className="text-sm">{time.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7. Thématiques juridiques */}
      <div className="space-y-2">
        <SectionTitle num={showFirmPicker ? 6 : 5}>Thématiques juridiques *</SectionTitle>
        <ScrollArea className="h-32 rounded-md border p-3">
          <div className="flex flex-wrap gap-2">
            {LEGAL_THEMATICS.map((thematic) => (
              <Badge
                key={thematic}
                variant={thematics.includes(thematic) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => toggleThematic(thematic)}
              >
                {thematic}
                {thematics.includes(thematic) && <X className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
          </div>
        </ScrollArea>
        {thematics.length === 0 && (
          <p className="text-sm text-destructive">Sélectionnez au moins une thématique</p>
        )}
      </div>

      {/* 8. Réseaux sociaux */}
      <div className="space-y-2">
        <SectionTitle num={showFirmPicker ? 7 : 6}>Réseaux sociaux *</SectionTitle>
        <div className="flex flex-wrap gap-4">
          {SOCIAL_PLATFORMS.map((platform) => (
            <label key={platform.id} className="flex items-center space-x-2 cursor-pointer">
              <Checkbox checked={platforms.includes(platform.id)} onCheckedChange={() => togglePlatform(platform.id)} />
              <span className="text-sm">{platform.label}</span>
            </label>
          ))}
        </div>
        {platforms.length === 0 && (
          <p className="text-sm text-destructive">Sélectionnez au moins un réseau</p>
        )}
      </div>

      {/* 9. Ton éditorial */}
      <div className="space-y-2">
        <SectionTitle num={showFirmPicker ? 8 : 7}>Ton éditorial</SectionTitle>
        <Select value={tone} onValueChange={setTone}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EDITORIAL_TONES.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bouton de génération */}
      <Button onClick={handleSubmit} disabled={!isValid || isGenerating} className="w-full" size="lg">
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {generationProgress
              ? `Génération ${generationProgress} cabinets...`
              : "Génération en cours..."}
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Générer les prises de parole
          </>
        )}
      </Button>
    </div>
  );
}
