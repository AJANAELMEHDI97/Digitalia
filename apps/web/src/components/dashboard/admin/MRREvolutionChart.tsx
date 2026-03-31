import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MRREvolutionChartProps {
  mrr: number;
  mrrVariation: number;
  loading?: boolean;
}

function generateMRRHistory(currentMRR: number, variation: number) {
  const months = ["Sept", "Oct", "Nov", "Dec", "Jan", "Fev"];

  if (variation === 0) {
    return months.map((month) => ({ month, mrr: currentMRR }));
  }

  const profile = [0.86, 0.88, 0.91, 0.94, 0.97, 1];
  return months.map((month, index) => ({
    month,
    mrr: Math.round(currentMRR * profile[index]),
  }));
}

export function MRREvolutionChart({ mrr, mrrVariation, loading }: MRREvolutionChartProps) {
  const data = generateMRRHistory(mrr, mrrVariation);

  return (
    <Card className="rounded-[30px] border border-[#e8eaf4] bg-white shadow-[0_10px_30px_rgba(112,122,163,0.05)]">
      <CardHeader className="flex flex-row items-start justify-between px-10 pb-2 pt-9">
        <TooltipProvider delayDuration={150}>
          <UITooltip>
            <TooltipTrigger asChild>
              <CardTitle className="flex items-center gap-2 text-[22px] font-semibold text-[#1f2538]">
                Evolution MRR
                <Info className="h-5 w-5 text-[#a0a8c0]" />
              </CardTitle>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[260px]">
              <p>Evolution du revenu mensuel recurrent sur les six derniers mois.</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>

        <span className="pt-2 text-[16px] font-semibold text-[#0e9f75]">
          {mrrVariation >= 0 ? "+" : ""}
          {mrrVariation}% vs M-1
        </span>
      </CardHeader>

      <CardContent className="px-8 pb-7 pt-0">
        {loading ? (
          <Skeleton className="h-[280px] w-full rounded-[24px]" />
        ) : (
          <div className="h-[290px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: 4 }}>
                <defs>
                  <linearGradient id="adminMrrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5140d6" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#5140d6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={true} stroke="#eceef8" strokeDasharray="4 4" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#97a0bc", fontSize: 13 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#97a0bc", fontSize: 13 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e8eaf4",
                    borderRadius: 16,
                    boxShadow: "0 12px 30px rgba(112,122,163,0.12)",
                  }}
                  formatter={(value: number) => [`${value.toLocaleString("fr-FR")} €`, "MRR"]}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="#5140d6"
                  fill="url(#adminMrrGradient)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5, fill: "#5140d6", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
