import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface PipelineConversionChartProps {
  acquisition: {
    leadsMonth: number;
    demosScheduled: number;
    testAccounts: number;
    converted: number;
  };
  demosCompleted: number;
  loading?: boolean;
}

export function PipelineConversionChart({
  acquisition,
  demosCompleted,
  loading,
}: PipelineConversionChartProps) {
  const data = [
    { stage: "Leads", count: acquisition.leadsMonth, fill: "#d9ddf1" },
    { stage: "Demos", count: acquisition.demosScheduled + demosCompleted, fill: "#cfd6f7" },
    { stage: "Tests", count: acquisition.testAccounts, fill: "#b7b2ff" },
    { stage: "Convertis", count: acquisition.converted, fill: "#37ba5f" },
  ];

  return (
    <Card className="rounded-[30px] border border-[#e8eaf4] bg-white shadow-[0_10px_30px_rgba(112,122,163,0.05)]">
      <CardHeader className="px-10 pb-2 pt-9">
        <TooltipProvider delayDuration={150}>
          <UITooltip>
            <TooltipTrigger asChild>
              <CardTitle className="flex items-center gap-2 text-[22px] font-semibold text-[#1f2538]">
                Pipeline conversion
                <Info className="h-5 w-5 text-[#a0a8c0]" />
              </CardTitle>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[260px]">
              <p>Progression du pipeline commercial du lead jusqu'au compte converti.</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="px-10 pb-8 pt-0">
        {loading ? (
          <Skeleton className="h-[250px] w-full rounded-[24px]" />
        ) : (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 18, right: 24, bottom: 10, left: 0 }}>
                <XAxis
                  type="number"
                  tick={{ fill: "#97a0bc", fontSize: 13 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="stage"
                  width={95}
                  tick={{ fill: "#97a0bc", fontSize: 14 }}
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
                <Bar dataKey="count" barSize={36} radius={[0, 10, 10, 0]}>
                  {data.map((entry) => (
                    <Cell key={entry.stage} fill={entry.fill} />
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
