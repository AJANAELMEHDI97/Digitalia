import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrendTopic, SocialPlatform } from "@/types/trend";

export type TrendCategory = 
  | "all"
  | "Droit du travail"
  | "Droit de la famille"
  | "Droit des affaires"
  | "Droit pénal"
  | "Droit immobilier"
  | "Droit fiscal"
  | "Droit numérique";

export type TrendPeriod = "day" | "week" | "month";

// Database row type
interface TrendRow {
  id: string;
  title: string;
  category: string;
  description: string | null;
  why_trending: string | null;
  attention_level: string | null;
  evolution: string | null;
  relevance: string | null;
  platforms: string[] | null;
  regions: string[] | null;
  peak_region: string | null;
  intensity: number;
  editorial_recommendation: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

// Convert database row to app type
function adaptTrend(row: TrendRow): TrendTopic {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description || "",
    whyTrending: row.why_trending || "",
    attentionLevel: (row.attention_level as TrendTopic["attentionLevel"]) || "medium",
    evolution: (row.evolution as TrendTopic["evolution"]) || "stable",
    relevance: (row.relevance as TrendTopic["relevance"]) || "watch",
    platforms: (row.platforms as SocialPlatform[]) || [],
    regions: row.regions || [],
    peakRegion: row.peak_region || "",
    intensity: row.intensity,
    editorialRecommendation: row.editorial_recommendation || "",
    date: row.date,
  };
}

export function useTrends() {
  const [trends, setTrends] = useState<TrendTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("trends")
        .select("*")
        .order("intensity", { ascending: false });

      if (fetchError) throw fetchError;
      
      const adapted = (data || []).map(row => adaptTrend(row as TrendRow));
      setTrends(adapted);
    } catch (err) {
      console.error("Error fetching trends:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch trends");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  const filterTrends = useMemo(() => {
    return (category: TrendCategory, period: TrendPeriod) => {
      let filtered = [...trends];

      // Filter by category
      if (category !== "all") {
        filtered = filtered.filter(t => t.category === category);
      }

      // Filter by period
      const now = new Date();
      if (period === "day") {
        const today = now.toISOString().split("T")[0];
        filtered = filtered.filter(t => t.date === today);
      } else if (period === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(t => new Date(t.date) >= weekAgo);
      } else if (period === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(t => new Date(t.date) >= monthAgo);
      }

      return filtered.sort((a, b) => b.intensity - a.intensity);
    };
  }, [trends]);

  const getTopTrends = useMemo(() => {
    return (limit: number = 3) => {
      return trends
        .filter(t => t.relevance === "pertinent" || t.attentionLevel === "high")
        .sort((a, b) => b.intensity - a.intensity)
        .slice(0, limit);
    };
  }, [trends]);

  const getTrendStats = useMemo(() => {
    return (filteredTrends: TrendTopic[]) => {
      const highAttention = filteredTrends.filter(t => t.attentionLevel === "high").length;
      const rising = filteredTrends.filter(t => t.evolution === "rising").length;
      const avgIntensity = filteredTrends.length > 0
        ? Math.round(filteredTrends.reduce((sum, t) => sum + t.intensity, 0) / filteredTrends.length)
        : 0;
      
      return {
        total: filteredTrends.length,
        highAttention,
        rising,
        avgIntensity
      };
    };
  }, []);

  return {
    trends,
    loading,
    error,
    filterTrends,
    getTopTrends,
    getTrendStats,
    refetch: fetchTrends
  };
}
