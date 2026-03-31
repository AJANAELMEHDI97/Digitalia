import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface PublicationMetric {
  id: string;
  publication_id: string;
  reach: number;
  likes: number;
  comments_count: number;
  shares: number;
  clicks: number;
  engagement_rate: number;
  performance_level: "good" | "medium" | "improve" | null;
  audience_age: Record<string, number> | null;
  audience_location: Record<string, number> | null;
  audience_gender: Record<string, number> | null;
  peak_times: Record<string, number> | null;
  recorded_at: string;
  // Joined publication data
  publication?: {
    id: string;
    content: string;
    platform: string | null;
    image_url: string | null;
    scheduled_date: string;
    status: string;
  };
}

export interface GlobalMetrics {
  totalReach: number;
  totalEngagements: number;
  avgEngagementRate: number;
  totalPublications: number;
  goodPerformers: number;
  mediumPerformers: number;
  improvePerformers: number;
}

// Demo fallback values for empty data
const DEMO_GLOBAL_METRICS: GlobalMetrics = {
  totalReach: 24850,
  totalEngagements: 1842,
  avgEngagementRate: 4.2,
  totalPublications: 47,
  goodPerformers: 28,
  mediumPerformers: 14,
  improvePerformers: 5
};

interface UseMetricsOptions {
  limit?: number;
  enabled?: boolean;
}

export function useMetrics(options?: UseMetricsOptions) {
  const { limit = 20, enabled = true } = options || {};
  const { user } = useAuth();

  // Use React Query for caching and deduplication
  const { 
    data: metrics = [], 
    isLoading: loading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['publication-metrics', user?.id, limit],
    queryFn: async () => {
      if (!user) return [];

      const { data, error: fetchError } = await supabase
        .from("publication_metrics")
        .select(`
          *,
          publication:publications(
            id,
            content,
            platform,
            image_url,
            scheduled_date,
            status
          )
        `)
        .order("recorded_at", { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;
      return (data || []) as PublicationMetric[];
    },
    enabled: enabled && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes - metrics don't change frequently
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
  });

  // Calculate global metrics with demo fallback for empty data
  const globalMetrics = useMemo((): GlobalMetrics => {
    if (metrics.length === 0) {
      return DEMO_GLOBAL_METRICS;
    }

    const totalReach = metrics.reduce((sum, m) => sum + m.reach, 0);
    const totalEngagements = metrics.reduce((sum, m) => sum + m.likes + m.comments_count + m.shares, 0);
    const avgEngagementRate = metrics.reduce((sum, m) => sum + m.engagement_rate, 0) / metrics.length;
    const goodPerformers = metrics.filter(m => m.performance_level === "good").length;
    const mediumPerformers = metrics.filter(m => m.performance_level === "medium").length;
    const improvePerformers = metrics.filter(m => m.performance_level === "improve").length;

    return {
      totalReach,
      totalEngagements,
      avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
      totalPublications: metrics.length,
      goodPerformers,
      mediumPerformers,
      improvePerformers
    };
  }, [metrics]);

  // Get metrics filtered by platform
  const getMetricsByPlatform = useMemo(() => {
    return (platform: string | null) => {
      if (!platform) return metrics;
      return metrics.filter(m => m.publication?.platform === platform);
    };
  }, [metrics]);

  // Get metrics filtered by performance level
  const getMetricsByPerformance = useMemo(() => {
    return (level: "good" | "medium" | "improve" | "all") => {
      if (level === "all") return metrics;
      return metrics.filter(m => m.performance_level === level);
    };
  }, [metrics]);

  // Get top performing publications
  const getTopPerformers = useMemo(() => {
    return (topLimit: number = 5) => {
      return [...metrics]
        .sort((a, b) => b.reach - a.reach)
        .slice(0, topLimit);
    };
  }, [metrics]);

  // Get metrics for date range
  const getMetricsForDateRange = useMemo(() => {
    return (startDate: Date, endDate: Date) => {
      return metrics.filter(m => {
        const recordedAt = new Date(m.recorded_at);
        return recordedAt >= startDate && recordedAt <= endDate;
      });
    };
  }, [metrics]);

  // Get platform distribution
  const platformDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    
    metrics.forEach(m => {
      const platform = m.publication?.platform || "unknown";
      distribution[platform] = (distribution[platform] || 0) + 1;
    });

    return distribution;
  }, [metrics]);

  return {
    metrics,
    loading,
    error: error instanceof Error ? error.message : null,
    globalMetrics,
    getMetricsByPlatform,
    getMetricsByPerformance,
    getTopPerformers,
    getMetricsForDateRange,
    platformDistribution,
    refetch
  };
}
