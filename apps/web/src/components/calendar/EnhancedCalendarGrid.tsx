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
  CalendarDays 
} from "lucide-react";
import { PlatformBadge } from "@/components/ui/platform-badge";
import type { Publication, PublicationStatus, SocialPlatform } from "@/hooks/usePublications";
import { KeyDate, getKeyDatesForDate, KEY_DATE_CATEGORIES } from "@/data/mockKeyDates";
import { CalendarFilterType, CalendarPlatformFilter } from "./CalendarFilters";

interface EnhancedCalendarGridProps {
  currentDate: Date;
  publications: Publication[];
  filterType: CalendarFilterType;
  platformFilter: CalendarPlatformFilter;
  showDrafts: boolean;
  showToValidate: boolean;
  showScheduled: boolean;
  onDayClick: (date: Date) => void;
  onPublicationClick: (publication: Publication) => void;
  onKeyDateClick: (keyDate: KeyDate, date: Date) => void;
}

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const STATUS_STYLES: Record<PublicationStatus, string> = {
  brouillon: "bg-muted text-muted-foreground hover:bg-muted/80",
  a_valider: "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
  programme: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
  publie: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
  refuse: "bg-destructive/10 text-destructive hover:bg-destructive/20",
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
  blog: Linkedin, // Placeholder for blog
  google_business: Linkedin, // Uses Building2 icon in platform-badge
};

function PlatformIcon({ platform }: { platform: SocialPlatform }) {
  const Icon = PLATFORM_ICONS[platform];
  return <Icon className="h-3 w-3 flex-shrink-0" />;
}

function PublicationPreviewTooltip({ publication }: { publication: Publication }) {
  return (
    <div className="w-72 space-y-3">
      {publication.image_url && (
        <img
          src={publication.image_url}
          alt=""
          className="w-full h-32 object-cover rounded-lg"
        />
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <PlatformBadge platform={publication.platform} />
        {publication.source === "socialpulse" ? (
          <Badge variant="outline" className="text-xs border-primary/50 text-primary bg-primary/5">
            <Sparkles className="h-3 w-3 mr-1" />
            SocialPulse
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs text-muted-foreground">
            <User className="h-3 w-3 mr-1" />
            Créé par vous
          </Badge>
        )}
        <Badge variant="secondary" className="text-xs">
          {STATUS_LABELS[publication.status]}
        </Badge>
      </div>
      <p className="text-sm line-clamp-4">{publication.content}</p>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>Programmé à {publication.scheduled_time.slice(0, 5)}</span>
      </div>
    </div>
  );
}

function KeyDatePreviewTooltip({ keyDate }: { keyDate: KeyDate }) {
  const category = KEY_DATE_CATEGORIES[keyDate.category];
  return (
    <div className="w-72 space-y-3">
      <div className="flex items-center gap-2">
        <Badge className={cn(category.color, "text-white")}>
          {category.label}
        </Badge>
      </div>
      <p className="text-sm font-medium">{keyDate.title}</p>
      <p className="text-sm text-muted-foreground line-clamp-3">{keyDate.description}</p>
      <div className="flex items-center gap-2">
        {keyDate.recommendedPlatforms.map((platform) => (
          <PlatformBadge key={platform} platform={platform} />
        ))}
      </div>
    </div>
  );
}

export function EnhancedCalendarGrid({
  currentDate,
  publications,
  filterType,
  platformFilter,
  showDrafts,
  showToValidate,
  showScheduled,
  onDayClick,
  onPublicationClick,
  onKeyDateClick,
}: EnhancedCalendarGridProps) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Filter publications based on current filters
  const filteredPublications = useMemo(() => {
    return publications.filter((pub) => {
      // Status filters
      if (pub.status === "brouillon" && !showDrafts) return false;
      if (pub.status === "a_valider" && !showToValidate) return false;
      if (pub.status === "programme" && !showScheduled) return false;
      
      // Platform filter
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

  const showPublications = filterType === "all" || filterType === "publications";
  const showKeyDates = filterType === "all" || filterType === "key-dates";

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
          const dayPubs = publicationsByDate.get(dateKey) || [];
          const dayKeyDates = getKeyDatesForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);

          const hasContent = (showPublications && dayPubs.length > 0) || 
                           (showKeyDates && dayKeyDates.length > 0);

          return (
            <div
              key={idx}
              onClick={() => onDayClick(day)}
              className={cn(
                "min-h-[110px] p-2 border-b border-r cursor-pointer transition-colors hover:bg-muted/30",
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
                    {showKeyDates && dayKeyDates.length > 0 && (
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                    )}
                    {showPublications && dayPubs.length > 0 && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                {/* Key dates */}
                {showKeyDates && dayKeyDates.map((keyDate) => (
                  <HoverCard key={keyDate.id} openDelay={300} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onKeyDateClick(keyDate, day);
                        }}
                        className={cn(
                          "w-full text-left px-2 py-1 rounded text-xs truncate transition-colors flex items-center gap-1",
                          "bg-purple-100 text-purple-800 hover:bg-purple-200",
                          "dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50"
                        )}
                      >
                        <CalendarDays className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {keyDate.title.slice(0, 18)}
                          {keyDate.title.length > 18 && "..."}
                        </span>
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent side="right" align="start" className="p-3" sideOffset={8}>
                      <KeyDatePreviewTooltip keyDate={keyDate} />
                    </HoverCardContent>
                  </HoverCard>
                ))}

                {/* Publications */}
                {showPublications && dayPubs.slice(0, 2).map((pub) => (
                  <HoverCard key={pub.id} openDelay={300} closeDelay={100}>
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
                        <span className="truncate">
                          {pub.content.slice(0, 18)}
                          {pub.content.length > 18 && "..."}
                        </span>
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent side="right" align="start" className="p-3" sideOffset={8}>
                      <PublicationPreviewTooltip publication={pub} />
                    </HoverCardContent>
                  </HoverCard>
                ))}

                {/* More indicator */}
                {((showPublications && dayPubs.length > 2) || 
                  (showKeyDates && dayKeyDates.length > 1 && dayPubs.length >= 2)) && (
                  <span className="text-xs text-muted-foreground px-2">
                    +{dayPubs.length - 2 + Math.max(0, dayKeyDates.length - 1)} autres
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function EnhancedStatusLegend() {
  return (
    <div className="flex gap-4 flex-wrap text-sm">
      <div className="flex items-center gap-4 border-r pr-4">
        <span className="text-muted-foreground font-medium">Publications:</span>
        {(Object.keys(STATUS_STYLES) as PublicationStatus[]).map((status) => (
          <div key={status} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded", STATUS_STYLES[status])} />
            <span className="text-muted-foreground">{STATUS_LABELS[status]}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground font-medium">Dates clés:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500" />
          <span className="text-muted-foreground">Événement juridique</span>
        </div>
      </div>
    </div>
  );
}
