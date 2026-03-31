import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformBadge } from "@/components/ui/platform-badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowRight, 
  Building2, 
  Clock, 
  CheckCircle, 
  Send, 
  Eye,
  Sparkles
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { Publication, PublicationStatus } from "@/hooks/usePublications";

interface EditorialPipelineViewProps {
  publications: Publication[];
  firmNamesMap: Map<string, string>;
  onPublicationClick: (pub: Publication) => void;
  onStatusChange: (id: string, newStatus: PublicationStatus) => Promise<any>;
}

interface PipelineColumn {
  id: string;
  title: string;
  statuses: PublicationStatus[];
  sourceFilter?: string;
  color: string;
  icon: typeof Sparkles;
  nextAction?: { label: string; targetStatus: PublicationStatus };
}

const COLUMNS: PipelineColumn[] = [
  {
    id: "ideas",
    title: "Idées",
    statuses: ["brouillon"],
    sourceFilter: "manual",
    color: "border-t-muted-foreground",
    icon: Sparkles,
    nextAction: { label: "Rédiger", targetStatus: "a_valider" },
  },
  {
    id: "drafts",
    title: "En rédaction",
    statuses: ["brouillon"],
    sourceFilter: "socialpulse",
    color: "border-t-blue-500",
    icon: Eye,
    nextAction: { label: "Soumettre", targetStatus: "a_valider" },
  },
  {
    id: "review",
    title: "À valider",
    statuses: ["a_valider"],
    color: "border-t-amber-500",
    icon: Send,
    nextAction: { label: "Valider", targetStatus: "programme" },
  },
  {
    id: "scheduled",
    title: "Programmé",
    statuses: ["programme"],
    color: "border-t-primary",
    icon: Clock,
  },
  {
    id: "published",
    title: "Publié",
    statuses: ["publie"],
    color: "border-t-green-500",
    icon: CheckCircle,
  },
];

const PRIORITY_DOTS: Record<string, string> = {
  routine: "bg-muted-foreground",
  important: "bg-amber-500",
  strategique: "bg-violet-500",
};

function PipelineCard({
  pub,
  firmName,
  nextAction,
  onStatusChange,
  onClick,
}: {
  pub: Publication;
  firmName?: string;
  nextAction?: PipelineColumn["nextAction"];
  onStatusChange: (id: string, status: PublicationStatus) => Promise<any>;
  onClick: () => void;
}) {
  const priority = (pub as any).priority || "routine";

  return (
    <div
      className="p-3 bg-card border rounded-lg cursor-pointer hover:shadow-sm transition-shadow space-y-2"
      onClick={onClick}
    >
      <div className="flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOTS[priority]}`} />
        {firmName && (
          <span className="text-[10px] font-medium text-muted-foreground truncate flex items-center gap-0.5">
            <Building2 className="h-2.5 w-2.5" />
            {firmName}
          </span>
        )}
      </div>
      <p className="text-xs line-clamp-2">{pub.content}</p>
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          <PlatformBadge platform={pub.platform} />
          <span className="text-[10px] text-muted-foreground">
            {format(parseISO(pub.scheduled_date), "d MMM", { locale: fr })}
          </span>
        </div>
        {nextAction && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] px-2"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(pub.id, nextAction.targetStatus);
            }}
          >
            {nextAction.label}
            <ArrowRight className="h-3 w-3 ml-0.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function EditorialPipelineView({
  publications,
  firmNamesMap,
  onPublicationClick,
  onStatusChange,
}: EditorialPipelineViewProps) {
  const columnData = useMemo(() => {
    return COLUMNS.map(col => {
      const pubs = publications.filter(p => {
        if (!col.statuses.includes(p.status)) return false;
        if (col.sourceFilter && p.source !== col.sourceFilter) return false;
        return true;
      });
      return { ...col, pubs };
    });
  }, [publications]);

  return (
    <div className="grid grid-cols-5 gap-3 min-h-[500px]">
      {columnData.map(col => {
        const Icon = col.icon;
        return (
          <Card key={col.id} className={`border-t-4 ${col.color}`}>
            <CardHeader className="pb-2 px-3 pt-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" />
                  {col.title}
                </span>
                <Badge variant="secondary" className="text-xs h-5 px-1.5">
                  {col.pubs.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <ScrollArea className="h-[450px]">
                <div className="space-y-2 pr-2">
                  {col.pubs.map(pub => (
                    <PipelineCard
                      key={pub.id}
                      pub={pub}
                      firmName={pub.law_firm_id ? firmNamesMap.get(pub.law_firm_id) : undefined}
                      nextAction={col.nextAction}
                      onStatusChange={onStatusChange}
                      onClick={() => onPublicationClick(pub)}
                    />
                  ))}
                  {col.pubs.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      Aucun contenu
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
