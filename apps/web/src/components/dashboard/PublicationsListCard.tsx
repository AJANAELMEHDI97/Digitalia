import { memo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Publication } from "@/hooks/usePublications";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Linkedin, Facebook, Instagram, Building2, ChevronRight } from "lucide-react";
interface PublicationsListCardProps {
  publications: Publication[];
  loading: boolean;
  limit?: number;
}

const platformConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  linkedin: { icon: Linkedin, color: "text-[#0A66C2]", bgColor: "bg-[#0A66C2]/10" },
  facebook: { icon: Facebook, color: "text-[#1877F2]", bgColor: "bg-[#1877F2]/10" },
  instagram: { icon: Instagram, color: "text-[#E4405F]", bgColor: "bg-[#E4405F]/10" },
  twitter: { icon: () => <span className="text-xs font-bold">𝕏</span>, color: "text-foreground", bgColor: "bg-foreground/10" },
  google_business: { icon: Building2, color: "text-[#4285F4]", bgColor: "bg-[#4285F4]/10" },
};

export const PublicationsListCard = memo(function PublicationsListCard({ publications, loading, limit = 5 }: PublicationsListCardProps) {
  const displayedPubs = publications
    .filter(p => p.platform !== "blog")
    .slice(0, limit);

  return (
    <Card className="bg-card border transition-all duration-200 hover:shadow-md h-full">
      <CardHeader className="pb-1 pt-3 px-4">
        <CardTitle className="text-sm font-semibold text-foreground">Prises de parole récentes</CardTitle>
        <p className="text-[10px] text-muted-foreground">Vos dernières communications professionnelles</p>
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-2">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-start">
                <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedPubs.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            Aucune prise de parole récente
          </p>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-3 top-1 bottom-4 w-0.5 bg-gradient-to-b from-primary/60 via-primary/30 to-transparent" />
            
            <div className="space-y-3">
              {displayedPubs.map((pub, index) => {
                const config = platformConfig[pub.platform || "linkedin"] || platformConfig.linkedin;
                const Icon = config.icon;
                const isFirst = index === 0;
                
                const fullText = pub.title || pub.content;
                
                return (
                  <TooltipProvider key={pub.id} delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link 
                          to={`/editor/${pub.id}`}
                          className="group flex gap-3 items-start relative"
                        >
                          {/* Timeline node */}
                          <div className={`
                            relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                            ${config.bgColor} ${config.color}
                            ring-2 ring-background
                            transition-all duration-150
                            group-hover:scale-105
                          `}>
                            <Icon className="w-3 h-3" />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0 pb-1">
                            <p className="text-[10px] text-muted-foreground mb-0.5">
                              {format(new Date(pub.scheduled_date), "d MMM", { locale: fr })}
                            </p>
                            <p className="text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                              {fullText}
                            </p>
                          </div>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="top" 
                        className="max-w-xs text-xs p-3 bg-popover border shadow-lg"
                        sideOffset={5}
                      >
                        <p className="whitespace-pre-wrap">{fullText}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-2 pt-2 border-t border-border/30 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Total</span>
          <Link to="/calendar" className="flex items-center gap-1.5 group/link">
            <span className="text-lg font-bold text-primary">{publications.filter(p => p.platform !== "blog").length}</span>
            <span className="text-[10px] text-muted-foreground">publications</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover/link:text-foreground transition-colors" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});
