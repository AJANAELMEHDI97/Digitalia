import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Heart, TrendingUp, Users, MapPin, Calendar, Clock } from "lucide-react";
import { globalAudienceStats } from "@/data/mockMetrics";

export function GlobalStats() {
  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Eye}
          label="Portée totale"
          value={globalAudienceStats.totalReach.toLocaleString("fr-FR")}
          description="Personnes touchées"
        />
        <StatCard
          icon={Heart}
          label="Engagements"
          value={globalAudienceStats.totalEngagements.toString()}
          description="Interactions totales"
        />
        <StatCard
          icon={TrendingUp}
          label="Taux moyen"
          value={`${globalAudienceStats.avgEngagementRate}%`}
          description="Engagement moyen"
        />
      </div>

      {/* Insights Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Ce que vos données révèlent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InsightItem
              icon={Users}
              label="Audience principale"
              value={globalAudienceStats.topAgeRange + " ans"}
            />
            <InsightItem
              icon={MapPin}
              label="Zone géographique"
              value={globalAudienceStats.topLocation}
            />
            <InsightItem
              icon={Calendar}
              label="Meilleur jour"
              value={globalAudienceStats.bestDay}
            />
            <InsightItem
              icon={Clock}
              label="Meilleure heure"
              value={globalAudienceStats.bestHour}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-4 p-3 rounded-lg bg-muted/50">
            💡 Vos contenus performent le mieux le <strong>{globalAudienceStats.bestDay}</strong> vers{" "}
            <strong>{globalAudienceStats.bestHour}</strong>, auprès des <strong>{globalAudienceStats.topAgeRange} ans</strong>{" "}
            en <strong>{globalAudienceStats.topLocation}</strong>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function InsightItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-sm">{value}</p>
      </div>
    </div>
  );
}
