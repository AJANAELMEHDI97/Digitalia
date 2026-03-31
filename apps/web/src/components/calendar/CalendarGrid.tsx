import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Sparkles, Clock, User, Linkedin, Instagram, Facebook, Twitter, BarChart3 } from "lucide-react";
import { PlatformBadge } from "@/components/ui/platform-badge";
import type { Publication, PublicationStatus, SocialPlatform } from "@/hooks/usePublications";

interface CalendarGridProps {
  currentDate: Date;
  publications: Publication[];
  onDayClick: (date: Date) => void;
  onPublicationClick: (publication: Publication) => void;
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
  blog: Linkedin, // Placeholder, blog articles are not typically shown in this grid
  google_business: Linkedin, // Uses Building2 icon in platform-badge
};

function PlatformIcon({ platform }: { platform: SocialPlatform }) {
  const Icon = PLATFORM_ICONS[platform];
  return <Icon className="h-3 w-3 flex-shrink-0" />;
}
function PublicationPreview({ publication }: { publication: Publication }) {
  const navigate = useNavigate();
  
  const handleViewMetrics = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/metrics?publication=${publication.id}`);
  };

  return (
    <div className="w-72 space-y-3">
      {/* Image */}
      {publication.image_url && (
        <img
          src={publication.image_url}
          alt=""
          className="w-full h-32 object-cover rounded-lg"
        />
      )}
      
      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <PlatformBadge platform={publication.platform} />
        {publication.source === "socialpulse" ? (
          <Badge variant="outline" className="text-xs border-primary/50 text-primary bg-primary/5">
            <Sparkles className="h-3 w-3 mr-1" />
            Proposé par SocialPulse
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
      
      {/* Content */}
      <p className="text-sm line-clamp-4">{publication.content}</p>
      
      {/* Time */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>Programmé à {publication.scheduled_time.slice(0, 5)}</span>
      </div>

      {/* Metrics button for published posts */}
      {publication.status === "programme" && (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={handleViewMetrics}
        >
          <BarChart3 className="h-4 w-4 mr-1.5" />
          Voir les métriques
        </Button>
      )}
    </div>
  );
}

export function CalendarGrid({
  currentDate,
  publications,
  onDayClick,
  onPublicationClick,
}: CalendarGridProps) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const publicationsByDate = useMemo(() => {
    const map = new Map<string, Publication[]>();
    publications.forEach((pub) => {
      const key = pub.scheduled_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(pub);
    });
    return map;
  }, [publications]);

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
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={idx}
              onClick={() => onDayClick(day)}
              className={cn(
                "min-h-[100px] p-2 border-b border-r cursor-pointer transition-colors hover:bg-muted/30",
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
              </div>

              <div className="space-y-1">
                {dayPubs.slice(0, 3).map((pub) => (
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
                          {pub.content.slice(0, 22)}
                          {pub.content.length > 22 && "..."}
                        </span>
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent 
                      side="right" 
                      align="start" 
                      className="p-3"
                      sideOffset={8}
                    >
                      <PublicationPreview publication={pub} />
                    </HoverCardContent>
                  </HoverCard>
                ))}
                {dayPubs.length > 3 && (
                  <span className="text-xs text-muted-foreground px-2">
                    +{dayPubs.length - 3} autres
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

export function StatusLegend() {
  return (
    <div className="flex gap-4 flex-wrap">
      {(Object.keys(STATUS_STYLES) as PublicationStatus[]).map((status) => (
        <div key={status} className="flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded", STATUS_STYLES[status])} />
          <span className="text-sm text-muted-foreground">
            {STATUS_LABELS[status]}
          </span>
        </div>
      ))}
    </div>
  );
}
