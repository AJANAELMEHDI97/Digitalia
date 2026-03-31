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
      const demoEngagements = Math.floor(Math.random() * 50) + 20 + (13 - i) * 3;

      data.push({
        date: format(date, "dd/MM", { locale: fr }),
        engagements: dayMetrics.length > 0 ? engagements : demoEngagements,
      });
    }

    return data;
  }, [metrics]);

  const topPublications = useMemo(() => {
    if (metrics.length === 0) {
      return [
        {
          id: "1",
          title: "Licenciement abusif : vos droits",
          reach: 1240,
          performance: "good" as const,
        },
        {
          id: "2",
          title: "Garde alternee : les criteres",
          reach: 890,
          performance: "good" as const,
        },
        {
          id: "3",
          title: "Delais de prescription",
          reach: 650,
          performance: "medium" as const,
        },
      ];
    }

    return metrics
      .sort((left, right) => right.reach - left.reach)
      .slice(0, 3)
      .map((metric) => ({
        id: metric.id,
        title: `${metric.publication?.content?.substring(0, 40) || "Publication"}...`,
        reach: metric.reach,
        performance: (metric.performance_level || "medium") as "good" | "medium" | "improve",
      }));
  }, [metrics]);

  const getPerformanceBadge = (level: string | null) => {
    switch (level) {
      case "good":
        return (
          <Badge className="bg-[#dff7ea] text-[#109266] hover:bg-[#dff7ea]">
            Excellent
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-[#fff3da] text-[#a86507] hover:bg-[#fff3da]">
            Bon
          </Badge>
        );
      default:
        return <Badge variant="outline">A optimiser</Badge>;
    }
  };

  const totalEngagements = chartData.reduce((sum, entry) => sum + entry.engagements, 0);
  const avgEngagements = Math.round(totalEngagements / chartData.length);

  return (
    <Card className="rounded-[30px] border border-[#e9ebf5] bg-white shadow-[0_14px_40px_rgba(110,122,167,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(110,122,167,0.08)]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-4 text-[18px] font-semibold text-[#1f2538]">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#dcf8ea]">
              <TrendingUp className="h-5 w-5 text-[#18ba7b]" />
            </div>
            <span>Performances recentes</span>
          </CardTitle>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="rounded-full px-2 text-[14px] font-semibold text-[#9aa1b8] hover:bg-transparent hover:text-[#5b63d3]"
          >
            <Link to="/metrics">
              Details
              <ChevronRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <>
            <Skeleton className="h-28 w-full rounded-[22px]" />
            <div className="space-y-2">
              <Skeleton className="h-14 rounded-[18px]" />
              <Skeleton className="h-14 rounded-[18px]" />
              <Skeleton className="h-14 rounded-[18px]" />
            </div>
          </>
        ) : (
          <>
            <div className="h-28 w-full overflow-hidden rounded-[22px] bg-[#fbfbff] px-2 py-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="engagementsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5b63d3" stopOpacity={0.24} />
                      <stop offset="100%" stopColor="#5b63d3" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#8d94ab" }}
                    axisLine={false}
                    tickLine={false}
                    interval={3}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 16,
                      border: "1px solid #e7e9f6",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 10px 30px rgba(112,122,163,0.08)",
                    }}
                    formatter={(value: number) => [`${value} interactions`, "Engagements"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="engagements"
                    stroke="#5b63d3"
                    strokeWidth={2}
                    fill="url(#engagementsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between border-t border-[#edf0f8] pt-4 text-[14px] text-[#8d94ab]">
              <span>Moyenne journaliere</span>
              <span className="font-semibold text-[#1f2538]">{avgEngagements} interactions</span>
            </div>

            <div className="space-y-2">
              <p className="text-[14px] font-semibold text-[#8d94ab]">Meilleures publications</p>
              {topPublications.map((publication, index) => (
                <div
                  key={publication.id}
                  className="flex items-center gap-3 rounded-[18px] bg-[#f8f9ff] p-3 transition-colors hover:bg-[#f2f4ff]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ece9ff] text-[13px] font-bold text-[#5546d7]">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-[#1f2538]">
                      {publication.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[13px] text-[#8d94ab]">
                      <Eye className="h-3 w-3" />
                      <span>{publication.reach.toLocaleString()}</span>
                    </div>
                  </div>
                  {getPerformanceBadge(publication.performance)}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
