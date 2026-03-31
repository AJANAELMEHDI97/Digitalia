import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Search, Loader2, CheckCircle, XCircle, Clock, Play, Sparkles, Link } from "lucide-react";
import { AILawyerSearch } from "./AILawyerSearch";

interface ScrapingJob {
  id: string;
  source_url: string;
  status: string;
  total_found: number;
  total_scraped: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  search_type: string | null;
  search_query: string | null;
}

export function LawyerScraping() {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["scraping-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scraping_jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as ScrapingJob[];
    },
    refetchInterval: 5000, // Refresh every 5s to get job updates
  });

  const startScrapingMutation = useMutation({
    mutationFn: async (sourceUrl: string) => {
      const { data, error } = await supabase.functions.invoke("scrape-lawyers", {
        body: { url: sourceUrl, searchType: "manual" },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scraping-jobs"] });
      toast.success("Scraping démarré en arrière-plan");
      setUrl("");
    },
    onError: (error: Error) => {
      console.error("Scraping error:", error);
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const handleStartScraping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error("Veuillez entrer une URL");
      return;
    }
    startScrapingMutation.mutate(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Terminé
          </Badge>
        );
      case "running":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            En cours
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Échoué
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
    }
  };

  const getTypeBadge = (type: string | null) => {
    if (type === "ai_search") {
      return (
        <Badge variant="outline" className="text-primary border-primary/30">
          <Sparkles className="h-3 w-3 mr-1" />
          IA
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <Link className="h-3 w-3 mr-1" />
        Manuel
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Recherche IA
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            URL manuelle
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="mt-6">
          <AILawyerSearch />
        </TabsContent>

        <TabsContent value="manual" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Scraping par URL
              </CardTitle>
              <CardDescription>
                Entrez l'URL d'un annuaire d'avocats ou d'un site de barreau pour extraire les données
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStartScraping} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">URL source</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://www.barreau-paris.avocat.fr/annuaire"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={startScrapingMutation.isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Exemples: annuaires de barreaux, pages LinkedIn, sites d'avocats
                  </p>
                </div>
                <Button type="submit" disabled={startScrapingMutation.isPending}>
                  {startScrapingMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Lancement...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Lancer le scraping
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Historique des jobs</CardTitle>
          <CardDescription>
            Liste des dernières opérations de scraping
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : jobs && jobs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Trouvés</TableHead>
                  <TableHead>Scrapés</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>{getTypeBadge(job.search_type)}</TableCell>
                    <TableCell className="max-w-[250px]">
                      <div className="truncate font-mono text-xs" title={job.source_url}>
                        {job.source_url}
                      </div>
                      {job.search_query && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {job.search_query}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>{job.total_found}</TableCell>
                    <TableCell>{job.total_scraped}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(job.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucun job de scraping pour le moment
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
