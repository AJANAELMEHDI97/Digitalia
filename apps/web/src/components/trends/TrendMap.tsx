import { TrendTopic } from "@/data/mockTrends";
import { cn } from "@/lib/utils";

interface TrendMapProps {
  trends: TrendTopic[];
  onTrendClick: (trend: TrendTopic) => void;
}

// Simulated geographic positions for French regions
const REGION_POSITIONS: Record<string, { x: number; y: number }> = {
  Paris: { x: 52, y: 28 },
  Lyon: { x: 58, y: 55 },
  Marseille: { x: 62, y: 78 },
  Bordeaux: { x: 30, y: 60 },
  Lille: { x: 55, y: 8 },
  Toulouse: { x: 38, y: 75 },
  Nantes: { x: 22, y: 42 },
  Nice: { x: 78, y: 75 },
  Rennes: { x: 18, y: 32 },
  Cannes: { x: 75, y: 78 },
  Monaco: { x: 82, y: 76 },
  "Sophia Antipolis": { x: 76, y: 74 },
  "France entière": { x: 50, y: 45 },
};

export function TrendMap({ trends, onTrendClick }: TrendMapProps) {
  // Group trends by peak region
  const trendsByRegion = trends.reduce((acc, trend) => {
    const region = trend.peakRegion;
    if (!acc[region]) {
      acc[region] = [];
    }
    acc[region].push(trend);
    return acc;
  }, {} as Record<string, TrendTopic[]>);

  // Calculate bubble size based on total intensity
  const getBubbleSize = (regionTrends: TrendTopic[]) => {
    const totalIntensity = regionTrends.reduce((sum, t) => sum + t.intensity, 0);
    const avgIntensity = totalIntensity / regionTrends.length;
    return Math.max(20, Math.min(60, avgIntensity * 0.6));
  };

  // Get bubble color based on highest attention level
  const getBubbleColor = (regionTrends: TrendTopic[]) => {
    const hasHigh = regionTrends.some((t) => t.attentionLevel === "high");
    const hasMedium = regionTrends.some((t) => t.attentionLevel === "medium");

    if (hasHigh) return "bg-red-500/80 border-red-400";
    if (hasMedium) return "bg-amber-500/80 border-amber-400";
    return "bg-blue-500/80 border-blue-400";
  };

  return (
    <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-muted/30 to-muted/60 rounded-xl overflow-hidden border">
      {/* France simplified outline (decorative background) */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full opacity-10"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d="M50 5 L75 15 L85 35 L80 55 L75 75 L60 90 L40 85 L25 70 L15 50 L20 30 L35 15 Z"
          fill="currentColor"
          className="text-foreground"
        />
      </svg>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute left-0 right-0 border-t border-foreground"
            style={{ top: `${i * 10}%` }}
          />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute top-0 bottom-0 border-l border-foreground"
            style={{ left: `${i * 10}%` }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm rounded-lg p-2 text-xs border shadow-sm">
        <p className="font-medium mb-1.5 text-foreground">Niveau d'attention</p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Fort</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">Moyen</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Faible</span>
          </div>
        </div>
      </div>

      {/* Trend bubbles */}
      {Object.entries(trendsByRegion).map(([region, regionTrends]) => {
        const position = REGION_POSITIONS[region] || { x: 50, y: 50 };
        const size = getBubbleSize(regionTrends);
        const colorClass = getBubbleColor(regionTrends);
        const mainTrend = regionTrends.reduce(
          (max, t) => (t.intensity > max.intensity ? t : max),
          regionTrends[0]
        );

        return (
          <button
            key={region}
            className={cn(
              "absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all duration-300 hover:scale-110 hover:z-10 flex items-center justify-center cursor-pointer shadow-lg",
              colorClass
            )}
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: `${size}px`,
              height: `${size}px`,
            }}
            onClick={() => onTrendClick(mainTrend)}
          >
            <span className="text-white text-xs font-bold">
              {regionTrends.length}
            </span>
          </button>
        );
      })}

      {/* Region labels */}
      {Object.entries(REGION_POSITIONS)
        .filter(([region]) => trendsByRegion[region])
        .map(([region, position]) => (
          <div
            key={`label-${region}`}
            className="absolute text-[10px] text-muted-foreground font-medium pointer-events-none whitespace-nowrap"
            style={{
              left: `${position.x}%`,
              top: `calc(${position.y}% + ${getBubbleSize(trendsByRegion[region]) / 2 + 8}px)`,
              transform: "translateX(-50%)",
            }}
          >
            {region === "France entière" ? "" : region}
          </div>
        ))}

      {/* Empty state overlay */}
      {trends.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <p className="text-muted-foreground text-sm">
            Aucune tendance pour cette période
          </p>
        </div>
      )}
    </div>
  );
}
