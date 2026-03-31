import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

export interface CockpitMetric {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  alert?: boolean;
}

interface AdminCockpitBlockProps {
  title: string;
  icon: LucideIcon;
  url: string;
  metrics: CockpitMetric[];
  accentColor: "emerald" | "blue" | "amber" | "violet";
  loading?: boolean;
  sparklineData?: number[];
}

const accentMap = {
  emerald: {
    icon: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/40",
    border: "hover:border-emerald-200 dark:hover:border-emerald-800",
    spark: "#10b981",
    sparkFill: "rgba(16,185,129,0.15)",
  },
  blue: {
    icon: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/40",
    border: "hover:border-blue-200 dark:hover:border-blue-800",
    spark: "#3b82f6",
    sparkFill: "rgba(59,130,246,0.15)",
  },
  amber: {
    icon: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/40",
    border: "hover:border-amber-200 dark:hover:border-amber-800",
    spark: "#f59e0b",
    sparkFill: "rgba(245,158,11,0.15)",
  },
  violet: {
    icon: "text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/40",
    border: "hover:border-violet-200 dark:hover:border-violet-800",
    spark: "#8b5cf6",
    sparkFill: "rgba(139,92,246,0.15)",
  },
};

const TrendIcon = ({ trend }: { trend: "up" | "down" | "neutral" }) => {
  if (trend === "up") return <TrendingUp className="h-3 w-3 text-emerald-500" />;
  if (trend === "down") return <TrendingDown className="h-3 w-3 text-red-500" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
};

// Generate default sparkline data if none provided
function defaultSparkline(): number[] {
  const base = 50 + Math.random() * 30;
  return Array.from({ length: 7 }, (_, i) => Math.round(base + Math.sin(i * 0.8) * 15 + Math.random() * 10));
}

export function AdminCockpitBlock({ title, icon: Icon, url, metrics, accentColor, loading, sparklineData }: AdminCockpitBlockProps) {
  const navigate = useNavigate();
  const accent = accentMap[accentColor];
  const data = (sparklineData || defaultSparkline()).map((v, i) => ({ v, i }));

  return (
    <motion.div
      whileHover={{ scale: 1.015, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Card
        className={cn(
          "cursor-pointer transition-shadow duration-300 hover:shadow-lg border",
          accent.border
        )}
        onClick={() => navigate(url)}
      >
        <CardHeader className="pb-3 pt-4 px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", accent.icon)}>
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-4 pt-0">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-7 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 mb-3">
                {metrics.map((m, i) => (
                  <div key={i} className="min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className={cn(
                        "text-xl font-bold tabular-nums leading-none",
                        m.alert ? "text-red-600 dark:text-red-400" : "text-foreground"
                      )}>
                        {m.value}
                      </span>
                      {m.trend && (
                        <span className="flex items-center gap-0.5">
                          <TrendIcon trend={m.trend} />
                          {m.trendLabel && (
                            <span className={cn(
                              "text-[10px] font-medium",
                              m.trend === "up" ? "text-emerald-600" : m.trend === "down" ? "text-red-500" : "text-muted-foreground"
                            )}>
                              {m.trendLabel}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Sparkline */}
              <div className="h-8 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={accent.spark}
                      strokeWidth={1.5}
                      fill={accent.sparkFill}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
