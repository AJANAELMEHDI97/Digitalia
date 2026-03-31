import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface OperationalActivityChartProps {
  publications30d: number;
  refusalRate: number;
  avgValidationTimeHours: number;
  loading?: boolean;
}

export function OperationalActivityChart({
  publications30d,
  refusalRate,
  avgValidationTimeHours,
  loading,
}: OperationalActivityChartProps) {
  const refused = Math.round((publications30d * refusalRate) / 100);
  const validated = Math.max(publications30d - refused, 0);

  const data = [
    { label: "Publies", value: validated, fill: "#5442d3" },
    { label: "Refuses", value: refused, fill: "#ff473d" },
    { label: "Delai moy. (h)", value: avgValidationTimeHours, fill: "#d9ddf1" },
  ];

  return (
    <Card className="rounded-[30px] border border-[#e8eaf4] bg-white shadow-[0_10px_30px_rgba(112,122,163,0.05)]">
      <CardHeader className="px-10 pb-2 pt-9">
        <TooltipProvider delayDuration={150}>
          <UITooltip>
            <TooltipTrigger asChild>
              <CardTitle className="flex items-center gap-2 text-[22px] font-semibold text-[#1f2538]">
                Activite operationnelle (30j)
                <Info className="h-5 w-5 text-[#a0a8c0]" />
              </CardTitle>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[260px]">
              <p>Volume publie, refuse et delai moyen de validation sur les 30 derniers jours.</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="px-10 pb-8 pt-2">
        {loading ? (
          <Skeleton className="h-[250px] w-full rounded-[24px]" />
        ) : (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#97a0bc", fontSize: 13 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#97a0bc", fontSize: 13 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f6f7fc" }}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e8eaf4",
                    borderRadius: 16,
                    boxShadow: "0 12px 30px rgba(112,122,163,0.12)",
                  }}
                />
                <Bar dataKey="value" barSize={54} radius={[8, 8, 0, 0]}>
                  {data.map((entry) => (
                    <Cell key={entry.label} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
