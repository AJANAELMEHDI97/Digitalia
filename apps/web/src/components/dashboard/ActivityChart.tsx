import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, TrendingUp } from "lucide-react";
import { Publication } from "@/hooks/usePublications";
import { format, subDays, startOfDay, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface ActivityChartProps {
  publications: Publication[];
}

// Données fictives pour simuler l'activité des 14 derniers jours
const MOCK_PAST_ACTIVITY = [
  { programme: 2, a_valider: 0, brouillon: 0 },
  { programme: 1, a_valider: 1, brouillon: 0 },
  { programme: 0, a_valider: 0, brouillon: 1 },
  { programme: 3, a_valider: 0, brouillon: 0 },
  { programme: 1, a_valider: 0, brouillon: 0 },
  { programme: 0, a_valider: 0, brouillon: 0 },
  { programme: 0, a_valider: 0, brouillon: 0 },
  { programme: 2, a_valider: 1, brouillon: 0 },
  { programme: 1, a_valider: 0, brouillon: 1 },
  { programme: 2, a_valider: 0, brouillon: 0 },
  { programme: 1, a_valider: 1, brouillon: 0 },
  { programme: 3, a_valider: 0, brouillon: 0 },
  { programme: 0, a_valider: 2, brouillon: 1 },
  { programme: 0, a_valider: 3, brouillon: 0 },
];

export function ActivityChart({ publications }: ActivityChartProps) {
  const chartData = useMemo(() => {
    const today = startOfDay(new Date());
    const days = 14;
    
    return Array.from({ length: days }, (_, i) => {
      const date = subDays(today, days - 1 - i);
      const mockData = MOCK_PAST_ACTIVITY[i] || { programme: 0, a_valider: 0, brouillon: 0 };
      
      const dayPublications = publications.filter(p => {
        const pubDate = startOfDay(parseISO(p.scheduled_date));
        return pubDate.getTime() === date.getTime();
      });

      const realData = {
        programme: dayPublications.filter(p => p.status === "programme").length,
        a_valider: dayPublications.filter(p => p.status === "a_valider").length,
        brouillon: dayPublications.filter(p => p.status === "brouillon").length,
      };

      const isFuture = date > today;
      const data = isFuture ? realData : {
        programme: mockData.programme + realData.programme,
        a_valider: mockData.a_valider + realData.a_valider,
        brouillon: mockData.brouillon + realData.brouillon,
      };

      return {
        date: format(date, "dd/MM", { locale: fr }),
        day: format(date, "EEE", { locale: fr }),
        total: data.programme + data.a_valider + data.brouillon,
        programme: data.programme,
        a_valider: data.a_valider,
        brouillon: data.brouillon,
      };
    });
  }, [publications]);

  const totalActivity = chartData.reduce((acc, d) => acc + d.total, 0);
  const avgActivity = (totalActivity / chartData.length).toFixed(1);

  return (
    <Card className="bg-card border col-span-full transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold">
              <div className="p-2 rounded-xl bg-primary/10">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <span>Activité éditoriale</span>
            </CardTitle>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Programmées</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-xs text-muted-foreground">À valider</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-400" />
              <span className="text-xs text-muted-foreground">Brouillons</span>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-8 mt-4">
          <div>
            <span className="text-4xl font-bold tracking-tight tabular-nums">{totalActivity}</span>
            <span className="text-sm text-muted-foreground ml-2">publications (14j)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">Moy. {avgActivity}/jour</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProgramme" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAValider" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBrouillon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
              />
              <Area 
                type="monotone" 
                dataKey="programme" 
                stackId="1"
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fill="url(#colorProgramme)" 
                name="Programmées"
              />
              <Area 
                type="monotone" 
                dataKey="a_valider" 
                stackId="1"
                stroke="#f59e0b" 
                strokeWidth={2}
                fill="url(#colorAValider)" 
                name="À valider"
              />
              <Area 
                type="monotone" 
                dataKey="brouillon" 
                stackId="1"
                stroke="#94a3b8" 
                strokeWidth={2}
                fill="url(#colorBrouillon)" 
                name="Brouillons"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Interpretation sentence */}
        <p className="text-xs text-muted-foreground italic mt-4 pt-3 border-t border-border/50">
          L'intérêt suscité progresse de manière régulière, ce qui traduit une réception stable et professionnelle de vos prises de parole.
        </p>
      </CardContent>
    </Card>
  );
}
