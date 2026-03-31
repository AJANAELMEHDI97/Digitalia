import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Eye, Heart, MessageCircle, Share2, MousePointerClick, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PlatformBadge } from "@/components/ui/platform-badge";
import { PerformanceBadge } from "@/components/metrics/PerformanceBadge";
import { PerformanceReadingCompact } from "@/components/metrics/PerformanceReading";
import type { PublicationMetrics } from "@/data/mockMetrics";

interface PublicationMetricsCardProps {
  publication: PublicationMetrics;
  onClick?: () => void;
}

export function PublicationMetricsCard({ publication, onClick }: PublicationMetricsCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <PlatformBadge platform={publication.platform} />
            <PerformanceBadge level={publication.performanceLevel} />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {format(new Date(publication.publishedAt), "d MMM yyyy", { locale: fr })}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm line-clamp-2">{publication.content}</p>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricItem 
            icon={Eye} 
            label="Portée" 
            value={publication.reach.toLocaleString("fr-FR")} 
          />
          <MetricItem 
            icon={Heart} 
            label="J'aime" 
            value={publication.likes.toString()} 
          />
          <MetricItem 
            icon={MessageCircle} 
            label="Commentaires" 
            value={publication.comments.toString()} 
          />
          {publication.platform === "linkedin" && publication.clicks && (
            <MetricItem 
              icon={MousePointerClick} 
              label="Clics" 
              value={publication.clicks.toString()} 
            />
          )}
          {publication.shares && (
            <MetricItem 
              icon={Share2} 
              label="Partages" 
              value={publication.shares.toString()} 
            />
          )}
        </div>

        {/* Engagement Rate */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <span className="text-sm text-muted-foreground">Taux d'engagement</span>
          <span className="font-semibold text-primary">{publication.engagementRate}%</span>
        </div>

        {/* Performance Reading */}
        <PerformanceReadingCompact 
          analysis={publication.analysis} 
          performanceLevel={publication.performanceLevel} 
        />

        {/* CTA */}
        <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground pt-1">
          <span>Voir l'analyse complète</span>
          <ArrowRight className="h-3 w-3" />
        </div>
      </CardContent>
    </Card>
  );
}

function MetricItem({ 
  icon: Icon, 
  label, 
  value 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  label: string; 
  value: string;
}) {
  return (
    <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
      <Icon className="h-4 w-4 text-muted-foreground mb-1" />
      <span className="font-semibold text-sm">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
