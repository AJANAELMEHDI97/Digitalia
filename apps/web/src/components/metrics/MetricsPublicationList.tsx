import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  SlidersHorizontal,
  Filter,
  Plus,
  Eye,
  Heart,
  TrendingUp,
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
  ArrowRight,
} from "lucide-react";
import type { GeneratedMetrics } from "@/utils/metricsGenerator";

interface MetricsPublicationListProps {
  publications: GeneratedMetrics[];
  selectedId: string | null;
  onSelect: (publication: GeneratedMetrics) => void;
}

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
};

const platformColors: Record<string, string> = {
  linkedin: "bg-[#0077B5]",
  instagram: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737]",
  facebook: "bg-[#1877F2]",
  twitter: "bg-black dark:bg-white",
};

function getStatusBadge(level: string) {
  switch (level) {
    case "good":
      return (
        <Badge className="bg-emerald-500 text-white border-0 text-[10px] px-2 py-0.5 font-medium shadow-sm">
          Excellent
        </Badge>
      );
    case "medium":
      return (
        <Badge className="bg-amber-500 text-white border-0 text-[10px] px-2 py-0.5 font-medium shadow-sm">
          Moyen
        </Badge>
      );
    default:
      return (
        <Badge className="bg-rose-500 text-white border-0 text-[10px] px-2 py-0.5 font-medium shadow-sm">
          À améliorer
        </Badge>
      );
  }
}

export function MetricsPublicationList({
  publications,
  selectedId,
  onSelect,
}: MetricsPublicationListProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");

  const filteredPubs = publications
    .filter((p) =>
      p.content.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      if (sortBy === "engagement") {
        return b.engagementRate - a.engagementRate;
      }
      if (sortBy === "reach") {
        return b.reach - a.reach;
      }
      return 0;
    });

  return (
    <Card className="h-full flex flex-col overflow-hidden border-0 shadow-lg">
      <CardHeader className="pb-4 space-y-4 flex-shrink-0 bg-gradient-to-b from-background to-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Publications</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <Button size="icon" className="h-9 w-9 bg-accent hover:bg-accent/90 rounded-full shadow-md">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une publication..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-background border shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-9 text-sm flex-1 bg-background">
              <SlidersHorizontal className="h-3.5 w-3.5 mr-2" />
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date de publication</SelectItem>
              <SelectItem value="engagement">Taux d'engagement</SelectItem>
              <SelectItem value="reach">Portée</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Filter className="h-3.5 w-3.5" />
            Filtrer
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredPubs.length} publication{filteredPubs.length > 1 ? "s" : ""} analysée{filteredPubs.length > 1 ? "s" : ""}
        </div>
      </CardHeader>

      <ScrollArea className="flex-1">
        <CardContent className="space-y-4 pt-0 px-4 pb-4">
          {filteredPubs.map((pub) => {
            const PlatformIcon = platformIcons[pub.platform] || Linkedin;
            const isSelected = selectedId === pub.id;
            const isTopPerformer = pub.performanceLevel === "good" && pub.engagementRate >= 4.5;

            return (
              <div
                key={pub.id}
                onClick={() => onSelect(pub)}
                className={`
                  group relative rounded-xl cursor-pointer transition-all duration-300 overflow-hidden
                  ${isSelected
                    ? "ring-2 ring-primary shadow-lg scale-[1.02]"
                    : "hover:shadow-lg hover:scale-[1.01] border border-border/50"
                  }
                  ${isTopPerformer ? "ring-2 ring-primary/50" : ""}
                `}
              >
                {/* Top Performer Badge */}
                {isTopPerformer && (
                  <div className="absolute top-0 right-0 z-10">
                    <div className="bg-gradient-to-r from-primary to-accent text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-md">
                      ⭐ TOP
                    </div>
                  </div>
                )}

                {/* Large Image */}
                <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                  {pub.imageUrl ? (
                    <img
                      src={pub.imageUrl}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                      <PlatformIcon className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Platform Icon */}
                  <div className="absolute top-3 left-3">
                    <div className={`w-8 h-8 rounded-lg ${platformColors[pub.platform]} flex items-center justify-center shadow-lg`}>
                      <PlatformIcon className={`h-4 w-4 ${pub.platform === 'twitter' ? 'text-white dark:text-black' : 'text-white'}`} />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(pub.performanceLevel)}
                  </div>

                  {/* Bottom Overlay Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-semibold text-sm line-clamp-2 leading-snug mb-2 drop-shadow-md">
                      {pub.content}
                    </p>
                    <div className="flex items-center gap-2 text-white/80 text-xs">
                      <span>{format(new Date(pub.publishedAt), "d MMMM yyyy", { locale: fr })}</span>
                    </div>
                  </div>
                </div>

                {/* Metrics Bar */}
                <div className="bg-card p-3 grid grid-cols-4 gap-2">
                  <MetricPill icon={Eye} value={pub.reach.toLocaleString("fr-FR")} label="Portée" />
                  <MetricPill icon={Heart} value={pub.likes.toString()} label="J'aime" />
                  <MetricPill 
                    icon={TrendingUp} 
                    value={`${pub.engagementRate}%`} 
                    label="Engage." 
                    highlight={pub.engagementRate >= 3.5}
                  />
                  <div className="flex items-center justify-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-full w-full text-xs text-primary hover:text-primary gap-1"
                    >
                      Détails
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

function MetricPill({ 
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
    <div className={`text-center py-1.5 px-2 rounded-lg ${highlight ? "bg-primary/10" : "bg-muted/50"}`}>
      <div className="flex items-center justify-center gap-1 mb-0.5">
        <Icon className={`h-3 w-3 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
        <span className={`text-sm font-bold ${highlight ? "text-primary" : ""}`}>{value}</span>
      </div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
