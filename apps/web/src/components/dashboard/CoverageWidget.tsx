import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

interface CoverageWidgetProps {
  totalReach: number;
  loading?: boolean;
}

export function CoverageWidget({ totalReach, loading }: CoverageWidgetProps) {
  return (
    <Link to="/metrics" className="block h-full">
      <Card className="bg-card border h-full transition-all duration-200 hover:shadow-md cursor-pointer">
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Couverture
            </span>
          </div>
          
          {loading ? (
            <Skeleton className="h-6 w-20" />
          ) : (
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight tabular-nums">
                {totalReach.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground">
                personnes atteintes
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
