import { useState, useEffect, useRef } from "react";
import { addMonths, subMonths, format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, TrendingUp, MessageCircle, Sparkles, Building2, Users, Kanban, ChevronDown, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { StrategicCalendarGrid } from "@/components/calendar/StrategicCalendarGrid";
import { StrategicCalendarLegend } from "@/components/calendar/StrategicCalendarLegend";
import { 
  StrategicCalendarFilters,
  CalendarElementType,
  CalendarPlatformFilter,
  SensitivityFilter
} from "@/components/calendar/StrategicCalendarFilters";
import { PublicationDialog } from "@/components/calendar/PublicationDialog";
import { PublicationDetailPanel } from "@/components/calendar/PublicationDetailPanel";
import { KeyDateDetailPanel } from "@/components/calendar/KeyDateDetailPanel";
import { JudicialEventDetailPanel } from "@/components/calendar/JudicialEventDetailPanel";
import { ScheduledPublicationsCarousel } from "@/components/calendar/ScheduledPublicationsCarousel";
import { EditorialWorkloadBar } from "@/components/calendar/EditorialWorkloadBar";
import { EditorialGapsAlerts } from "@/components/calendar/EditorialGapsAlerts";
import { EditorialOpportunitiesPanel } from "@/components/calendar/EditorialOpportunitiesPanel";
import { EditorialPipelineView } from "@/components/calendar/EditorialPipelineView";
import { CampaignDialog } from "@/components/editorial/CampaignDialog";
import { FirmSelector } from "@/components/layout/FirmSelector";
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
import { usePublications, Publication } from "@/hooks/usePublications";
import { useValidationSLA } from "@/hooks/useValidationSLA";
import { useAutoValidation } from "@/hooks/useAutoValidation";
import { useKeyDates, KeyDate } from "@/hooks/useKeyDates";
import { useJudicialEvents, JudicialEvent } from "@/hooks/useJudicialEvents";
import { useUserRole } from "@/hooks/useUserRole";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import { useLawFirmContextSafe, LawFirm } from "@/contexts/LawFirmContext";
import { LEGAL_THEMATICS, LegalThematic } from "@/data/mockJudicialEvents";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useLocation } from "react-router-dom";

type CalendarViewMode = "firm" | "global";
type CalendarDisplayMode = "calendar" | "pipeline";

export default function CalendarPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationState = location.state as { viewMode?: CalendarViewMode } | null;
  
  const { isCommunityManager } = useUserRole();
  const { isCommunityManager: isCMSimulated, isLawyer: isLawyerSimulated, isSimulating } = useSimpleRole();
  const { selectedFirmId, selectedFirm, assignedFirms, setSelectedFirmId } = useLawFirmContextSafe();
  
  const showCMElements = isSimulating ? isCMSimulated : isCommunityManager;
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [selectedKeyDate, setSelectedKeyDate] = useState<{ keyDate: KeyDate; date: Date } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<{ event: JudicialEvent; date: Date } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Display mode: calendar or pipeline
  const [displayMode, setDisplayMode] = useState<CalendarDisplayMode>("calendar");
  
  // CM view mode state
  const [viewMode, setViewMode] = useState<CalendarViewMode>(
    navigationState?.viewMode || "firm"
  );
  const hasInitializedViewMode = useRef(!!navigationState?.viewMode);
  
  useEffect(() => {
    if (!hasInitializedViewMode.current && isCommunityManager && assignedFirms.length > 1) {
      setViewMode("global");
      hasInitializedViewMode.current = true;
    }
  }, [isCommunityManager, assignedFirms.length]);
  
  // Panel states
  const [showPublicationPanel, setShowPublicationPanel] = useState(false);
  const [showKeyDatePanel, setShowKeyDatePanel] = useState(false);
  const [showEventPanel, setShowEventPanel] = useState(false);
  const [isPublishingNow, setIsPublishingNow] = useState(false);
  const [networkActionLoadingId, setNetworkActionLoadingId] = useState<string | null>(null);
  
  // Filter states
  const [elementType, setElementType] = useState<CalendarElementType>("all");
  const [platformFilter, setPlatformFilter] = useState<CalendarPlatformFilter>("all");
  const [thematicFilter, setThematicFilter] = useState<LegalThematic | "all">("all");
  const [sensitivityFilter, setSensitivityFilter] = useState<SensitivityFilter>("all");
  const [showDrafts, setShowDrafts] = useState(true);
  const [showToValidate, setShowToValidate] = useState(true);
  const [showScheduled, setShowScheduled] = useState(true);

  const {
    publications,
    loading: publicationsLoading,
    createPublication,
    updatePublication,
    deletePublication,
    publishPublicationNow,
    deleteNetworkPublication,
    refetch: refetchPublications,
  } = usePublications({ 
    showAllFirms: isCommunityManager && viewMode === "global" 
  });

  const { keyDates, loading: keyDatesLoading } = useKeyDates();
  const { events: judicialEvents, loading: eventsLoading } = useJudicialEvents();
  const { validatePublication } = useValidationSLA();

  const { getAutoValidationInfo } = useAutoValidation();
  
  useEffect(() => {
    refetchPublications();
  }, [viewMode, refetchPublications]);

  useEffect(() => {
    if (!selectedPublication) {
      return;
    }

    const refreshedPublication = publications.find(
      (publication) => publication.id === selectedPublication.id,
    );

    if (!refreshedPublication) {
      setSelectedPublication(null);
      setShowPublicationPanel(false);
      return;
    }

    const currentAttempts = JSON.stringify(selectedPublication.publications ?? []);
    const nextAttempts = JSON.stringify(refreshedPublication.publications ?? []);

    if (
      refreshedPublication.status !== selectedPublication.status ||
      refreshedPublication.updated_at !== selectedPublication.updated_at ||
      refreshedPublication.published_at !== selectedPublication.published_at ||
      currentAttempts !== nextAttempts
    ) {
      setSelectedPublication(refreshedPublication);
    }
  }, [publications, selectedPublication]);
  
  const loading = publicationsLoading || keyDatesLoading || eventsLoading;

  const firmsMap = new Map<string, LawFirm>(assignedFirms.map(f => [f.id, f]));
  const firmNamesMap = new Map(assignedFirms.map(f => [f.id, f.name]));

  const handleFirmClick = (firmId: string) => {
    setSelectedFirmId(firmId);
    setViewMode("firm");
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const closePanels = () => {
    setShowPublicationPanel(false);
    setShowKeyDatePanel(false);
    setShowEventPanel(false);
    setSelectedPublication(null);
    setSelectedKeyDate(null);
    setSelectedEvent(null);
  };

  const handleDayClick = (date: Date) => {
    closePanels();
    setSelectedDate(date);
    setDialogOpen(true);
  };

  const handlePublicationClick = (pub: Publication) => {
    closePanels();
    setSelectedPublication(pub);
    setShowPublicationPanel(true);
  };

  const handleKeyDateClick = (keyDate: KeyDate, date: Date) => {
    closePanels();
    setSelectedKeyDate({ keyDate, date });
    setShowKeyDatePanel(true);
  };

  const handleEventClick = (event: JudicialEvent, date: Date) => {
    closePanels();
    setSelectedEvent({ event, date });
    setShowEventPanel(true);
  };

  const handleCreateClick = () => {
    closePanels();
    setSelectedDate(new Date());
    setDialogOpen(true);
  };

  const handleEditPublication = () => {
    if (selectedPublication) {
      setDialogOpen(true);
    }
  };

  const handleValidatePublication = async () => {
    if (selectedPublication) {
      await validatePublication(selectedPublication.id);
      setShowPublicationPanel(false);
    }
  };

  const handleDeletePublication = () => {
    if (selectedPublication) {
      setDeleteConfirmId(selectedPublication.id);
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      await deletePublication(deleteConfirmId);
      setDeleteConfirmId(null);
      closePanels();
    }
  };

  const handleReschedulePublication = () => {
    if (selectedPublication) {
      setDialogOpen(true);
    }
  };

  const handlePublishNow = async () => {
    if (!selectedPublication) {
      return;
    }

    setIsPublishingNow(true);
    await publishPublicationNow(selectedPublication.id);
    setIsPublishingNow(false);
  };

  const handleDeleteNetworkPublication = async (publicationId: string) => {
    if (!selectedPublication) {
      return;
    }

    setNetworkActionLoadingId(publicationId);
    await deleteNetworkPublication(selectedPublication.id, publicationId);
    setNetworkActionLoadingId(null);
  };

  const handleCreateFromKeyDate = () => {
    if (selectedKeyDate) {
      setSelectedDate(selectedKeyDate.date);
      setSelectedPublication(null);
      setDialogOpen(true);
      setShowKeyDatePanel(false);
    }
  };

  const handleCreateFromEvent = () => {
    if (selectedEvent) {
      setSelectedDate(new Date(selectedEvent.event.date));
      setSelectedPublication(null);
      setDialogOpen(true);
      setShowEventPanel(false);
    }
  };

  const handleCreateFromOpportunityKeyDate = (kd: KeyDate) => {
    setSelectedDate(kd.date || new Date());
    setSelectedPublication(null);
    closePanels();
    setDialogOpen(true);
  };

  const handleCreateFromOpportunityEvent = (event: JudicialEvent) => {
    setSelectedDate(new Date(event.date));
    setSelectedPublication(null);
    closePanels();
    setDialogOpen(true);
  };

  const handleContactCM = () => {
    navigate("/assistant?tab=messaging");
  };

  const handleViewTrends = () => {
    navigate("/trends");
  };

  const handlePipelineStatusChange = async (id: string, newStatus: any) => {
    await updatePublication({ id, status: newStatus });
  };

  // Dynamic title
  const calendarTitle = viewMode === "firm" && selectedFirm
    ? `Calendrier éditorial — ${selectedFirm.name}`
    : "Calendrier stratégique";

  const calendarStats = useMemo(() => {
    const draftCount = publications.filter((publication) => publication.status === "brouillon").length;
    const pendingCount = publications.filter((publication) => publication.status === "a_valider").length;
    const scheduledCount = publications.filter(
      (publication) => !["brouillon", "a_valider", "refusee"].includes(publication.status),
    ).length;

    return {
      draftCount,
      pendingCount,
      scheduledCount,
      opportunityCount: keyDates.length + judicialEvents.length,
    };
  }, [judicialEvents.length, keyDates.length, publications]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1380px] space-y-6 w-full overflow-hidden min-w-0">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{calendarTitle}</h1>
              <p className="text-sm text-muted-foreground">
                Anticipez vos prises de parole et identifiez les opportunités éditoriales
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {showCMElements && (
              <Button variant="outline" size="sm" onClick={() => setCampaignDialogOpen(true)}>
                <Sparkles className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Générer les prises de parole du mois ✨</span>
              </Button>
            )}
            <Button onClick={handleCreateClick} size="sm">
              <Plus className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Nouvelle prise de parole</span>
            </Button>
          </div>
        </div>

        {/* Navigation and secondary actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold capitalize whitespace-nowrap">
              {format(currentDate, "MMMM yyyy", { locale: fr })}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Display mode toggle: Calendar / Pipeline */}
            {showCMElements && (
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                <Button
                  variant={displayMode === "calendar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDisplayMode("calendar")}
                  className="h-8"
                >
                  <CalendarIcon className="h-4 w-4 mr-1.5" />
                  <span className="hidden lg:inline">Calendrier</span>
                </Button>
                <Button
                  variant={displayMode === "pipeline" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDisplayMode("pipeline")}
                  className="h-8"
                >
                  <Kanban className="h-4 w-4 mr-1.5" />
                  <span className="hidden lg:inline">Pipeline</span>
                </Button>
              </div>
            )}

            {/* CM View Mode Toggle + Firm Selector */}
            {showCMElements && assignedFirms.length > 1 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 min-w-[200px] justify-between">
                    <Building2 className="h-4 w-4 mr-1.5" />
                    <span className="truncate">Cabinet : {viewMode === "global" ? "Tous les cabinets" : selectedFirm?.name || "…"}</span>
                    <ChevronDown className="h-4 w-4 ml-1.5 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Rechercher un cabinet…" />
                    <CommandList>
                      <CommandEmpty>Aucun cabinet trouvé</CommandEmpty>
                      <CommandGroup>
                        <CommandItem onSelect={() => setViewMode("global")} className="flex items-center justify-between">
                          <span>Tous les cabinets ({assignedFirms.length})</span>
                          {viewMode === "global" && <Check className="h-4 w-4 text-primary" />}
                        </CommandItem>
                        {assignedFirms.map(firm => (
                          <CommandItem
                            key={firm.id}
                            onSelect={() => { setSelectedFirmId(firm.id); setViewMode("firm"); }}
                            className="flex items-center justify-between"
                          >
                            <span>{firm.name}{firm.city ? ` — ${firm.city}` : ""}</span>
                            {viewMode === "firm" && selectedFirmId === firm.id && <Check className="h-4 w-4 text-primary" />}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}

            <Button variant="outline" size="sm" onClick={handleViewTrends}>
              <TrendingUp className="h-4 w-4 lg:mr-1.5" />
              <span className="hidden lg:inline">Actualités juridiques</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleContactCM}>
              <MessageCircle className="h-4 w-4 lg:mr-1.5" />
              <span className="hidden lg:inline">Messagerie CM</span>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CalendarSummaryCard label="Brouillons" value={calendarStats.draftCount} icon={Plus} tone="purple" />
          <CalendarSummaryCard label="A valider" value={calendarStats.pendingCount} icon={Users} tone="amber" />
          <CalendarSummaryCard label="Planifiees" value={calendarStats.scheduledCount} icon={CalendarIcon} tone="blue" />
          <CalendarSummaryCard label="Opportunites" value={calendarStats.opportunityCount} icon={TrendingUp} tone="green" />
        </div>

        {/* Workload bar + Gap alerts (CM only, global view) */}
        {showCMElements && viewMode === "global" && displayMode === "calendar" && (
          <div className="space-y-3">
            <EditorialWorkloadBar
              publications={publications}
              assignedFirms={assignedFirms}
              currentDate={currentDate}
            />
            <EditorialGapsAlerts
              publications={publications}
              assignedFirms={assignedFirms}
              currentDate={currentDate}
            />
          </div>
        )}

        {/* Carousel */}
        {displayMode === "calendar" && (
          <ScheduledPublicationsCarousel
            publications={publications}
            onSendToValidation={async (id) => {
              await updatePublication({ id, status: "a_valider" });
            }}
            onEditPublication={(id) => navigate(`/editor/${id}`)}
            onDeletePublication={async (id) => {
              await deletePublication(id);
            }}
            onPublicationClick={handlePublicationClick}
            showFirmBadge={isCommunityManager}
            firmNamesMap={firmNamesMap}
          />
        )}

        {/* Pipeline View */}
        {displayMode === "pipeline" && (
          <EditorialPipelineView
            publications={publications}
            firmNamesMap={firmNamesMap}
            onPublicationClick={handlePublicationClick}
            onStatusChange={handlePipelineStatusChange}
          />
        )}

        {/* Calendar View */}
        {displayMode === "calendar" && (
          <>
            <div className="rounded-[30px] border border-[#e9edf7] bg-white p-4 shadow-[0_14px_40px_rgba(110,122,167,0.05)] md:p-5">
              <StrategicCalendarFilters
                elementType={elementType}
                platformFilter={platformFilter}
                thematicFilter={thematicFilter}
                sensitivityFilter={sensitivityFilter}
                showDrafts={showDrafts}
                showToValidate={showToValidate}
                showScheduled={showScheduled}
                onElementTypeChange={setElementType}
                onPlatformFilterChange={setPlatformFilter}
                onThematicFilterChange={setThematicFilter}
                onSensitivityFilterChange={setSensitivityFilter}
                onShowDraftsChange={setShowDrafts}
                onShowToValidateChange={setShowToValidate}
                onShowScheduledChange={setShowScheduled}
              />

              <div className="mt-4">
                <StrategicCalendarLegend />
              </div>
            </div>

            {/* Main content area */}
            <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
              <div className="min-w-0">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full rounded-[18px]" />
                    <Skeleton className="h-[500px] w-full rounded-[28px]" />
                  </div>
                ) : (
                  <StrategicCalendarGrid
                    currentDate={currentDate}
                    publications={publications}
                    keyDates={keyDates}
                    judicialEvents={judicialEvents}
                    elementType={elementType}
                    platformFilter={platformFilter}
                    thematicFilter={thematicFilter}
                    sensitivityFilter={sensitivityFilter}
                    showDrafts={showDrafts}
                    showToValidate={showToValidate}
                    showScheduled={showScheduled}
                    onDayClick={handleDayClick}
                    onPublicationClick={handlePublicationClick}
                    onKeyDateClick={handleKeyDateClick}
                    onEventClick={handleEventClick}
                    showFirmBadge={isCommunityManager && viewMode === "global"}
                    firmNamesMap={firmNamesMap}
                    onFirmClick={isCommunityManager ? handleFirmClick : undefined}
                  />
                )}
              </div>

              {/* Detail panel */}
              <div className="lg:sticky lg:top-4 lg:self-start">
                {showPublicationPanel && selectedPublication && (
                  <PublicationDetailPanel
                    publication={selectedPublication}
                    onClose={closePanels}
                    onEdit={handleEditPublication}
                    onValidate={selectedPublication.status === "a_valider" ? handleValidatePublication : undefined}
                    onDelete={handleDeletePublication}
                    onReschedule={handleReschedulePublication}
                    onPublishNow={handlePublishNow}
                    onDeleteNetworkPublication={handleDeleteNetworkPublication}
                    isPublishingNow={isPublishingNow}
                    networkActionLoadingId={networkActionLoadingId}
                    autoValidationInfo={
                      selectedPublication.status === "a_valider" && selectedPublication.source === "socialpulse"
                        ? getAutoValidationInfo(
                            selectedPublication.created_at,
                            selectedPublication.scheduled_date,
                            selectedPublication.scheduled_time
                          )
                        : null
                    }
                    firmName={
                      isCommunityManager && viewMode === "global" && selectedPublication.law_firm_id
                        ? firmsMap.get(selectedPublication.law_firm_id)?.name
                        : undefined
                    }
                  />
                )}
                
                {showKeyDatePanel && selectedKeyDate && (
                  <KeyDateDetailPanel
                    keyDate={selectedKeyDate.keyDate}
                    onClose={closePanels}
                    onCreatePublication={handleCreateFromKeyDate}
                  />
                )}

                {showEventPanel && selectedEvent && (
                  <JudicialEventDetailPanel
                    event={selectedEvent.event}
                    onClose={closePanels}
                    onCreatePublication={selectedEvent.event.sensitivity !== "eviter" ? handleCreateFromEvent : undefined}
                    onContactCM={handleContactCM}
                  />
                )}

                {/* Empty state → Opportunities panel */}
                {!showPublicationPanel && !showKeyDatePanel && !showEventPanel && (
                  <div className="hidden lg:block">
                    <EditorialOpportunitiesPanel
                      keyDates={keyDates}
                      judicialEvents={judicialEvents}
                      onCreateFromKeyDate={handleCreateFromOpportunityKeyDate}
                      onCreateFromEvent={handleCreateFromOpportunityEvent}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Dialogs */}
        <PublicationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          publication={selectedPublication}
          defaultDate={selectedDate}
          defaultFirmId={viewMode === "firm" ? selectedFirmId : null}
          onSave={createPublication}
          onUpdate={updatePublication}
          onDelete={deletePublication}
        />

        {showCMElements && (
          <CampaignDialog
            open={campaignDialogOpen}
            onOpenChange={setCampaignDialogOpen}
            onSuccess={refetchPublications}
          />
        )}

        {/* Delete confirmation */}
        <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cette publication ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. La publication sera définitivement supprimée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Supprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}

function CalendarSummaryCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof CalendarIcon;
  tone: "purple" | "amber" | "blue" | "green";
}) {
  const toneMap = {
    purple: { wrap: "bg-[#f1ecff]", icon: "text-[#6557e8]" },
    amber: { wrap: "bg-[#fff3da]", icon: "text-[#f59f0d]" },
    blue: { wrap: "bg-[#eaf2ff]", icon: "text-[#4f6bff]" },
    green: { wrap: "bg-[#eafff2]", icon: "text-[#18ba7b]" },
  } as const;

  return (
    <div className="rounded-[24px] border border-[#e9edf7] bg-[#fbfcff] px-5 py-5 shadow-[0_10px_30px_rgba(112,122,163,0.04)]">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-[18px] ${toneMap[tone].wrap}`}>
          <Icon className={`h-5 w-5 ${toneMap[tone].icon}`} />
        </div>
        <div>
          <p className="text-[24px] font-bold leading-none text-[#1f2538]">{value}</p>
          <p className="mt-1 text-[14px] text-[#9aa1b8]">{label}</p>
        </div>
      </div>
    </div>
  );
}
