import { AppLayout } from "@/components/layout/AppLayout";
import { useAdminForecast } from "@/hooks/admin/useAdminForecast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Calendar, Target, ArrowUpRight } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend,
  BarChart, Bar,
} from "recharts";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { AdminKPICard } from "@/components/admin/shared/AdminUI";

export default function AdminForecastPage() {
  const { projection30, projection60, projection90, upsellPotential, projectionCurve, churnImpact, loading } = useAdminForecast();

  const fmt = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1).replace(".0", "")}k €` : `${n} €`;

  return (
    <AppLayout>
      <TooltipProvider delayDuration={200}>
        <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Projection revenus</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Simulation de croissance et impact churn estimé
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <AdminKPICard
                label="Projection 30j"
                value={fmt(projection30)}
                icon={Calendar}
                tooltip="Estimation du MRR dans 30 jours basée sur le taux de croissance actuel et le pipeline de leads qualifiés."
              />
              <AdminKPICard
                label="Projection 60j"
                value={fmt(projection60)}
                icon={TrendingUp}
                tooltip="Projection à 60 jours intégrant les tendances d'acquisition et le taux de churn observé. Plus incertain que la projection à 30 jours."
              />
              <AdminKPICard
                label="Projection 90j"
                value={fmt(projection90)}
                icon={Target}
                tooltip="Vision à 90 jours du MRR. Utile pour le planning stratégique et les objectifs trimestriels. Fiabilité modérée."
              />
              <AdminKPICard
                label="Potentiel upsell"
                value={fmt(upsellPotential)}
                icon={ArrowUpRight}
                positive
                sub="MRR additionnel possible"
                tooltip="Revenu additionnel estimé si les cabinets éligibles montent en gamme de pack. Cible prioritaire pour l'équipe commerciale."
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CardTitle className="text-base cursor-help">Courbe de projection (90 jours)</CardTitle>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Trois scénarios de projection MRR : optimiste (forte acquisition), base (tendance actuelle) et pessimiste (churn accru). Permet de cadrer les objectifs réalistes.</p>
                  </TooltipContent>
                </Tooltip>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={projectionCurve}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `J${v}`} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <RTooltip formatter={(v: number) => [`${v.toLocaleString()} €`]} />
                      <Legend />
                      <Line type="monotone" dataKey="optimiste" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={false} name="Optimiste" />
                      <Line type="monotone" dataKey="base" stroke="hsl(210, 80%, 55%)" strokeWidth={2} dot={false} name="Base" />
                      <Line type="monotone" dataKey="pessimiste" stroke="hsl(0, 84%, 60%)" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Pessimiste" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CardTitle className="text-base cursor-help">Impact churn estimé</CardTitle>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Perte de revenus projetée sur 90 jours si le taux de churn actuel se maintient sans intervention. Un plan de rétention ciblé peut réduire cet impact de 50 à 70%.</p>
                  </TooltipContent>
                </Tooltip>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-56 gap-4">
                <div className="text-4xl font-bold text-destructive">-{fmt(churnImpact)}</div>
                <p className="text-sm text-muted-foreground text-center">
                  Perte potentielle sur 90 jours si le taux de churn actuel se maintient
                </p>
                <div className="w-full">
                  <ResponsiveContainer width="100%" height={60}>
                    <BarChart data={[{ label: "Perte", value: churnImpact }]}>
                      <Bar dataKey="value" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}