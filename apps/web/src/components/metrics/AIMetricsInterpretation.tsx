import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Lightbulb, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface MetricsData {
  reach: number;
  likes: number;
  comments: number;
  shares?: number;
  clicks?: number;
  engagementRate: number;
  platform: string | null;
  topic?: string;
}

interface AIInterpretation {
  status: "green" | "yellow" | "red";
  statusLabel: string;
  interpretation: string;
  recommendation?: string;
}

interface AIMetricsInterpretationProps {
  metrics: MetricsData;
  compact?: boolean;
  className?: string;
}

const statusConfig = {
  green: {
    icon: CheckCircle2,
    emoji: "🟢",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    textColor: "text-emerald-700 dark:text-emerald-400",
    iconColor: "text-emerald-500",
  },
  yellow: {
    icon: AlertCircle,
    emoji: "🟡",
    bgColor: "bg-amber-50 dark:bg-amber-950/50",
    borderColor: "border-amber-200 dark:border-amber-800",
    textColor: "text-amber-700 dark:text-amber-400",
    iconColor: "text-amber-500",
  },
  red: {
    icon: AlertTriangle,
    emoji: "🔴",
    bgColor: "bg-slate-50 dark:bg-slate-950/50",
    borderColor: "border-slate-200 dark:border-slate-700",
    textColor: "text-slate-600 dark:text-slate-400",
    iconColor: "text-slate-500",
  },
};

// Fallback interpretations when AI is unavailable
function getFallbackInterpretation(metrics: MetricsData): AIInterpretation {
  const { engagementRate } = metrics;
  
  if (engagementRate >= 3.5) {
    return {
      status: "green",
      statusLabel: "Communication maîtrisée",
      interpretation: "Cette prise de parole remplit pleinement son objectif de visibilité professionnelle. L'intérêt suscité témoigne de la pertinence du sujet pour vos prospects.",
      recommendation: "Ce type de contenu peut être décliné sur d'autres thématiques juridiques.",
    };
  } else if (engagementRate >= 2) {
    return {
      status: "yellow",
      statusLabel: "À optimiser",
      interpretation: "La visibilité est correcte. L'intérêt suscité reste modéré, ce qui est habituel pour un sujet technique.",
      recommendation: "Un angle plus concret ou des exemples pratiques pourraient renforcer l'impact.",
    };
  } else {
    return {
      status: "red",
      statusLabel: "Sujet sensible",
      interpretation: "Cette prise de parole a eu une portée limitée. Le sujet technique a moins engagé votre audience.",
      recommendation: "Envisager un format plus visuel ou une accroche plus directe.",
    };
  }
}

// Cache for AI interpretations
const interpretationCache = new Map<string, AIInterpretation>();

function getCacheKey(metrics: MetricsData): string {
  return `${metrics.reach}-${metrics.likes}-${metrics.comments}-${metrics.engagementRate}-${metrics.platform}`;
}

export function AIMetricsInterpretation({ metrics, compact = false, className }: AIMetricsInterpretationProps) {
  const [interpretation, setInterpretation] = useState<AIInterpretation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchInterpretation = async () => {
      const cacheKey = getCacheKey(metrics);
      
      // Check cache first
      if (interpretationCache.has(cacheKey)) {
        setInterpretation(interpretationCache.get(cacheKey)!);
        setLoading(false);
        return;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke("interpret-metrics", {
          body: {
            reach: metrics.reach,
            likes: metrics.likes,
            comments: metrics.comments,
            shares: metrics.shares,
            clicks: metrics.clicks,
            engagementRate: metrics.engagementRate,
            platform: metrics.platform || "linkedin",
            topic: metrics.topic,
          },
        });

        if (fnError) throw fnError;

        if (data && data.status) {
          interpretationCache.set(cacheKey, data);
          setInterpretation(data);
        } else {
          throw new Error("Invalid response");
        }
      } catch (err) {
        console.error("Failed to fetch AI interpretation:", err);
        setError(true);
        // Use fallback
        const fallback = getFallbackInterpretation(metrics);
        setInterpretation(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchInterpretation();
  }, [metrics.reach, metrics.likes, metrics.comments, metrics.engagementRate, metrics.platform]);

  if (loading) {
    return (
      <Card className={cn("border-2 border-muted", className)}>
        <CardContent className="py-6 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Analyse en cours...</span>
        </CardContent>
      </Card>
    );
  }

  if (!interpretation) return null;

  const config = statusConfig[interpretation.status];
  const StatusIcon = config.icon;

  if (compact) {
    return (
      <div className={cn("flex items-start gap-2 p-3 rounded-lg border", config.bgColor, config.borderColor, className)}>
        <span className="text-lg">{config.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className={cn("text-xs font-medium", config.textColor)}>{interpretation.statusLabel}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">{interpretation.interpretation}</p>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("border-2", config.borderColor, className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.emoji}</span>
          <div>
            <h3 className={cn("text-lg font-semibold", config.textColor)}>
              {interpretation.statusLabel}
            </h3>
            <p className="text-sm text-muted-foreground">
              Analyse de cette prise de parole
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main interpretation */}
        <div className="flex gap-3">
          <StatusIcon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", config.iconColor)} />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {interpretation.interpretation}
          </p>
        </div>

        {/* Recommendation */}
        {interpretation.recommendation && (
          <div className={cn("rounded-lg p-4 border", config.bgColor, config.borderColor)}>
            <div className="flex gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium mb-1">Recommandation</p>
                <p className="text-sm text-muted-foreground">
                  {interpretation.recommendation}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-muted-foreground italic">
            Analyse générée localement (service IA temporairement indisponible)
          </p>
        )}
      </CardContent>
    </Card>
  );
}
