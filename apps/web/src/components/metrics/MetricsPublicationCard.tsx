import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Eye, Heart, MessageCircle, TrendingUp, Calendar, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PlatformBadge } from "@/components/ui/platform-badge";
import { PerformanceBadge } from "@/components/metrics/PerformanceBadge";
import type { GeneratedMetrics } from "@/utils/metricsGenerator";
import type { PublicationMetrics } from "@/data/mockMetrics";

type MetricsData = GeneratedMetrics | PublicationMetrics;

interface MetricsPublicationCardProps {
  metrics: MetricsData;
  onClick?: () => void;
}

export function MetricsPublicationCard({ metrics, onClick }: MetricsPublicationCardProps) {
  const imageUrl = 'imageUrl' in metrics ? metrics.imageUrl : undefined;
  const isTopPerformer = metrics.performanceLevel === "good" && metrics.engagementRate >= 4.5;
  
  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden group ${
        isTopPerformer ? "ring-2 ring-primary/30 shadow-primary/10" : ""
      }`}
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Publication" 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
            <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
        
        {/* Platform Badge Overlay */}
        <div className="absolute top-3 left-3">
          <PlatformBadge platform={metrics.platform} />
        </div>
        
        {/* Performance Badge Overlay */}
        <div className="absolute top-3 right-3">
          <PerformanceBadge level={metrics.performanceLevel} />
        </div>
        
        {/* Top Performer Ribbon */}
        {isTopPerformer && (
          <div className="absolute -right-8 top-8 rotate-45 bg-primary text-primary-foreground text-xs font-medium px-8 py-1 shadow-sm">
            Top
          </div>
        )}
      </div>
      
      <CardContent className="p-4 space-y-3">
        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {format(new Date(metrics.publishedAt), "d MMMM yyyy", { locale: fr })}
        </div>
        
        {/* Content Preview */}
        <p className="text-sm line-clamp-2 font-medium leading-relaxed">
          {metrics.content}
        </p>
        
        {/* Metrics Row */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t">
          <MetricItem 
            icon={Eye} 
            value={metrics.reach.toLocaleString("fr-FR")} 
            label="Portée"
          />
          <MetricItem 
            icon={Heart} 
            value={metrics.likes.toString()} 
            label="J'aime"
          />
          <MetricItem 
            icon={MessageCircle} 
            value={metrics.comments.toString()} 
            label="Com."
          />
          <MetricItem 
            icon={TrendingUp} 
            value={`${metrics.engagementRate}%`} 
            label="Engage."
            highlight
          />
        </div>
        
        {/* Summary */}
        <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3">
          {metrics.analysis.summary}
        </p>
      </CardContent>
    </Card>
  );
}

function MetricItem({ 
  icon: Icon, 
  value, 
  label,
  highlight = false
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className={`text-center p-2 rounded-lg ${highlight ? "bg-primary/10" : "bg-muted/50"}`}>
      <Icon className={`h-3 w-3 mx-auto mb-1 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
      <p className={`text-xs font-semibold ${highlight ? "text-primary" : ""}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
