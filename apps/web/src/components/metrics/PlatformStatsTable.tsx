import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Linkedin, Instagram, Facebook, Twitter } from "lucide-react";

interface PlatformStat {
  platform: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  impressions: number;
  reach: number;
  engagement: number;
  engagementTrend: "up" | "down";
  ctr: number;
  ctrTrend: "up" | "down";
  conversions: number;
  roi: string;
  comments: number;
}

const platformStats: PlatformStat[] = [
  {
    platform: "Facebook",
    icon: Facebook,
    iconBg: "bg-[#1877F2]",
    impressions: 32000,
    reach: 28000,
    engagement: 5.4,
    engagementTrend: "up",
    ctr: 2.1,
    ctrTrend: "up",
    conversions: 120,
    roi: "€4,200",
    comments: 129,
  },
  {
    platform: "LinkedIn",
    icon: Linkedin,
    iconBg: "bg-[#0077B5]",
    impressions: 12500,
    reach: 11800,
    engagement: 3.2,
    engagementTrend: "down",
    ctr: 1.9,
    ctrTrend: "down",
    conversions: 40,
    roi: "€980",
    comments: 98,
  },
  {
    platform: "X",
    icon: Twitter,
    iconBg: "bg-black dark:bg-white",
    impressions: 13584,
    reach: 28000,
    engagement: 2.5,
    engagementTrend: "down",
    ctr: 0.8,
    ctrTrend: "up",
    conversions: 64,
    roi: "€1100",
    comments: 87,
  },
  {
    platform: "Instagram",
    icon: Instagram,
    iconBg: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]",
    impressions: 32000,
    reach: 28000,
    engagement: 1.9,
    engagementTrend: "up",
    ctr: 1.2,
    ctrTrend: "down",
    conversions: 58,
    roi: "€2450",
    comments: 102,
  },
];

export function PlatformStatsTable() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left text-xs font-medium text-muted-foreground p-4">
                  Platform
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">
                  Impressions
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">
                  Reach
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">
                  Engagement
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">
                  CTR
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">
                  Conversions
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">
                  ROI
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">
                  Commentaire
                </th>
              </tr>
            </thead>
            <tbody>
              {platformStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <tr key={stat.platform} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                          <Icon className={`h-4 w-4 ${stat.platform === 'X' ? 'text-white dark:text-black' : 'text-white'}`} />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium">
                      {stat.impressions.toLocaleString("fr-FR")}
                    </td>
                    <td className="p-4 text-sm font-medium">
                      {stat.reach.toLocaleString("fr-FR")}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-medium ${
                          stat.engagementTrend === "up" ? "text-emerald-500" : "text-rose-500"
                        }`}>
                          {stat.engagement}%
                        </span>
                        {stat.engagementTrend === "up" ? (
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-medium ${
                          stat.ctrTrend === "up" ? "text-emerald-500" : "text-rose-500"
                        }`}>
                          {stat.ctr}%
                        </span>
                        {stat.ctrTrend === "up" ? (
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium">
                      {stat.conversions}
                    </td>
                    <td className="p-4 text-sm font-medium text-primary">
                      {stat.roi}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {stat.comments}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
