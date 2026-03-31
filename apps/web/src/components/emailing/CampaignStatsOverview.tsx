import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import { TrendingUp, TrendingDown, Minus, Mail, MousePointerClick, AlertTriangle, UserMinus } from "lucide-react";
import type { EmailCampaign, EmailRecipient } from "@/hooks/useEmailing";

interface CampaignStatsOverviewProps {
  campaign: EmailCampaign;
  recipients: EmailRecipient[];
}

const getPerformanceLevel = (rate: number, type: "open" | "click" | "bounce" | "unsubscribe") => {
  if (type === "open") {
    if (rate >= 25) return { label: "Excellent", color: "text-green-600", bg: "bg-green-100", icon: TrendingUp };
    if (rate >= 15) return { label: "Bon", color: "text-amber-600", bg: "bg-amber-100", icon: Minus };
    return { label: "À améliorer", color: "text-red-600", bg: "bg-red-100", icon: TrendingDown };
  }
  if (type === "click") {
    if (rate >= 5) return { label: "Excellent", color: "text-green-600", bg: "bg-green-100", icon: TrendingUp };
    if (rate >= 2) return { label: "Bon", color: "text-amber-600", bg: "bg-amber-100", icon: Minus };
    return { label: "À améliorer", color: "text-red-600", bg: "bg-red-100", icon: TrendingDown };
  }
  if (type === "bounce") {
    if (rate <= 2) return { label: "Excellent", color: "text-green-600", bg: "bg-green-100", icon: TrendingUp };
    if (rate <= 5) return { label: "Acceptable", color: "text-amber-600", bg: "bg-amber-100", icon: Minus };
    return { label: "Problématique", color: "text-red-600", bg: "bg-red-100", icon: TrendingDown };
  }
  // unsubscribe
  if (rate <= 0.5) return { label: "Excellent", color: "text-green-600", bg: "bg-green-100", icon: TrendingUp };
  if (rate <= 1) return { label: "Acceptable", color: "text-amber-600", bg: "bg-amber-100", icon: Minus };
  return { label: "À surveiller", color: "text-red-600", bg: "bg-red-100", icon: TrendingDown };
};

export function CampaignStatsOverview({ campaign, recipients }: CampaignStatsOverviewProps) {
  const sentCount = campaign.sent_count || 0;
  const openedCount = campaign.opened_count || 0;
  const clickedCount = campaign.clicked_count || 0;
  const bounceCount = campaign.bounce_count || 0;
  const unsubscribeCount = campaign.unsubscribe_count || 0;

  const openRate = sentCount > 0 ? (openedCount / sentCount) * 100 : 0;
  const clickRate = sentCount > 0 ? (clickedCount / sentCount) * 100 : 0;
  const bounceRate = sentCount > 0 ? (bounceCount / sentCount) * 100 : 0;
  const unsubscribeRate = sentCount > 0 ? (unsubscribeCount / sentCount) * 100 : 0;

  const openPerf = getPerformanceLevel(openRate, "open");
  const clickPerf = getPerformanceLevel(clickRate, "click");
  const bouncePerf = getPerformanceLevel(bounceRate, "bounce");
  const unsubPerf = getPerformanceLevel(unsubscribeRate, "unsubscribe");

  const chartData = [
    { name: "Ouverts", value: openedCount, color: "hsl(var(--primary))" },
    { name: "Cliqués", value: clickedCount, color: "hsl(142, 76%, 36%)" },
    { name: "Non ouverts", value: Math.max(0, sentCount - openedCount), color: "hsl(var(--muted))" },
  ].filter(item => item.value > 0);

  const stats = [
    {
      label: "Taux d'ouverture",
      value: openRate.toFixed(1),
      icon: Mail,
      perf: openPerf,
      detail: `${openedCount} / ${sentCount}`,
    },
    {
      label: "Taux de clic",
      value: clickRate.toFixed(1),
      icon: MousePointerClick,
      perf: clickPerf,
      detail: `${clickedCount} / ${sentCount}`,
    },
    {
      label: "Taux de rebond",
      value: bounceRate.toFixed(1),
      icon: AlertTriangle,
      perf: bouncePerf,
      detail: `${bounceCount} rebonds`,
    },
    {
      label: "Désabonnements",
      value: unsubscribeRate.toFixed(1),
      icon: UserMinus,
      perf: unsubPerf,
      detail: `${unsubscribeCount} désabo`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => {
          const PerfIcon = stat.perf.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className={`${stat.perf.bg} ${stat.perf.color} border-0`}>
                    <PerfIcon className="h-3 w-3 mr-1" />
                    {stat.perf.label}
                  </Badge>
                </div>
                <CardTitle className="text-2xl">{stat.value}%</CardTitle>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">{stat.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Progression des ouvertures</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={openRate} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {openedCount} ouvert{openedCount > 1 ? "s" : ""} sur {sentCount} envoyé{sentCount > 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      {/* Horizontal Bars */}
      {sentCount > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Répartition des interactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {chartData.map((item) => {
              const pct = sentCount > 0 ? ((item.value / sentCount) * 100).toFixed(1) : "0";
              const maxVal = Math.max(...chartData.map(d => d.value), 1);
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm tabular-nums">{item.value}</span>
                      <span className="text-muted-foreground">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(item.value / maxVal) * 100}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
