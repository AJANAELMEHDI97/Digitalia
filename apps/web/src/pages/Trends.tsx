import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { TrendFilters } from "@/components/trends/TrendFilters";
import { TrendCard } from "@/components/trends/TrendCard";
import { TrendOverview } from "@/components/trends/TrendOverview";
import { TrendDetailSheet } from "@/components/trends/TrendDetailSheet";
import { TrendStats } from "@/components/trends/TrendStats";
import { useTrends, TrendCategory, TrendPeriod } from "@/hooks/useTrends";
import { TrendTopic } from "@/types/trend";
import { TrendingUp, LayoutGrid, Lightbulb, BarChart3, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function Trends() {
  const [selectedCategory, setSelectedCategory] = useState<TrendCategory>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<TrendPeriod>("week");
  const [selectedTrend, setSelectedTrend] = useState<TrendTopic | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { trends, loading, error, filterTrends } = useTrends();

  // Filter trends based on selected filters
  const filteredTrends = useMemo(() => {
    return filterTrends(selectedCategory, selectedPeriod);
  }, [filterTrends, selectedCategory, selectedPeriod]);

  const handleTrendClick = (trend: TrendTopic) => {
    setSelectedTrend(trend);
    setSheetOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Tendances</h1>
              <p className="text-sm text-muted-foreground">
                Veille éditoriale et aide à la décision
              </p>
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
          <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Identifiez les sujets porteurs pour votre communication
            </p>
            <p className="text-sm text-muted-foreground">
              Cette rubrique vous aide à décider s'il est pertinent de prendre la
              parole, sur quel sujet, à quel moment et sur quel réseau.
            </p>
          </div>
        </div>

        {/* Filters */}
        <TrendFilters
          selectedCategory={selectedCategory}
          selectedPeriod={selectedPeriod}
          onCategoryChange={(cat) => setSelectedCategory(cat as TrendCategory)}
          onPeriodChange={(period) => setSelectedPeriod(period as TrendPeriod)}
        />

        {/* Stats overview */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : (
          <TrendStats trends={filteredTrends} />
        )}

        {/* Main content with tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Toutes les tendances
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {loading ? (
              <div className="grid gap-4 lg:grid-cols-3">
                <Skeleton className="h-80 lg:col-span-2" />
                <div className="space-y-4">
                  <Skeleton className="h-40" />
                  <Skeleton className="h-40" />
                </div>
              </div>
            ) : (
              <TrendOverview trends={filteredTrends} onTrendClick={handleTrendClick} />
            )}
          </TabsContent>

          <TabsContent value="list">
            {loading ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {filteredTrends.map((trend) => (
                  <TrendCard
                    key={trend.id}
                    trend={trend}
                    onClick={() => handleTrendClick(trend)}
                  />
                ))}
              </div>
            )}

            {filteredTrends.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold mb-1">
                    Aucune tendance trouvée
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Modifiez vos filtres pour afficher plus de résultats.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Trend detail sheet */}
        <TrendDetailSheet
          trend={selectedTrend}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      </div>
    </AppLayout>
  );
}
