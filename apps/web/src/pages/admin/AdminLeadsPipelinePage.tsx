import { AppLayout } from "@/components/layout/AppLayout";
import { BusinessKPICard } from "@/components/admin/business/BusinessKPICard";
import { useAdminLeads, Lead } from "@/hooks/admin/useAdminLeads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, CalendarCheck, Target, Clock, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Nouveau", variant: "outline" },
  demo_scheduled: { label: "Démo planifiée", variant: "secondary" },
  demo_done: { label: "Démo réalisée", variant: "default" },
  converted: { label: "Converti", variant: "default" },
  lost: { label: "Perdu", variant: "destructive" },
};

export default function AdminLeadsPipelinePage() {
  const { leads, pipeline, totalLeads, leadsThisMonth, demosScheduled, conversionRate, avgResponseDays, loading } = useAdminLeads();

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Leads & Démos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pipeline commercial, suivi des leads et taux de conversion
          </p>
        </div>

        {/* KPIs */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <BusinessKPICard label="Total leads" value={String(totalLeads)} icon={Filter} />
            <BusinessKPICard label="Ce mois" value={String(leadsThisMonth)} icon={TrendingUp} variationPositive />
            <BusinessKPICard label="Démos planifiées" value={String(demosScheduled)} icon={CalendarCheck} />
            <BusinessKPICard label="Taux conversion" value={`${conversionRate}%`} icon={Target} variationPositive={conversionRate > 20} />
            <BusinessKPICard label="Délai moyen" value={`${avgResponseDays}j`} icon={Clock} />
          </div>
        )}

        {/* Pipeline visuel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pipeline commercial</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-16 w-full rounded" />
            ) : (
              <>
                {/* Funnel bar */}
                <div className="flex items-stretch gap-1 h-14 rounded-lg overflow-hidden mb-4">
                  {pipeline.filter(s => s.count > 0).map((stage) => {
                    const total = pipeline.reduce((s, p) => s + p.count, 0);
                    const pct = total > 0 ? Math.max((stage.count / total) * 100, 8) : 20;
                    return (
                      <div
                        key={stage.label}
                        className="flex flex-col items-center justify-center text-white text-xs font-medium transition-all"
                        style={{ width: `${pct}%`, backgroundColor: stage.color, minWidth: 60 }}
                      >
                        <span className="font-bold text-sm">{stage.count}</span>
                        <span className="opacity-90 text-[10px] leading-tight">{stage.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Bar chart */}
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pipeline} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis type="category" dataKey="label" width={110} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <Tooltip formatter={(v: number) => [v, "Leads"]} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {pipeline.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Leads table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Liste des leads</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Lead</th>
                      <th className="pb-3 pr-4 font-medium">Source</th>
                      <th className="pb-3 pr-4 font-medium">Responsable</th>
                      <th className="pb-3 pr-4 font-medium">Date démo</th>
                      <th className="pb-3 pr-4 font-medium">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => {
                      const st = STATUS_MAP[lead.status] || { label: lead.status, variant: "outline" as const };
                      return (
                        <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                          <td className="py-3 pr-4">
                            <div className="font-medium">{lead.full_name}</div>
                            <div className="text-xs text-muted-foreground">{lead.specialty}</div>
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">{lead.source}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{lead.responsible}</td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            {format(new Date(lead.preferred_date), "d MMM yyyy", { locale: fr })}
                            <span className="ml-1 text-xs">{lead.preferred_time}</span>
                          </td>
                          <td className="py-3">
                            <Badge
                              variant={st.variant}
                              className={lead.status === "converted" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : ""}
                            >
                              {st.label}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
