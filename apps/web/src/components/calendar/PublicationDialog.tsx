import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Trash2, Building2, Check, ChevronDown, X, Scale, Copy, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ImageUpload } from "./ImageUpload";
import { AIPostAssistant } from "@/components/editor/AIPostAssistant";
import { AIImageGenerator } from "@/components/editor/AIImageGenerator";
import { useLawFirmContextSafe, type LawFirm } from "@/contexts/LawFirmContext";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import type {
  Publication,
  PublicationStatus,
  CreatePublicationData,
  SocialPlatform,
} from "@/hooks/usePublications";

interface PublicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publication?: Publication | null;
  defaultDate?: Date;
  defaultFirmId?: string | null;
  onSave: (data: CreatePublicationData) => Promise<any>;
  onUpdate: (data: { id: string } & Partial<CreatePublicationData>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

const STATUS_OPTIONS: { value: PublicationStatus; label: string }[] = [
  { value: "brouillon", label: "Brouillon" },
  { value: "a_valider", label: "À valider" },
  { value: "programme", label: "Programmé" },
];

const PRIORITY_OPTIONS = [
  { value: "routine", label: "Routine" },
  { value: "important", label: "Important" },
  { value: "strategique", label: "Stratégique" },
];

const PLATFORM_OPTIONS: { value: SocialPlatform; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "X (Twitter)" },
  { value: "google_business", label: "Google Business" },
];

const LEGAL_THEMES = [
  "Droit immobilier",
  "Droit fiscal",
  "Droit du travail",
  "Droit commercial",
  "Droit des affaires",
  "Droit pénal",
  "Droit de la famille",
  "Droit social",
  "Droit numérique",
];

export function PublicationDialog({
  open,
  onOpenChange,
  publication,
  defaultDate,
  defaultFirmId,
  onSave,
  onUpdate,
  onDelete,
}: PublicationDialogProps) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("09:00");
  const [status, setStatus] = useState<PublicationStatus>("brouillon");
  const [priority, setPriority] = useState("routine");
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>("linkedin");
  const [selectedFirmId, setSelectedFirmId] = useState<string | null>(null);
  const [selectedFirmIds, setSelectedFirmIds] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [firmPopoverOpen, setFirmPopoverOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [firmContents, setFirmContents] = useState<Record<string, { content: string; imageUrl: string }>>({});
  const [activeVersionTab, setActiveVersionTab] = useState<string>("");
  const [isGeneratingVersions, setIsGeneratingVersions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isCommunityManager } = useUserRole();
  const { assignedFirms, selectedFirmId: contextFirmId } = useLawFirmContextSafe();

  const showFirmSelector = isCommunityManager && assignedFirms.length > 0;
  const isEditing = !!publication;

  // Filter firms by selected legal theme
  const filteredFirms = useMemo(() => {
    if (!selectedTheme) return assignedFirms;
    return assignedFirms.filter(f =>
      (f as any).specialization_areas?.some((s: string) =>
        s.toLowerCase().includes(selectedTheme.toLowerCase()) ||
        selectedTheme.toLowerCase().includes(s.toLowerCase())
      )
    );
  }, [assignedFirms, selectedTheme]);

  const selectedFirm = assignedFirms.find(f => f.id === selectedFirmId);

  const showVersions = !isEditing && selectedFirmIds.length > 1;

  const toggleFirm = (firmId: string) => {
    setSelectedFirmIds(prev =>
      prev.includes(firmId) ? prev.filter(id => id !== firmId) : [...prev, firmId]
    );
  };

  // Sync firmContents when selectedFirmIds change
  useEffect(() => {
    if (!showVersions) return;
    setFirmContents(prev => {
      const next = { ...prev };
      for (const id of selectedFirmIds) {
        if (!next[id]) {
          next[id] = { content: content, imageUrl: imageUrl };
        }
      }
      // Remove firms no longer selected
      for (const id of Object.keys(next)) {
        if (!selectedFirmIds.includes(id)) delete next[id];
      }
      return next;
    });
    if (!activeVersionTab || !selectedFirmIds.includes(activeVersionTab)) {
      setActiveVersionTab(selectedFirmIds[0] || "");
    }
  }, [selectedFirmIds, showVersions]);

  const updateFirmContent = useCallback((firmId: string, field: "content" | "imageUrl", value: string) => {
    setFirmContents(prev => ({
      ...prev,
      [firmId]: { ...prev[firmId], [field]: value },
    }));
  }, []);

  const resetFirmToMaster = useCallback((firmId: string) => {
    setFirmContents(prev => ({
      ...prev,
      [firmId]: { content, imageUrl },
    }));
  }, [content, imageUrl]);

  const generateVersions = useCallback(async () => {
    if (!content.trim() || selectedFirmIds.length < 2) return;

    const firms = selectedFirmIds.map(id => {
      const firm = assignedFirms.find(f => f.id === id);
      return {
        id,
        name: firm?.name || "Cabinet",
        city: firm?.city || null,
        specializations: firm?.specialization_areas || [],
      };
    });

    setIsGeneratingVersions(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-firm-versions", {
        body: { masterContent: content, firms },
      });

      if (error) {
        console.error("Error generating versions:", error);
        toast.error("Erreur lors de la génération des versions");
        return;
      }

      if (data?.versions?.length) {
        setFirmContents(prev => {
          const next = { ...prev };
          for (const v of data.versions) {
            if (selectedFirmIds.includes(v.firmId)) {
              next[v.firmId] = { content: v.content, imageUrl: prev[v.firmId]?.imageUrl || imageUrl };
            }
          }
          return next;
        });
        toast.success("Versions générées avec succès");
      }
    } catch (e) {
      console.error("Failed to generate versions:", e);
      toast.error("Erreur lors de la génération des versions");
    } finally {
      setIsGeneratingVersions(false);
    }
  }, [content, selectedFirmIds, assignedFirms, imageUrl]);

  // Auto-generate versions when master content changes (debounced)
  useEffect(() => {
    if (!showVersions || !content.trim() || selectedFirmIds.length < 2) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      generateVersions();
    }, 1500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [content, showVersions, selectedFirmIds.length]);

  const selectAllFiltered = () => {
    setSelectedFirmIds(filteredFirms.map(f => f.id));
  };

  const deselectAll = () => {
    setSelectedFirmIds([]);
  };

  useEffect(() => {
    if (publication) {
      setContent(publication.content);
      setImageUrl(publication.image_url || "");
      setDate(new Date(publication.scheduled_date));
      setTime(publication.scheduled_time.slice(0, 5));
      setStatus(publication.status);
      setPriority((publication as any).priority || "routine");
      setSelectedPlatform(
        publication.platform && publication.platform !== "blog"
          ? publication.platform
          : "linkedin",
      );
      setSelectedFirmId(publication.law_firm_id || null);
      setSelectedFirmIds([]);
      setSelectedTheme(null);
    } else {
      setContent("");
      setImageUrl("");
      setDate(defaultDate || new Date());
      setTime("09:00");
      setStatus("brouillon");
      setPriority("routine");
      setSelectedPlatform("linkedin");
      setSelectedTheme(null);
      const preselected = defaultFirmId ?? contextFirmId ?? (assignedFirms.length === 1 ? assignedFirms[0].id : null);
      setSelectedFirmId(preselected);
      setSelectedFirmIds(preselected ? [preselected] : []);
    }
  }, [publication, defaultDate, defaultFirmId, open, contextFirmId, assignedFirms]);

  const handleSubmit = async () => {
    if (!content.trim() || !date) return;

    if (isEditing) {
      if (showFirmSelector && !selectedFirmId) return;
      setLoading(true);
      const data: CreatePublicationData = {
        content: content.trim(),
        image_url: imageUrl.trim() || null,
        scheduled_date: format(date, "yyyy-MM-dd"),
        scheduled_time: time,
        status,
        platform: selectedPlatform,
        law_firm_id: selectedFirmId,
        priority: priority as CreatePublicationData["priority"],
      };
      await onUpdate({ id: publication!.id, ...data });
      setLoading(false);
      onOpenChange(false);
      return;
    }

    // Creation mode
    const firmIds = showFirmSelector ? selectedFirmIds : [null];
    if (showFirmSelector && firmIds.length === 0) return;

    setLoading(true);
    let successCount = 0;
    for (const firmId of firmIds) {
      const version = showVersions && firmId ? firmContents[firmId] : null;
      const data: CreatePublicationData = {
        content: (version?.content ?? content).trim(),
        image_url: (version?.imageUrl ?? imageUrl).trim() || null,
        scheduled_date: format(date, "yyyy-MM-dd"),
        scheduled_time: time,
        status,
        platform: selectedPlatform,
        law_firm_id: firmId,
        priority: priority as CreatePublicationData["priority"],
      };
      const result = await onSave(data);
      if (result) successCount++;
    }

    if (firmIds.length > 1) {
      toast.success(`${successCount} publication${successCount > 1 ? "s" : ""} créée${successCount > 1 ? "s" : ""} à partir du post master`);
    }

    setLoading(false);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!publication) return;
    setLoading(true);
    await onDelete(publication.id);
    setLoading(false);
    setShowDeleteConfirm(false);
    onOpenChange(false);
  };

  const createButtonLabel = isEditing
    ? "Enregistrer"
    : selectedFirmIds.length > 1
      ? `Créer (${selectedFirmIds.length})`
      : "Créer";

  const isSubmitDisabled = loading || !content.trim() || !date || (showFirmSelector && !isEditing && selectedFirmIds.length === 0) || (showFirmSelector && isEditing && !selectedFirmId);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn("max-h-[90vh] flex flex-col p-0", showVersions ? "sm:max-w-[720px]" : "sm:max-w-[720px]")}>
          <DialogHeader className="px-8 pt-8 pb-0">
            <DialogTitle>
              {isEditing ? "Modifier la publication" : "Nouvelle publication"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 px-8 py-6 overflow-y-auto flex-1 min-h-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 mr-1">
            {/* Legal theme — creation mode only, CM only */}
            {showFirmSelector && !isEditing && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Scale className="h-3.5 w-3.5" />
                  Thème juridique
                </Label>
                <Select
                  value={selectedTheme || "__all__"}
                  onValueChange={(v) => {
                    setSelectedTheme(v === "__all__" ? null : v);
                    setSelectedFirmIds([]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les thèmes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Tous les thèmes</SelectItem>
                    {LEGAL_THEMES.map((theme) => (
                      <SelectItem key={theme} value={theme}>
                        {theme}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Firm selector — CM only */}
            {showFirmSelector && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {isEditing ? "Cabinet" : "Cabinets concernés"} <span className="text-destructive">*</span>
                </Label>

                {isEditing ? (
                  /* Single select for editing */
                  <Popover open={firmPopoverOpen} onOpenChange={setFirmPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={firmPopoverOpen}
                        className={cn(
                          "w-full justify-between font-normal",
                          !selectedFirmId && "text-muted-foreground"
                        )}
                      >
                        <span className="truncate">
                          {selectedFirm
                            ? `${selectedFirm.name}${selectedFirm.city ? ` — ${selectedFirm.city}` : ""}`
                            : "Sélectionner un cabinet…"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Rechercher un cabinet…" />
                        <CommandList>
                          <CommandEmpty>Aucun cabinet trouvé</CommandEmpty>
                          <CommandGroup>
                            {assignedFirms.map((firm) => (
                              <CommandItem
                                key={firm.id}
                                value={`${firm.name} ${firm.city || ""}`}
                                onSelect={() => {
                                  setSelectedFirmId(firm.id);
                                  setFirmPopoverOpen(false);
                                }}
                                className="flex items-center justify-between"
                              >
                                <span>{firm.name}{firm.city ? ` — ${firm.city}` : ""}</span>
                                {selectedFirmId === firm.id && (
                                  <Check className="h-4 w-4 text-primary shrink-0" />
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                ) : (
                  /* Multi-select for creation */
                  <>
                    <Popover open={firmPopoverOpen} onOpenChange={setFirmPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={firmPopoverOpen}
                          className={cn(
                            "w-full justify-between font-normal",
                            selectedFirmIds.length === 0 && "text-muted-foreground"
                          )}
                        >
                          <span className="truncate">
                            {selectedFirmIds.length === 0
                              ? "Sélectionner des cabinets…"
                              : `${selectedFirmIds.length} cabinet${selectedFirmIds.length > 1 ? "s" : ""} sélectionné${selectedFirmIds.length > 1 ? "s" : ""}`}
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Rechercher un cabinet…" />
                          <CommandList>
                            <CommandEmpty>Aucun cabinet trouvé</CommandEmpty>
                            <CommandGroup>
                              {/* Select all / deselect all */}
                              <div className="flex items-center justify-between px-2 py-1.5 border-b">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    selectAllFiltered();
                                  }}
                                >
                                  Tout sélectionner ({filteredFirms.length})
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-muted-foreground"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    deselectAll();
                                  }}
                                >
                                  Désélectionner
                                </Button>
                              </div>
                              {filteredFirms.map((firm) => {
                                const isSelected = selectedFirmIds.includes(firm.id);
                                return (
                                  <CommandItem
                                    key={firm.id}
                                    value={`${firm.name} ${firm.city || ""}`}
                                    onSelect={() => toggleFirm(firm.id)}
                                    className="flex items-center gap-2"
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      className="pointer-events-none"
                                    />
                                    <span className="flex-1 truncate">
                                      {firm.name}{firm.city ? ` — ${firm.city}` : ""}
                                    </span>
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {/* Selected firms as tags */}
                    {selectedFirmIds.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedFirmIds.map(id => {
                          const firm = assignedFirms.find(f => f.id === id);
                          if (!firm) return null;
                          return (
                            <Badge key={id} variant="secondary" className="gap-1 pr-1">
                              <span className="truncate max-w-[150px]">{firm.name}</span>
                              <button
                                type="button"
                                onClick={() => toggleFirm(id)}
                                className="ml-0.5 rounded-full hover:bg-muted p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Contenu</Label>
                <AIPostAssistant 
                  platform={selectedPlatform}
                  onGenerated={(generatedContent) => setContent(generatedContent)}
                />
              </div>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Rédigez votre publication..."
                className="min-h-[120px] resize-none py-3 px-4"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Image (optionnel)</Label>
                <AIImageGenerator 
                  postContent={content} 
                  onGenerated={(url) => setImageUrl(url)}
                />
              </div>
              <ImageUpload
                value={imageUrl || null}
                onChange={(url) => setImageUrl(url || "")}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "d MMM yyyy", { locale: fr }) : "Choisir"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Heure</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="py-3 px-4 h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as PublicationStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Plateforme</Label>
                <Select
                  value={selectedPlatform}
                  onValueChange={(value) => setSelectedPlatform(value as SocialPlatform)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORM_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priorite</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Versions générées — multi-firm creation only */}
            {showVersions && selectedFirmIds.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">
                    Versions générées ({selectedFirmIds.length} cabinets)
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={generateVersions}
                    disabled={isGeneratingVersions || !content.trim()}
                  >
                    {isGeneratingVersions ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                    Régénérer les versions
                  </Button>
                </div>
                <Tabs value={activeVersionTab} onValueChange={setActiveVersionTab}>
                  <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50">
                    {selectedFirmIds.map(id => {
                      const firm = assignedFirms.find(f => f.id === id);
                      return (
                        <TabsTrigger key={id} value={id} className="text-xs px-2 py-1">
                          {firm?.name || "Cabinet"}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                  {selectedFirmIds.map(id => {
                    const firm = assignedFirms.find(f => f.id === id);
                    const version = firmContents[id] || { content: "", imageUrl: "" };
                    return (
                      <TabsContent key={id} value={id} className="space-y-3 mt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Version pour <strong>{firm?.name}</strong>
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => resetFirmToMaster(id)}
                          >
                            <Copy className="h-3 w-3" />
                            Réinitialiser
                          </Button>
                        </div>
                        {isGeneratingVersions ? (
                          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Génération en cours…</span>
                          </div>
                        ) : (
                          <>
                            <Textarea
                              value={version.content}
                              onChange={(e) => updateFirmContent(id, "content", e.target.value)}
                              placeholder="Contenu de la version…"
                              className="min-h-[80px] resize-none text-sm"
                            />
                            <ImageUpload
                              value={version.imageUrl || null}
                              onChange={(url) => updateFirmContent(id, "imageUrl", url || "")}
                            />
                          </>
                        )}
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 px-8 pb-8 pt-4 border-t">
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                className="sm:mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
            >
              {createButtonLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette publication ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La publication sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
