import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Eye, Heart, MessageCircle, Share2, MousePointerClick, 
  TrendingUp, ChevronLeft
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlatformBadge } from "@/components/ui/platform-badge";
import { AudienceCharts } from "@/components/metrics/AudienceCharts";
import { AIMetricsInterpretation } from "@/components/metrics/AIMetricsInterpretation";
import type { MetricsPublication } from "./MetricsGrid";
import { cn } from "@/lib/utils";

interface MetricsDetailViewProps {
  publication: MetricsPublication;
  onBack: () => void;
}


export function MetricsDetailView({ publication, onBack }: MetricsDetailViewProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Header */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onBack}
        className="gap-1 -ml-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour aux métriques
      </Button>

      {/* Main Card */}
      <Card className="overflow-hidden shadow-lg">
        {/* Hero Image */}
        {publication.imageUrl && (
          <div className="relative aspect-video max-h-80 overflow-hidden">
            <img 
              src={publication.imageUrl} 
              alt="Publication" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <PlatformBadge platform={publication.platform} />
              <span className="text-sm text-white/90 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">
                {format(new Date(publication.publishedAt), "d MMMM yyyy", { locale: fr })}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <CardHeader className={publication.imageUrl ? "pt-4" : ""}>
          {!publication.imageUrl && (
            <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
              <PlatformBadge platform={publication.platform} />
              <span className="text-sm text-muted-foreground">
                {format(new Date(publication.publishedAt), "d MMMM yyyy", { locale: fr })}
              </span>
            </div>
          )}
          <p className="text-base leading-relaxed">{publication.content}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <MetricBox icon={Eye} label="Portée" value={publication.reach.toLocaleString("fr-FR")} />
            <MetricBox icon={Heart} label="J'aime" value={publication.likes.toString()} />
            <MetricBox icon={MessageCircle} label="Commentaires" value={publication.comments.toString()} />
            {publication.shares !== undefined && (
              <MetricBox icon={Share2} label="Partages" value={publication.shares.toString()} />
            )}
            {publication.clicks !== undefined && (
              <MetricBox icon={MousePointerClick} label="Clics" value={publication.clicks.toString()} />
            )}
            <MetricBox 
              icon={TrendingUp}
              label="Taux d'engagement" 
              value={`${publication.engagementRate}%`} 
              highlight 
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Performance Analysis */}
      <AIMetricsInterpretation 
        metrics={{
          reach: publication.reach,
          likes: publication.likes,
          comments: publication.comments,
          shares: publication.shares,
          clicks: publication.clicks,
          engagementRate: publication.engagementRate,
          platform: publication.platform,
        }}
      />

      {/* Audience Charts */}
      {(publication.audienceAge || publication.audienceLocation || publication.audienceGender) && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Analyse de l'audience</h2>
          <AudienceCharts publication={publication as any} />
        </div>
      )}
    </div>
  );
}

function MetricBox({ 
  icon: Icon,
  label, 
  value, 
  highlight = false 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  label: string; 
  value: string; 
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      "p-4 rounded-xl text-center",
      highlight ? "bg-gradient-to-br from-primary/10 to-accent/10" : "bg-muted/50"
    )}>
      <Icon className={cn(
        "h-5 w-5 mx-auto mb-1.5",
        highlight ? "text-primary" : "text-muted-foreground"
      )} />
      <p className={cn("text-xl font-bold", highlight && "text-primary")}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
