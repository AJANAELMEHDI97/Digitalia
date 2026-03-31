import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Linkedin, Instagram, Facebook, Building2, ArrowRight, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

interface SubscribersDonutProps {
  title: string;
  centerValue: number;
  centerLabel: string;
  showPlatformList?: boolean;
}

// Répartition des abonnés du cabinet par plateforme
const PLATFORM_DATA = [
  { name: "LinkedIn", value: 847, percent: 35, color: "#0A66C2", bgColor: "bg-[#0A66C2]/10", icon: Linkedin },
  { name: "Facebook", value: 678, percent: 28, color: "#1877F2", bgColor: "bg-[#1877F2]/10", icon: Facebook },
  { name: "Instagram", value: 460, percent: 19, color: "#E4405F", bgColor: "bg-[#E4405F]/10", icon: Instagram },
  { name: "X", value: 436, percent: 18, color: "#000000", bgColor: "bg-foreground/10", icon: null },
];

// Données d'évolution sur 8 semaines
const EVOLUTION_DATA = [
  { week: "S1", total: 2180 },
  { week: "S2", total: 2210 },
  { week: "S3", total: 2245 },
  { week: "S4", total: 2290 },
  { week: "S5", total: 2320 },
  { week: "S6", total: 2365 },
  { week: "S7", total: 2398 },
  { week: "S8", total: 2421 },
];

export function SubscribersDonut({ 
  title, 
  centerValue, 
  centerLabel,
  showPlatformList = true 
}: SubscribersDonutProps) {
  const growthPercent = ((EVOLUTION_DATA[EVOLUTION_DATA.length - 1].total - EVOLUTION_DATA[0].total) / EVOLUTION_DATA[0].total * 100).toFixed(1);

  return (
    <Link to="/metrics" className="block">
      <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-white/20 dark:border-white/10 transition-all duration-200 hover:shadow-md cursor-pointer group">
        <CardHeader className="pb-1 pt-3 px-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                <Users className="h-3.5 w-3.5 text-primary" />
              </div>
              <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded-full">
                <TrendingUp className="w-2.5 h-2.5" />
                <span className="text-[9px] font-medium">+{growthPercent}%</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground pl-8">Audience fidèle de votre cabinet</p>
        </CardHeader>
        <CardContent className="pb-3 px-4 pt-2">
          {/* Mini chart */}
          <div className="h-16 mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={EVOLUTION_DATA}>
                <defs>
                  <linearGradient id="subscribersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} abonnés`, '']}
                  labelFormatter={(label) => {
                    const weekData = EVOLUTION_DATA.find(d => d.week === label);
                    return weekData ? `Semaine ${weekData.week.replace('S', '')}` : String(label);
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fill="url(#subscribersGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {showPlatformList && (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-3 top-1 bottom-2 w-0.5 bg-gradient-to-b from-primary/60 via-primary/30 to-transparent" />
              
              <div className="space-y-2">
                {PLATFORM_DATA.map((platform, index) => {
                  const isFirst = index === 0;
                  
                  return (
                    <div 
                      key={platform.name} 
                      className="flex gap-3 items-center relative group/item"
                    >
                      {/* Timeline node */}
                      <div 
                        className={`
                          relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                          ${platform.bgColor}
                          ring-2 ring-background
                          transition-all duration-200
                          group-hover/item:scale-110 group-hover/item:shadow-md
                          ${isFirst ? "animate-pulse" : ""}
                        `}
                        style={{ color: platform.color }}
                      >
                        {platform.icon ? (
                          <platform.icon className="w-3 h-3" />
                        ) : (
                          <span className="text-[10px] font-bold">𝕏</span>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{platform.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {platform.value.toLocaleString()}
                          </span>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${platform.percent}%`,
                                backgroundColor: platform.color 
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-medium text-muted-foreground w-6 text-right">
                            {platform.percent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Total */}
          <div className="mt-2 pt-2 border-t border-border/30 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-primary">{centerValue.toLocaleString()}</span>
              <span className="text-[10px] text-muted-foreground">{centerLabel}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
