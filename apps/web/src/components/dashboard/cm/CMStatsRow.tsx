import { Building2, FileText, Clock, CalendarCheck, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CMStatsRowProps {
  totalFirms: number;
  totalPending: number;
  totalDrafts: number;
  totalScheduled: number;
  loading?: boolean;
}

interface StatItemProps {
  icon: React.ElementType;
  value: number;
  label: string;
  loading?: boolean;
  highlight?: boolean;
}

function StatItem({ icon: Icon, value, label, loading, highlight }: StatItemProps) {
  return (
    <Card className={`${highlight ? 'border-primary/30 bg-primary/5' : ''}`}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${highlight ? 'bg-primary/10' : 'bg-muted'}`}>
          <Icon className={`h-4 w-4 ${highlight ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <div>
          {loading ? (
            <Skeleton className="h-6 w-12" />
          ) : (
            <p className="text-2xl font-bold">{value}</p>
          )}
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function CMStatsRow({ 
  totalFirms, 
  totalPending, 
  totalDrafts, 
  totalScheduled,
  loading 
}: CMStatsRowProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatItem
        icon={Building2}
        value={totalFirms}
        label="Cabinets gérés"
        loading={loading}
      />
      <StatItem
        icon={Clock}
        value={totalPending}
        label="À valider"
        loading={loading}
        highlight={totalPending > 0}
      />
      <StatItem
        icon={FileText}
        value={totalDrafts}
        label="Brouillons"
        loading={loading}
      />
      <StatItem
        icon={CalendarCheck}
        value={totalScheduled}
        label="Programmées"
        loading={loading}
      />
    </div>
  );
}
