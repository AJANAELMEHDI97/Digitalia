import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import type { CoordinationAnalytics } from "@/hooks/useAdminCoordination";

interface Props {
  analytics: CoordinationAnalytics;
}

const COLORS = {
  primary: "hsl(var(--primary))",
  accent: "hsl(280, 80%, 60%)",
  info: "hsl(210, 80%, 55%)",
  success: "hsl(150, 60%, 45%)",
};

export function CoordinationStatsTab({ analytics }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* By Subject */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Répartition par sujet</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={analytics.bySubject} layout="vertical" margin={{ left: 10, right: 20 }}>
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Bar dataKey="count" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* By CM */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">CM les plus sollicités</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={analytics.byCM} layout="vertical" margin={{ left: 10, right: 20 }}>
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Bar dataKey="count" fill={COLORS.accent} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Resolution rate */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Taux de résolution</h3>
        <div className="flex flex-col items-center justify-center h-[180px] gap-4">
          <p className="text-4xl font-bold text-primary">{analytics.resolutionRate}%</p>
          <div className="w-full max-w-xs">
            <Progress value={analytics.resolutionRate} className="h-3" />
          </div>
          <p className="text-xs text-muted-foreground">
            des discussions ont été résolues
          </p>
        </div>
      </Card>

      {/* Volume by week */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Évolution du volume</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={analytics.volumeByWeek} margin={{ left: 0, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 9 }}
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }}
            />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Area
              type="monotone"
              dataKey="count"
              stroke={COLORS.info}
              fill={COLORS.info}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
