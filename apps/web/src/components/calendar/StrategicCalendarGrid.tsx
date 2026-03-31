import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  parseISO,
} from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { 
  Sparkles, 
  Clock, 
  User, 
  Linkedin, 
  Instagram, 
  Facebook, 
  Twitter,
  Newspaper,
  CalendarDays,
  Scale,
  CheckCircle,
  Eye,
  XCircle,
  Image,
  Building2
} from "lucide-react";
import { PlatformBadge } from "@/components/ui/platform-badge";
import type { Publication, PublicationStatus, SocialPlatform } from "@/hooks/usePublications";
import type { KeyDate } from "@/hooks/useKeyDates";
import type { JudicialEvent } from "@/hooks/useJudicialEvents";
import { KEY_DATE_CATEGORIES } from "@/data/mockKeyDates";
import { 
  LEGAL_THEMATICS, 
  SENSITIVITY_CONFIG,
  LegalThematic 
} from "@/data/mockJudicialEvents";
import { 
  CalendarElementType, 
  CalendarPlatformFilter,
  SensitivityFilter 
} from "./StrategicCalendarFilters";

interface StrategicCalendarGridProps {
  currentDate: Date;
  publications: Publication[];
  keyDates: KeyDate[];
  judicialEvents: JudicialEvent[];
  elementType: CalendarElementType;
  platformFilter: CalendarPlatformFilter;
  thematicFilter: LegalThematic | "all";
  sensitivityFilter: SensitivityFilter;
  showDrafts: boolean;
  showToValidate: boolean;
  showScheduled: boolean;
  onDayClick: (date: Date) => void;
  onPublicationClick: (publication: Publication) => void;
  onKeyDateClick: (keyDate: KeyDate, date: Date) => void;
  onEventClick: (event: JudicialEvent, date: Date) => void;
  // For CM global view
  showFirmBadge?: boolean;
  firmNamesMap?: Map<string, string>;
  onFirmClick?: (firmId: string) => void;
}

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const STATUS_STYLES: Record<PublicationStatus, string> = {
  brouillon: "status-draft hover:opacity-80",
  a_valider: "status-pending hover:opacity-80",
  programme: "status-scheduled hover:opacity-80",
  publie: "status-published hover:opacity-80",
  refuse: "status-refused hover:opacity-80",
};

const STATUS_LABELS: Record<PublicationStatus, string> = {
  brouillon: "Brouillon",
  a_valider: "À valider",
  programme: "Programmé",
  publie: "Publié",
  refuse: "Refusé",
};

const PLATFORM_ICONS: Record<SocialPlatform, typeof Linkedin> = {
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  blog: Newspaper,
  google_business: Newspaper, // Uses Building2 icon in platform-badge
};

const SENSITIVITY_ICONS = {
  opportune: CheckCircle,
  surveiller: Eye,
  eviter: XCircle,
};

function PlatformIcon({ platform }: { platform: SocialPlatform }) {
  const Icon = PLATFORM_ICONS[platform];
  return <Icon className="h-3 w-3 flex-shrink-0" />;
}

function getPriorityColor(priority?: string): string {
  switch (priority) {
    case "important": return "hsl(var(--chart-4))";
    case "strategique": return "#8b5cf6";
    default: return "hsl(var(--muted-foreground))";
  }
}

function getDisplayLabel(pub: Publication, showFirmBadge: boolean, firmNamesMap?: Map<string, string>): string {
  const content = (pub.title || pub.content);
  if (showFirmBadge && pub.law_firm_id && firmNamesMap) {
    const firmName = firmNamesMap.get(pub.law_firm_id);
    if (firmName) {
      const short = firmName.length > 8 ? firmName.slice(0, 8) + "…" : firmName;
      const text = content.slice(0, 10);
      return `${short} — ${text}`;
    }
  }
  return content.slice(0, 18) + (content.length > 18 ? "…" : "");
}

function PublicationPreviewTooltip({ 
  publication, 
  firmName,
  firmId,
  onFirmClick
}: { 
  publication: Publication;
  firmName?: string;
  firmId?: string;
  onFirmClick?: (firmId: string) => void;
}) {
  return (
    <div className="space-y-2">
      {firmName && (
        <Badge 
          variant="outline" 
          className={cn(
            "text-xs bg-accent/10",
            onFirmClick && firmId && "cursor-pointer hover:bg-accent/20 transition-colors"
          )}
          onClick={(e) => {
            if (onFirmClick && firmId) {
              e.stopPropagation();
              onFirmClick(firmId);
            }
          }}
        >
          <Building2 className="h-3 w-3 mr-1" />
          {firmName}
          {onFirmClick && firmId && (
            <span className="ml-1 text-[10px] text-muted-foreground">(cliquer pour filtrer)</span>
          )}
        </Badge>
      )}
      {publication.image_url && (
        <div className="w-full h-32 rounded-md overflow-hidden bg-muted">
          <img 
            src={publication.image_url} 
            alt="Aperçu" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <PlatformBadge platform={publication.platform} />
        <Badge 
          variant={
            publication.status === "brouillon" ? "draft" : 
            publication.status === "a_valider" ? "pending" : "scheduled"
          }
          className="text-xs"
        >
          {STATUS_LABELS[publication.status]}
        </Badge>
      </div>
      <p className="text-sm line-clamp-2 text-foreground">{publication.content}</p>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>{publication.scheduled_time.slice(0, 5)}</span>
        {publication.source === "socialpulse" && (
          <span className="flex items-center gap-1 ml-2 text-primary">
            <Sparkles className="h-3 w-3" />
            SocialPulse
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground italic">
        Cliquez pour voir les détails
      </p>
    </div>
  );
}

function KeyDatePreviewTooltip({ keyDate }: { keyDate: KeyDate }) {
  const categoryKey = keyDate.category as keyof typeof KEY_DATE_CATEGORIES;
  const category = KEY_DATE_CATEGORIES[categoryKey] || { label: keyDate.category, color: "bg-gray-500" };
  return (
    <div className="w-56 space-y-2">
      <div className="flex items-center gap-2">
        <Badge className={cn(category.color, "text-white text-xs")}>
          {category.label}
        </Badge>
      </div>
      <p className="text-sm font-medium line-clamp-2">{keyDate.title}</p>
      <p className="text-xs text-muted-foreground line-clamp-2">{keyDate.description}</p>
      <p className="text-xs text-muted-foreground italic">
        Cliquez pour voir les détails
      </p>
    </div>
  );
}

function EventPreviewTooltip({ event }: { event: JudicialEvent }) {
  const thematicKey = event.thematic as keyof typeof LEGAL_THEMATICS;
  const thematic = LEGAL_THEMATICS[thematicKey] || { label: event.thematic, color: "bg-gray-500" };
  const sensitivity = event.sensitivity ? SENSITIVITY_CONFIG[event.sensitivity] : SENSITIVITY_CONFIG.surveiller;
  const SensitivityIcon = event.sensitivity ? SENSITIVITY_ICONS[event.sensitivity] : Eye;
  
  return (
    <div className="w-56 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge className={cn(thematic.color, "text-white text-xs")}>
          {thematic.label}
        </Badge>
        <Badge variant="outline" className={cn("text-xs", sensitivity.color)}>
          <SensitivityIcon className="h-3 w-3 mr-1" />
          {sensitivity.label}
        </Badge>
      </div>
      <p className="text-sm font-medium line-clamp-2">{event.title}</p>
      <p className="text-xs text-muted-foreground italic">
        Cliquez pour voir les détails
      </p>
    </div>
  );
}

export function StrategicCalendarGrid({
  currentDate,
  publications,
  keyDates,
  judicialEvents,
  elementType,
  platformFilter,
  thematicFilter,
  sensitivityFilter,
  showDrafts,
  showToValidate,
  showScheduled,
  onDayClick,
  onPublicationClick,
  onKeyDateClick,
  onEventClick,
  showFirmBadge = false,
  firmNamesMap,
  onFirmClick,
}: StrategicCalendarGridProps) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Filter publications
  const filteredPublications = useMemo(() => {
    return publications.filter((pub) => {
      if (pub.status === "brouillon" && !showDrafts) return false;
      if (pub.status === "a_valider" && !showToValidate) return false;
      if (pub.status === "programme" && !showScheduled) return false;
      if (platformFilter !== "all" && pub.platform !== platformFilter) return false;
      return true;
    });
  }, [publications, showDrafts, showToValidate, showScheduled, platformFilter]);

  const publicationsByDate = useMemo(() => {
    const map = new Map<string, Publication[]>();
    filteredPublications.forEach((pub) => {
      const key = pub.scheduled_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(pub);
    });
    return map;
  }, [filteredPublications]);

  // Map key dates by date (MM-DD to list)
  const keyDatesByMonthDay = useMemo(() => {
    const map = new Map<string, KeyDate[]>();
    keyDates.forEach((kd) => {
      if (!map.has(kd.month_day)) map.set(kd.month_day, []);
      map.get(kd.month_day)!.push(kd);
    });
    return map;
  }, [keyDates]);

  // Map judicial events by date
  const eventsByDate = useMemo(() => {
    const map = new Map<string, JudicialEvent[]>();
    judicialEvents.forEach((event) => {
      // Handle multi-day events
      const startDate = parseISO(event.date);
      const endDate = event.end_date ? parseISO(event.end_date) : startDate;
      
      let current = startDate;
      while (current <= endDate) {
        const key = format(current, "yyyy-MM-dd");
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(event);
        current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
      }
    });
    return map;
  }, [judicialEvents]);

  const showPublications = elementType === "all" || elementType === "publications";
  const showKeyDates = elementType === "all" || elementType === "key-dates";
  const showEvents = elementType === "all" || elementType === "events";

  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const monthDayKey = format(day, "MM-dd");
          const dayPubs = publicationsByDate.get(dateKey) || [];
          const dayKeyDates = keyDatesByMonthDay.get(monthDayKey) || [];
          const dayEvents = (eventsByDate.get(dateKey) || []).filter(event => {
            if (thematicFilter !== "all" && event.thematic !== thematicFilter) return false;
            if (sensitivityFilter !== "all" && event.sensitivity !== sensitivityFilter) return false;
            return true;
          });
          
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);

          const hasContent = 
            (showPublications && dayPubs.length > 0) || 
            (showKeyDates && dayKeyDates.length > 0) ||
            (showEvents && dayEvents.length > 0);

          const maxItems = 3;
          let itemsShown = 0;

          return (
            <div
              key={idx}
              onClick={() => onDayClick(day)}
              className={cn(
                "min-h-[120px] p-2 border-b border-r cursor-pointer transition-colors hover:bg-muted/30",
                !isCurrentMonth && "bg-muted/10"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                    !isCurrentMonth && "text-muted-foreground/50",
                    isCurrentDay && "bg-primary text-primary-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
                {hasContent && (
                  <div className="flex gap-0.5">
                    {showEvents && dayEvents.length > 0 && (
                      <div className="w-2 h-2 rounded-full bg-[hsl(var(--event-text))]" />
                    )}
                    {showKeyDates && dayKeyDates.length > 0 && (
                      <div className="w-2 h-2 rounded-full bg-[hsl(var(--keydate-text))]" />
                    )}
                    {showPublications && dayPubs.filter(p => p.platform === "blog").length > 0 && (
                      <div className="w-2 h-2 rounded-full bg-[hsl(var(--blog-text))]" />
                    )}
                    {showPublications && dayPubs.filter(p => p.platform !== "blog").length > 0 && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                {/* Judicial Events */}
                {showEvents && dayEvents.slice(0, maxItems - itemsShown).map((event) => {
                  itemsShown++;
                  const eventSensitivity = event.sensitivity || "surveiller";
                  const SensIcon = SENSITIVITY_ICONS[eventSensitivity];
                  const sensConfig = SENSITIVITY_CONFIG[eventSensitivity];
                  return (
                    <HoverCard key={event.id} openDelay={400} closeDelay={150}>
                      <HoverCardTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event, day);
                          }}
                          className={cn(
                            "w-full text-left px-2 py-1 rounded text-xs truncate transition-colors flex items-center gap-1",
                            "judicial-event hover:opacity-80"
                          )}
                        >
                          <SensIcon className={cn("h-3 w-3 flex-shrink-0", sensConfig.color)} />
                          <span className="truncate">
                            {event.title.slice(0, 16)}
                            {event.title.length > 16 && "..."}
                          </span>
                        </button>
                      </HoverCardTrigger>
                      <HoverCardContent 
                        side="top" 
                        align="center" 
                        className="p-3 z-50 bg-popover border shadow-lg"
                        sideOffset={4}
                        collisionPadding={16}
                        avoidCollisions={true}
                      >
                        <EventPreviewTooltip event={event} />
                      </HoverCardContent>
                    </HoverCard>
                  );
                })}

                {/* Key dates */}
                {showKeyDates && itemsShown < maxItems && dayKeyDates.slice(0, maxItems - itemsShown).map((keyDate) => {
                  itemsShown++;
                  return (
                    <HoverCard key={keyDate.id} openDelay={400} closeDelay={150}>
                      <HoverCardTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onKeyDateClick(keyDate, day);
                          }}
                          className={cn(
                            "w-full text-left px-2 py-1 rounded text-xs truncate transition-colors flex items-center gap-1",
                            "keydate hover:opacity-80"
                          )}
                        >
                          <CalendarDays className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {keyDate.title.slice(0, 16)}
                            {keyDate.title.length > 16 && "..."}
                          </span>
                        </button>
                      </HoverCardTrigger>
                      <HoverCardContent 
                        side="top" 
                        align="center" 
                        className="p-3 z-50 bg-popover border shadow-lg"
                        sideOffset={4}
                        collisionPadding={16}
                        avoidCollisions={true}
                      >
                        <KeyDatePreviewTooltip keyDate={keyDate} />
                      </HoverCardContent>
                    </HoverCard>
                  );
                })}

                {/* Blog articles - with purple styling */}
                {showPublications && itemsShown < maxItems && dayPubs
                  .filter(pub => pub.platform === "blog")
                  .slice(0, maxItems - itemsShown)
                  .map((pub) => {
                    itemsShown++;
                    return (
                      <HoverCard key={pub.id} openDelay={400} closeDelay={150}>
                        <HoverCardTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPublicationClick(pub);
                            }}
                            className={cn(
                              "w-full text-left px-2 py-1 rounded text-xs truncate transition-colors flex items-center gap-1",
                              "blog-article hover:opacity-80"
                            )}
                          >
                            <Newspaper className="h-3 w-3 flex-shrink-0" />
                          {showFirmBadge && pub.law_firm_id && firmNamesMap?.get(pub.law_firm_id) && (
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: getPriorityColor((pub as any).priority) }} />
                          )}
                          <span className="truncate flex-1">
                            {getDisplayLabel(pub, showFirmBadge, firmNamesMap)}
                          </span>
                            {pub.image_url && (
                              <Image className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                            )}
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent 
                          side="top" 
                          align="center" 
                          className="p-3 z-50 bg-popover border shadow-lg"
                          sideOffset={4}
                          collisionPadding={16}
                          avoidCollisions={true}
                        >
                          <PublicationPreviewTooltip 
                            publication={pub} 
                            firmName={showFirmBadge && pub.law_firm_id ? firmNamesMap?.get(pub.law_firm_id) : undefined}
                            firmId={showFirmBadge ? pub.law_firm_id || undefined : undefined}
                            onFirmClick={onFirmClick}
                          />
                        </HoverCardContent>
                      </HoverCard>
                    );
                  })}

                {/* Other Publications (non-blog) */}
                {showPublications && itemsShown < maxItems && dayPubs
                  .filter(pub => pub.platform !== "blog")
                  .slice(0, maxItems - itemsShown)
                  .map((pub) => {
                  itemsShown++;
                  return (
                    <HoverCard key={pub.id} openDelay={400} closeDelay={150}>
                      <HoverCardTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPublicationClick(pub);
                          }}
                          className={cn(
                            "w-full text-left px-2 py-1 rounded text-xs truncate transition-colors flex items-center gap-1",
                            STATUS_STYLES[pub.status]
                          )}
                        >
                          {pub.platform && <PlatformIcon platform={pub.platform} />}
                          {!pub.platform && pub.source === "socialpulse" && (
                            <Sparkles className="h-3 w-3 flex-shrink-0" />
                          )}
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: getPriorityColor((pub as any).priority) }} />
                          <span className="truncate flex-1">
                            {getDisplayLabel(pub, showFirmBadge, firmNamesMap)}
                          </span>
                          {pub.image_url && (
                            <Image className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                          )}
                        </button>
                      </HoverCardTrigger>
                      <HoverCardContent 
                        side="top" 
                        align="center" 
                        className="p-3 z-50 bg-popover border shadow-lg"
                        sideOffset={4}
                        collisionPadding={16}
                        avoidCollisions={true}
                      >
                        <PublicationPreviewTooltip 
                          publication={pub} 
                          firmName={showFirmBadge && pub.law_firm_id ? firmNamesMap?.get(pub.law_firm_id) : undefined}
                          firmId={showFirmBadge ? pub.law_firm_id || undefined : undefined}
                          onFirmClick={onFirmClick}
                        />
                      </HoverCardContent>
                    </HoverCard>
                  );
                })}

                {/* More indicator */}
                {(() => {
                  const totalItems = 
                    (showPublications ? dayPubs.length : 0) + 
                    (showKeyDates ? dayKeyDates.length : 0) +
                    (showEvents ? dayEvents.length : 0);
                  const remaining = totalItems - itemsShown;
                  if (remaining > 0) {
                    return (
                      <span className="text-xs text-muted-foreground px-2">
                        +{remaining} autres
                      </span>
                    );
                  }
                  // Empty date suggestion
                  if (totalItems === 0 && isCurrentMonth) {
                    return (
                      <p className="text-[10px] text-muted-foreground/60 italic px-1 leading-tight">
                        Suggestion : prise de parole pédagogique possible
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
