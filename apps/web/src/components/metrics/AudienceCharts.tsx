import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { PublicationMetrics } from "@/data/mockMetrics";

interface AudienceChartsProps {
  publication: PublicationMetrics;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--primary) / 0.75)", "hsl(var(--primary) / 0.55)", "hsl(var(--accent-brand))"];

export function AudienceCharts({ publication }: AudienceChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Age Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Répartition par âge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={publication.audienceAge} layout="vertical">
                <XAxis type="number" tickFormatter={(v) => `${v}%`} fontSize={12} />
                <YAxis type="category" dataKey="range" fontSize={12} width={50} />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, "Part"]}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--popover))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }}
                />
                <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Location Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Répartition géographique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {publication.audienceLocation.map((loc, index) => {
              const maxPct = Math.max(...publication.audienceLocation.map(l => l.percentage));
              return (
                <div key={loc.location} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-muted-foreground">{loc.location}</span>
                    </div>
                    <span className="font-semibold text-sm tabular-nums">{loc.percentage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(loc.percentage / maxPct) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Gender Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Répartition par genre
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {publication.audienceGender.map((g) => (
              <div key={g.gender} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{g.gender}</span>
                  <span className="font-medium">{g.percentage}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${g.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Peak Times */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Moments de forte interaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {publication.peakTimes.map((time, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{time.day}</p>
                  <p className="text-xs text-muted-foreground">Autour de {time.hour}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Ces créneaux correspondent aux pics d'interaction sur cette publication.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
