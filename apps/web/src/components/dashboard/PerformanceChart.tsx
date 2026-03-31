import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Eye, Heart, TrendingUp, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Simulated performance data for the last 7 days
const performanceData = [
  { day: "Lun", reach: 1250, engagement: 89, engagementRate: 7.1 },
  { day: "Mar", reach: 1420, engagement: 112, engagementRate: 7.9 },
  { day: "Mer", reach: 980, engagement: 67, engagementRate: 6.8 },
  { day: "Jeu", reach: 2100, engagement: 178, engagementRate: 8.5 },
  { day: "Ven", reach: 1890, engagement: 156, engagementRate: 8.3 },
  { day: "Sam", reach: 1650, engagement: 134, engagementRate: 8.1 },
  { day: "Dim", reach: 1320, engagement: 98, engagementRate: 7.4 },
];

const totalReach = performanceData.reduce((acc, d) => acc + d.reach, 0);
const totalEngagement = performanceData.reduce((acc, d) => acc + d.engagement, 0);
const avgEngagementRate = (performanceData.reduce((acc, d) => acc + d.engagementRate, 0) / performanceData.length).toFixed(1);

export function PerformanceChart() {
  return (
    <Card className="bg-card border transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/20">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <span>Performances</span>
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
            <Link to="/metrics">
              Voir détails
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
        
        {/* Quick stats - simplified */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Eye className="h-3.5 w-3.5" />
              <span className="text-xs font-medium uppercase tracking-wider">Portée</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold tabular-nums">{(totalReach / 1000).toFixed(1)}K</span>
              <span className="text-xs text-emerald-600 flex items-center font-medium">
                <ArrowUpRight className="h-3 w-3" />
                12%
              </span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Heart className="h-3.5 w-3.5" />
              <span className="text-xs font-medium uppercase tracking-wider">Engage.</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold tabular-nums">{totalEngagement}</span>
              <span className="text-xs text-emerald-600 flex items-center font-medium">
                <ArrowUpRight className="h-3 w-3" />
                8%
              </span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-xs font-medium uppercase tracking-wider">Taux</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold tabular-nums">{avgEngagementRate}%</span>
              <span className="text-xs text-muted-foreground">stable</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.5}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}K` : value}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                formatter={(value: number, name: string) => {
                  if (name === "reach") return [`${value.toLocaleString()} vues`, "Portée"];
                  if (name === "engagement") return [`${value} interactions`, "Engagements"];
                  return [value, name];
                }}
              />
              <Bar 
                dataKey="reach" 
                fill="url(#barGradient)" 
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
