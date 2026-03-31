import { useState, useEffect, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EngagementRotatingCardProps {
  likes: number;
  comments: number;
  shares: number;
  loading?: boolean;
}

const metrics = [
  { key: "likes", icon: Heart, label: "Mentions J'aime", color: "text-rose-500" },
  { key: "comments", icon: MessageCircle, label: "Commentaires", color: "text-sky-500" },
  { key: "shares", icon: Share2, label: "Recommandations", color: "text-emerald-500" },
] as const;

export const EngagementRotatingCard = memo(function EngagementRotatingCard({
  likes,
  comments,
  shares,
  loading,
}: EngagementRotatingCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % metrics.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const values = { likes, comments, shares };
  const currentMetric = metrics[currentIndex];
  const Icon = currentMetric.icon;
  const value = values[currentMetric.key];

  return (
    <div className="w-full">
      <Card className="bg-card border transition-all duration-150 hover:shadow-md w-full">
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="flex items-center gap-1.5 transition-opacity duration-150">
              <Icon className={cn("h-3 w-3", currentMetric.color)} />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {currentMetric.label}
              </span>
            </div>
          </div>

          {loading ? (
            <Skeleton className="h-6 w-14" />
          ) : (
            <div className="flex items-baseline gap-2 transition-opacity duration-150">
              <span className="text-xl font-bold tracking-tight tabular-nums">
                {value.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1 mt-1.5">
            {metrics.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1 rounded-full transition-all duration-150",
                  index === currentIndex
                    ? "w-3 bg-primary"
                    : "w-1 bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
