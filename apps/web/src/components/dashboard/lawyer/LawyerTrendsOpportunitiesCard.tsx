import { Link, useNavigate } from "react-router-dom";
import { Lightbulb, ChevronRight, Flame, TrendingUp, Pen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTrends } from "@/hooks/useTrends";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface Opportunity {
  id: string;
  title: string;
  category: string;
  relevanceScore: number;
  reason: string;
}

// Fallback demo data - 6 suggestions pour enrichir le bloc
const DEMO_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1',
    title: 'Cybersécurité RGPD',
    category: 'Droit numérique',
    relevanceScore: 5,
    reason: 'Amendes record annoncées',
  },
  {
    id: '2',
    title: 'Réforme des retraites 2025',
    category: 'Droit du travail',
    relevanceScore: 5,
    reason: 'Débat parlementaire en cours',
  },
  {
    id: '3',
    title: 'Nouvelles règles sur le télétravail',
    category: 'Droit du travail',
    relevanceScore: 4,
    reason: 'Sujet très recherché cette semaine',
  },
  {
    id: '4',
    title: 'Pension alimentaire revalorisée',
    category: 'Droit de la famille',
    relevanceScore: 4,
    reason: 'Intérêt croissant du public',
  },
  {
    id: '5',
    title: 'Fiscalité des crypto-actifs',
    category: 'Droit fiscal',
    relevanceScore: 3,
    reason: 'Nouvelles obligations déclaratives',
  },
  {
    id: '6',
    title: 'Bail commercial résilié',
    category: 'Droit immobilier',
    relevanceScore: 3,
    reason: 'Jurisprudence récente importante',
  },
];

export function LawyerTrendsOpportunitiesCard() {
  const navigate = useNavigate();
  const { trends, loading, getTopTrends } = useTrends();

  // Get opportunities based on trends (max 6)
  const opportunities = useMemo((): Opportunity[] => {
    const topTrends = getTopTrends(6);
    
    if (topTrends.length < 4) {
      // Use demo fallback if not enough trends
      return DEMO_OPPORTUNITIES;
    }

    return topTrends.map(trend => ({
      id: trend.id,
      title: trend.title,
      category: trend.category,
      relevanceScore: Math.ceil(trend.intensity / 20), // Convert 0-100 to 1-5
      reason: trend.whyTrending || trend.editorialRecommendation || 'Sujet pertinent pour votre expertise',
    }));
  }, [getTopTrends]);

  const handleCreatePost = (opportunity: Opportunity) => {
    navigate(`/editor?topic=${encodeURIComponent(opportunity.title)}&category=${encodeURIComponent(opportunity.category)}`);
  };

  if (loading) {
    return (
      <Card className="h-[340px]">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const RelevanceDots = ({ score }: { score: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            i <= score ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </div>
  );

  return (
    <Card className="bg-card border transition-all duration-200 hover:shadow-md h-[340px] flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/20">
              <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <span>Opportunités de communication</span>
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
            <Link to="/trends">
              Voir les tendances
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Sujets recommandés cette semaine :
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col pt-0 overflow-hidden">
        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="space-y-2 pb-2">
            {opportunities.map((opportunity) => (
              <div
                key={opportunity.id}
                className="p-2.5 rounded-lg border bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-900/10 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Flame className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {opportunity.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">Pertinence</span>
                    <RelevanceDots score={opportunity.relevanceScore} />
                  </div>
                </div>
                
                <p className="text-sm font-medium leading-tight">{opportunity.title}</p>
                <p className="text-xs text-muted-foreground leading-tight">{opportunity.reason}</p>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-7 gap-1.5 text-xs"
                  onClick={() => handleCreatePost(opportunity)}
                >
                  <Pen className="h-3 w-3" />
                  Créer un post
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer tip */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-2 mt-2 flex-shrink-0">
          <TrendingUp className="h-3.5 w-3.5 shrink-0" />
          <span>Basé sur les tendances juridiques actuelles</span>
        </div>
      </CardContent>
    </Card>
  );
}
