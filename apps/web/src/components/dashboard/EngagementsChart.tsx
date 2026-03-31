import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Publication } from "@/hooks/usePublications";
import { format, subDays, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";
import { TrendingUp, Heart, MessageCircle, Share2, Sparkles } from "lucide-react";

interface EngagementsChartProps {
  publications: Publication[];
}

// Données simulées pour les engagements totaux agrégés
const MOCK_TOTAL_ENGAGEMENTS = [
  3250, 3580, 3650, 4020, 4800, 4950, 5700, 5490, 6400, 7030, 7250
];

// Métriques d'engagement actuelles
const ENGAGEMENT_METRICS = [
  { key: "likes", label: "Mentions J'aime", value: 1847, icon: Heart, color: "text-rose-500" },
  { key: "comments", label: "Commentaires", value: 234, icon: MessageCircle, color: "text-blue-500" },
  { key: "shares", label: "Recommandations", value: 156, icon: Share2, color: "text-emerald-500" },
];

export function EngagementsChart({ publications }: EngagementsChartProps) {
  const chartData = useMemo(() => {
    const today = startOfDay(new Date());
    const days = 11;
    
    return Array.from({ length: days }, (_, i) => {
      const date = subDays(today, days - 1 - i);
      const total = MOCK_TOTAL_ENGAGEMENTS[i] || 0;
      
      return {
        date: format(date, "dd", { locale: fr }),
        fullDate: format(date, "d MMM", { locale: fr }),
        total,
      };
    });
  }, []);

  // Calculate growth percentage
  const growthPercent = useMemo(() => {
    const firstValue = chartData[0]?.total || 1;
    const lastValue = chartData[chartData.length - 1]?.total || 0;
    return Math.round(((lastValue - firstValue) / firstValue) * 100);
  }, [chartData]);

  const totalEngagements = ENGAGEMENT_METRICS.reduce((acc, m) => acc + m.value, 0);

  return (
    <Link to="/metrics" className="col-span-2 block h-full">
      <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-white/20 dark:border-white/10 transition-all duration-200 hover:shadow-md cursor-pointer group h-full flex flex-col overflow-hidden">
        <CardHeader className="pb-1 pt-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
              <CardTitle className="text-sm font-semibold text-foreground">Intérêt suscité</CardTitle>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span className="text-[10px] font-semibold">+{growthPercent}%</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-3 px-4 flex-1 flex flex-col">
          <p className="text-[10px] text-muted-foreground mb-2">Réactions de vos prospects et justiciables</p>
          
          {/* Chart */}
          <div className="h-[100px] mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 8000]}
                  ticks={[2000, 4000, 6000]}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                  formatter={(value: number) => [`${value.toLocaleString('fr-FR')} interactions`, '']}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.fullDate;
                    }
                    return label;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorEngagement)" 
                  name="Total"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* Engagement metrics timeline */}
          <div className="relative pl-4 space-y-2 flex-1">
            {/* Timeline line */}
            <div className="absolute left-[5px] top-1 bottom-1 w-[2px] bg-gradient-to-b from-primary/60 via-primary/30 to-transparent rounded-full" />
            
            {ENGAGEMENT_METRICS.map((metric, index) => {
              const Icon = metric.icon;
              const percentage = Math.round((metric.value / totalEngagements) * 100);
              
              return (
                <div key={metric.key} className="relative flex items-center gap-2">
                  {/* Timeline node */}
                  <div className={`absolute -left-4 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center ${index === 0 ? 'bg-primary animate-pulse' : 'bg-primary/60'}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 flex items-center gap-2 py-1">
                    <div className={`p-1 rounded-md bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-800/40 shadow-sm`}>
                      <Icon className={`h-3 w-3 ${metric.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground truncate">{metric.label}</span>
                        <span className="text-xs font-semibold text-foreground">{metric.value.toLocaleString('fr-FR')}</span>
                      </div>
                      {/* Progress bar */}
                      <div className="h-1 bg-muted/30 rounded-full mt-0.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            metric.key === 'likes' ? 'bg-rose-500/70' :
                            metric.key === 'comments' ? 'bg-blue-500/70' : 'bg-emerald-500/70'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Total */}
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/40">
            <span className="text-xs text-muted-foreground">Total</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-primary">{totalEngagements.toLocaleString('fr-FR')}</span>
              <span className="text-[10px] text-muted-foreground">interactions</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
