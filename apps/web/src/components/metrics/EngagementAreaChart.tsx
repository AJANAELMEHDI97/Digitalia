import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Users, ChevronDown } from "lucide-react";

const data = [
  { day: "01", facebook: 1200, linkedin: 1400, x: 1100, instagram: 1300 },
  { day: "02", facebook: 1400, linkedin: 1300, x: 1200, instagram: 1500 },
  { day: "03", facebook: 1600, linkedin: 1500, x: 1400, instagram: 1800 },
  { day: "04", facebook: 2200, linkedin: 2000, x: 1800, instagram: 2400 },
  { day: "05", facebook: 2800, linkedin: 2500, x: 2200, instagram: 3100 },
  { day: "07", facebook: 2600, linkedin: 2300, x: 2000, instagram: 2800 },
  { day: "08", facebook: 2400, linkedin: 2100, x: 1900, instagram: 2600 },
  { day: "09", facebook: 2200, linkedin: 1900, x: 1700, instagram: 2400 },
  { day: "10", facebook: 2000, linkedin: 1800, x: 1600, instagram: 2200 },
  { day: "11", facebook: 1800, linkedin: 1600, x: 1500, instagram: 2000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-2">Jour {label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.stroke }}
            />
            <span className="capitalize">{entry.dataKey}:</span>
            <span className="font-medium">{entry.value.toLocaleString("fr-FR")}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function EngagementAreaChart() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Engagements</CardTitle>
          <div className="flex items-center gap-4">
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
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <Users className="h-3 w-3" />
              Audience
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <span>Vues</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="gradientFacebook" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientLinkedin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#A78BFA" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientX" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C4B5FD" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#C4B5FD" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientInstagram" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EC4899" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#EC4899" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => value.toLocaleString("fr-FR")}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="instagram"
              stroke="#EC4899"
              strokeWidth={2}
              fill="url(#gradientInstagram)"
            />
            <Area
              type="monotone"
              dataKey="facebook"
              stroke="#8B5CF6"
              strokeWidth={2}
              fill="url(#gradientFacebook)"
            />
            <Area
              type="monotone"
              dataKey="linkedin"
              stroke="#A78BFA"
              strokeWidth={2}
              fill="url(#gradientLinkedin)"
            />
            <Area
              type="monotone"
              dataKey="x"
              stroke="#C4B5FD"
              strokeWidth={2}
              fill="url(#gradientX)"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex justify-end text-xs text-muted-foreground mt-1">
          <span>Jours</span>
        </div>
      </CardContent>
    </Card>
  );
}
