import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Loader2, CheckCircle, XCircle, Search, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

export function ScrapingProgressTracker() {
  const { isAdmin } = useUserRole();
  const [isMinimized, setIsMinimized] = useState(false);
  const [dismissedJobs, setDismissedJobs] = useState<Set<string>>(new Set());

  // Poll for active scraping jobs
  const { data: activeJobs } = useQuery({
    queryKey: ["active-scraping-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scraping_jobs")
        .select("*")
        .in("status", ["pending", "running"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ScrapingJob[];
    },
    enabled: isAdmin,
    refetchInterval: 2000, // Poll every 2 seconds
  });

  // Get recently completed jobs (last 30 seconds)
  const { data: recentJobs } = useQuery({
    queryKey: ["recent-scraping-jobs"],
    queryFn: async () => {
      const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
      const { data, error } = await supabase
        .from("scraping_jobs")
        .select("*")
        .in("status", ["completed", "failed"])
        .gte("completed_at", thirtySecondsAgo)
        .order("completed_at", { ascending: false });

      if (error) throw error;
      return data as ScrapingJob[];
    },
    enabled: isAdmin,
    refetchInterval: 2000,
  });

  // Combine active and recent jobs, filter dismissed
  const visibleJobs = [
    ...(activeJobs || []),
    ...(recentJobs || []).filter((j) => !dismissedJobs.has(j.id)),
  ];

  const handleDismiss = (jobId: string) => {
    setDismissedJobs((prev) => new Set([...prev, jobId]));
  };

  // Auto-dismiss completed jobs after 10 seconds
  useEffect(() => {
    const completedJobs = recentJobs?.filter(
      (j) => (j.status === "completed" || j.status === "failed") && !dismissedJobs.has(j.id)
    );

    if (completedJobs?.length) {
      const timer = setTimeout(() => {
        completedJobs.forEach((job) => {
          setDismissedJobs((prev) => new Set([...prev, job.id]));
        });
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [recentJobs, dismissedJobs]);

  if (!isAdmin || visibleJobs.length === 0) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">
            En cours
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-200">
            Terminé
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-200">
            Échoué
          </Badge>
        );
      default:
        return <Badge variant="secondary">En attente</Badge>;
    }
  };

  const truncateUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + (urlObj.pathname.length > 20 ? urlObj.pathname.slice(0, 20) + "..." : urlObj.pathname);
    } catch {
      return url.slice(0, 40) + "...";
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 bg-background border rounded-lg shadow-lg transition-all duration-300",
        isMinimized ? "w-auto" : "w-96"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">
            Scraping {visibleJobs.length > 1 ? `(${visibleJobs.length})` : ""}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className="h-3 w-3" />
            ) : (
              <Minimize2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-3 space-y-3 max-h-80 overflow-y-auto">
          {visibleJobs.map((job) => (
            <div key={job.id} className="space-y-2 p-2 bg-muted/30 rounded-md">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getStatusIcon(job.status)}
                  <span className="text-xs font-mono truncate">
                    {truncateUrl(job.source_url)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(job.status)}
                  {(job.status === "completed" || job.status === "failed") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => handleDismiss(job.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {job.status === "running" && (
                <div className="space-y-1">
                  <Progress value={undefined} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">
                    Extraction en cours...
                  </p>
                </div>
              )}

              {job.status === "completed" && (
                <p className="text-xs text-green-600">
                  ✓ {job.total_scraped} avocat(s) extrait(s) sur {job.total_found} trouvé(s)
                </p>
              )}

              {job.status === "failed" && job.error_message && (
                <p className="text-xs text-red-600 truncate">
                  Erreur: {job.error_message}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Minimized indicator */}
      {isMinimized && (
        <div className="p-2 flex items-center gap-2">
          {activeJobs && activeJobs.length > 0 ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-xs">{activeJobs.length} en cours</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xs">Terminé</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
