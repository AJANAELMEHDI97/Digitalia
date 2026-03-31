import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

const data = [
  { day: "06", facebook: 35.5, linkedin: 55.5, x: 40.0, instagram: 45.0, total: 70 },
  { day: "05", facebook: 73.0, linkedin: 40.0, x: 30.0, instagram: 70.0, total: 95 },
  { day: "04", facebook: 15.0, linkedin: 35.0, x: 75.0, instagram: 15.0, total: 65 },
  { day: "03", facebook: 65.5, linkedin: 50.0, x: 40.0, instagram: 40.0, total: 75 },
  { day: "02", facebook: 40.0, linkedin: 25.0, x: 65.0, instagram: 70.0, total: 97 },
  { day: "01", facebook: 50.0, linkedin: 45.0, x: 50.0, instagram: 55.5, total: 85 },
];

const COLORS = {
  facebook: "#8B5CF6",
  linkedin: "#A78BFA",
  x: "#C4B5FD",
  instagram: "#EC4899",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-2">Jour {label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.fill }}
            />
            <span className="capitalize">{entry.dataKey}:</span>
            <span className="font-medium">{entry.value}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function ClickRateChart() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Taux de clics</CardTitle>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
              <span className="text-muted-foreground">Facebook</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#A78BFA]" />
              <span className="text-muted-foreground">Linkedin</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#C4B5FD]" />
              <span className="text-muted-foreground">X</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#EC4899]" />
              <span className="text-muted-foreground">Instagram</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <span>↑ Jour</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 60, left: 20, bottom: 5 }}
            barCategoryGap="20%"
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="day"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              width={25}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="facebook" stackId="a" fill={COLORS.facebook} radius={[4, 0, 0, 4]}>
              <LabelList
                dataKey="facebook"
                position="center"
                fill="white"
                fontSize={10}
                formatter={(value: number) => value.toFixed(1)}
              />
            </Bar>
            <Bar dataKey="linkedin" stackId="a" fill={COLORS.linkedin}>
              <LabelList
                dataKey="linkedin"
                position="center"
                fill="white"
                fontSize={10}
                formatter={(value: number) => value.toFixed(1)}
              />
            </Bar>
            <Bar dataKey="x" stackId="a" fill={COLORS.x}>
              <LabelList
                dataKey="x"
                position="center"
                fill="hsl(var(--foreground))"
                fontSize={10}
                formatter={(value: number) => value.toFixed(1)}
              />
            </Bar>
            <Bar dataKey="instagram" stackId="a" fill={COLORS.instagram} radius={[0, 4, 4, 0]}>
              <LabelList
                dataKey="instagram"
                position="center"
                fill="white"
                fontSize={10}
                formatter={(value: number) => value.toFixed(1)}
              />
              <LabelList
                dataKey="total"
                position="right"
                offset={15}
                fill="hsl(var(--foreground))"
                fontSize={12}
                fontWeight="600"
                formatter={(value: number) => `${value}%`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
