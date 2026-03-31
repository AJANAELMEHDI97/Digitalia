import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  Sparkles, 
  Loader2, 
  Search, 
  Globe, 
  CheckCircle,
  ExternalLink,
  Play
} from "lucide-react";

interface SearchResult {
  url: string;
  title: string;
  description: string;
  selected: boolean;
}

const FRENCH_CITIES = [
  "Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", 
  "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes"
];

const SPECIALIZATIONS = [
  "Droit des affaires", "Droit pénal", "Droit de la famille",
  "Droit du travail", "Droit immobilier", "Droit fiscal",
  "Droit social", "Droit de l'environnement", "Propriété intellectuelle"
];

export function AILawyerSearch() {
  const queryClient = useQueryClient();
  const [city, setCity] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [barAssociation, setBarAssociation] = useState("");
  const [maxResults, setMaxResults] = useState(10);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("search-lawyers", {
        body: { city, specialization, barAssociation, limit: maxResults },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      setSearchResults(data.results.map((r: Omit<SearchResult, 'selected'>) => ({ ...r, selected: true })));
      setHasSearched(true);
      toast.success(`${data.totalFound} URL(s) trouvée(s)`);
    },
    onError: (error: Error) => {
      console.error("Search error:", error);
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Scrape mutation for batch scraping
  const scrapeMutation = useMutation({
    mutationFn: async (urls: string[]) => {
      const results = [];
      for (const url of urls) {
        try {
          const { data, error } = await supabase.functions.invoke("scrape-lawyers", {
            body: { 
              url, 
              searchQuery: `${city} ${specialization} ${barAssociation}`.trim(),
              searchType: "ai_search"
            },
          });
          if (error) throw error;
          results.push(data);
        } catch (err) {
          console.error("Scrape error for", url, err);
        }
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scraping-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["lawyers"] });
      toast.success("Scraping lancé pour toutes les URLs sélectionnées");
      setSearchResults([]);
      setHasSearched(false);
    },
    onError: (error: Error) => {
      console.error("Batch scraping error:", error);
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city && !specialization && !barAssociation) {
      toast.error("Veuillez renseigner au moins un critère de recherche");
      return;
    }
    searchMutation.mutate();
  };

  const handleToggleResult = (index: number) => {
    setSearchResults(prev => 
      prev.map((r, i) => i === index ? { ...r, selected: !r.selected } : r)
    );
  };

  const handleSelectAll = () => {
    const allSelected = searchResults.every(r => r.selected);
    setSearchResults(prev => prev.map(r => ({ ...r, selected: !allSelected })));
  };

  const handleStartScraping = () => {
    const selectedUrls = searchResults.filter(r => r.selected).map(r => r.url);
    if (selectedUrls.length === 0) {
      toast.error("Veuillez sélectionner au moins une URL");
      return;
    }
    scrapeMutation.mutate(selectedUrls);
  };

  const selectedCount = searchResults.filter(r => r.selected).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Recherche automatique par IA
          </CardTitle>
          <CardDescription>
            L'IA recherche automatiquement les annuaires d'avocats correspondant à vos critères
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  placeholder="Ex: Paris, Lyon, Marseille..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  list="cities-list"
                  disabled={searchMutation.isPending}
                />
                <datalist id="cities-list">
                  {FRENCH_CITIES.map(c => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Spécialisation</Label>
                <Input
                  id="specialization"
                  placeholder="Ex: Droit des affaires..."
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  list="specs-list"
                  disabled={searchMutation.isPending}
                />
                <datalist id="specs-list">
                  {SPECIALIZATIONS.map(s => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bar">Barreau</Label>
                <Input
                  id="bar"
                  placeholder="Ex: Barreau de Paris..."
                  value={barAssociation}
                  onChange={(e) => setBarAssociation(e.target.value)}
                  disabled={searchMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxResults">Nombre max d'URLs</Label>
                <Input
                  id="maxResults"
                  type="number"
                  min={1}
                  max={20}
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e.target.value) || 10)}
                  disabled={searchMutation.isPending}
                />
              </div>
            </div>

            <Button type="submit" disabled={searchMutation.isPending}>
              {searchMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Recherche en cours...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Rechercher des annuaires
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {hasSearched && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  URLs découvertes
                </CardTitle>
                <CardDescription>
                  Sélectionnez les URLs à scraper ({selectedCount} sélectionnée(s))
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {searchResults.every(r => r.selected) ? "Tout désélectionner" : "Tout sélectionner"}
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleStartScraping}
                  disabled={scrapeMutation.isPending || selectedCount === 0}
                >
                  {scrapeMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Scraping...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Scraper ({selectedCount})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune URL trouvée. Essayez d'autres critères.
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      result.selected 
                        ? "bg-primary/5 border-primary/20" 
                        : "bg-muted/30 border-border"
                    }`}
                  >
                    <Checkbox
                      checked={result.selected}
                      onCheckedChange={() => handleToggleResult(index)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {result.title}
                        </span>
                        {result.selected && (
                          <Badge variant="secondary" className="shrink-0">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Sélectionné
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {result.description || "Pas de description"}
                      </p>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {result.url.length > 60 ? result.url.slice(0, 60) + "..." : result.url}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
