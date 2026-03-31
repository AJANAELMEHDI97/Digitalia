import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Eye, Heart, MessageCircle, TrendingUp, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PlatformBadge } from "@/components/ui/platform-badge";
import type { PerformanceLevel, PerformanceAnalysis } from "@/data/mockMetrics";
import { cn } from "@/lib/utils";

interface MetricsCardProps {
  id: string;
  content: string;
  platform: "linkedin" | "instagram" | "facebook" | "twitter";
  publishedAt: string;
  imageUrl?: string;
  reach: number;
  likes: number;
  comments: number;
  engagementRate: number;
  performanceLevel: PerformanceLevel;
  analysis: PerformanceAnalysis;
  onClick?: () => void;
}

const performanceConfig: Record<PerformanceLevel, { 
  label: string; 
  color: string; 
  bgColor: string;
  borderColor: string;
  ringColor: string;
}> = {
  good: { 
    label: "Bonne performance", 
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    ringColor: "ring-emerald-500/20"
  },
  medium: { 
    label: "Engagement correct", 
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/50",
    borderColor: "border-amber-200 dark:border-amber-800",
    ringColor: "ring-amber-500/20"
  },
  improve: { 
    label: "À améliorer", 
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-50 dark:bg-slate-950/50",
    borderColor: "border-slate-200 dark:border-slate-700",
    ringColor: "ring-slate-500/20"
  },
};

export function MetricsCard({
  content,
  platform,
  publishedAt,
  imageUrl,
  reach,
  likes,
  comments,
  engagementRate,
  performanceLevel,
  analysis,
  onClick,
}: MetricsCardProps) {
  const config = performanceConfig[performanceLevel];
  const isTopPerformer = performanceLevel === "good";

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden cursor-pointer transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-1",
        isTopPerformer && "ring-2 ring-emerald-500/20"
      )}
      onClick={onClick}
    >
      {/* Top Performer Subtle Indicator */}
      {isTopPerformer && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
      )}

      {/* Image Section - Main Visual */}
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Publication" 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
            <span className="text-muted-foreground text-sm">Pas d'image</span>
          </div>
        )}
        
        {/* Overlay with badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Platform & Date */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <PlatformBadge platform={platform} />
          <span className="text-xs text-white/90 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm font-medium">
            {format(new Date(publishedAt), "d MMM yyyy", { locale: fr })}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-4">
        {/* Text Extract */}
        <p className="text-sm leading-relaxed line-clamp-2 text-foreground/90">
          {content}
        </p>

        {/* Metrics Zone */}
        <div className="grid grid-cols-4 gap-2">
          <MetricItem icon={Eye} value={formatNumber(reach)} label="Portée" />
          <MetricItem icon={Heart} value={likes.toString()} label="J'aime" />
          <MetricItem icon={MessageCircle} value={comments.toString()} label="Com." />
          <MetricItem 
            icon={TrendingUp} 
            value={`${engagementRate}%`} 
            label="Engage." 
            highlight 
          />
        </div>

        {/* Performance Interpretation */}
        <div className={cn(
          "rounded-lg p-3 border",
          config.bgColor,
          config.borderColor
        )}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className={cn(
              "w-2 h-2 rounded-full",
              performanceLevel === "good" && "bg-emerald-500",
              performanceLevel === "medium" && "bg-amber-500",
              performanceLevel === "improve" && "bg-slate-400"
            )} />
            <span className={cn("text-sm font-semibold", config.color)}>
              {config.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {analysis.summary}
          </p>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-end gap-1 text-xs text-primary font-medium group-hover:gap-2 transition-all">
          <span>Voir l'analyse complète</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </div>
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
    <div className={cn(
      "flex flex-col items-center p-2 rounded-lg",
      highlight ? "bg-primary/10" : "bg-muted/50"
    )}>
      <Icon className={cn(
        "h-3.5 w-3.5 mb-0.5",
        highlight ? "text-primary" : "text-muted-foreground"
      )} />
      <span className={cn(
        "text-sm font-bold",
        highlight && "text-primary"
      )}>{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}
