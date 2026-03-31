import { Link } from "react-router-dom";
import { TrendingUp, Eye, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicationMetric } from "@/hooks/useMetrics";
import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";

interface LawyerPerformanceCardProps {
  metrics: PublicationMetric[];
  loading?: boolean;
}

const fallbackTrend = [42, 31, 36, 44, 39, 59, 51, 48, 47, 48, 64, 41, 45, 62];

export function LawyerPerformanceCard({ metrics, loading }: LawyerPerformanceCardProps) {
  const chartData = useMemo(() => {
    const now = new Date();
    const data = [];

    for (let i = 13; i >= 0; i -= 1) {
      const date = subDays(now, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayMetrics = metrics.filter((metric) => metric.recorded_at.startsWith(dateStr));

      const engagements = dayMetrics.reduce(
        (sum, metric) => sum + metric.likes + metric.comments_count + metric.shares,
        0,
      );

      data.push({
        date: format(date, "dd/MM", { locale: fr }),
        engagements: dayMetrics.length > 0 ? engagements : fallbackTrend[13 - i],
      });
    }

    return data;
  }, [metrics]);

  const featuredPublication = useMemo(() => {
    if (metrics.length === 0) {
      return {
        id: "demo-1",
        title: "Face a un licenciement economique, il est essentiel de connaitre vos recours.",
        reach: 4850,
        performance: "good",
      };
    }

    const sorted = [...metrics].sort((a, b) => b.reach - a.reach);
    const item = sorted[0];

    return {
      id: item.id,
      title: item.publication?.content?.trim() || "Publication",
      reach: item.reach,
      performance: item.performance_level || "medium",
    };
  }, [metrics]);

  const avgEngagements = Math.round(
    chartData.reduce((sum, point) => sum + point.engagements, 0) / chartData.length,
  );

  const performanceBadge =
    featuredPublication.performance === "good" ? (
      <Badge className="rounded-full border-0 bg-[#d7f7e9] px-4 py-1.5 text-sm font-semibold text-[#0f9d69] shadow-none">
        Excellent
      </Badge>
    ) : featuredPublication.performance === "medium" ? (
      <Badge className="rounded-full border-0 bg-[#fff1d6] px-4 py-1.5 text-sm font-semibold text-[#e09019] shadow-none">
        Bon
      </Badge>
    ) : (
      <Badge className="rounded-full border-0 bg-[#ffe7e2] px-4 py-1.5 text-sm font-semibold text-[#ef6b5b] shadow-none">
        A optimiser
      </Badge>
    );

  return (
    <Card className="rounded-[30px] border border-[#ececf6] bg-white shadow-[0_10px_28px_rgba(88,98,140,0.05)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-[18px] font-semibold text-[#2b3042]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d8f9e9]">
              <TrendingUp className="h-5 w-5 text-[#0ea56f]" />
            </div>
            <span>Performances recentes</span>
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="h-9 rounded-full px-3 text-sm font-semibold text-[#9aa1b8] hover:bg-[#f5f6fc] hover:text-[#6f7894]">
            <Link to="/metrics">
              Details
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {loading ? (
          <>
            <Skeleton className="h-36 w-full rounded-[22px]" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-20 w-full rounded-[22px]" />
          </>
        ) : (
          <>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="engagementsGradientRef" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "#72798f" }}
                    axisLine={false}
                    tickLine={false}
                    interval={3}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 16,
                      border: "1px solid #ececf6",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 10px 24px rgba(88,98,140,0.10)",
                    }}
                    formatter={(value: number) => [`${value} interactions`, "Engagement"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="engagements"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fill="url(#engagementsGradientRef)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between border-t border-[#ececf6] pt-5 text-[15px]">
              <span className="text-[#99a1bb]">Moyenne journaliere</span>
              <span className="font-semibold text-[#2a3042]">{avgEngagements} interactions</span>
            </div>

            <div className="space-y-3">
              <p className="text-[15px] font-semibold text-[#99a1bb]">Meilleures publications</p>
              <div className="flex items-center gap-4 rounded-[22px] bg-[#f7f8fd] px-4 py-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ece9ff] text-sm font-semibold text-primary">
                  1
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[17px] font-semibold text-[#2a3042]">
                    {featuredPublication.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[14px] text-[#99a1bb]">
                    <Eye className="h-4 w-4" />
                    <span>{featuredPublication.reach.toLocaleString()}</span>
                  </div>
                </div>
                {performanceBadge}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
