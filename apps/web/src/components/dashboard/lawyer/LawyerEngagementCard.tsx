import { Heart, MessageCircle, Share2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LawyerEngagementCardProps {
  totalInteractions: number;
  comments: number;
  likes: number;
  shares: number;
  topTopic?: string;
  loading?: boolean;
}

export function LawyerEngagementCard({
  totalInteractions,
  comments,
  likes,
  shares,
  topTopic = "Actualité en droit du travail",
  loading,
}: LawyerEngagementCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-48" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3 text-base font-medium">
          <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/20">
            <Heart className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
          Réactions et interactions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main metric */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold tracking-tight">
            {totalInteractions.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">interactions</span>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-1.5 text-sm">
            <Heart className="h-3.5 w-3.5 text-rose-500" />
            <span className="font-medium">{likes}</span>
            <span className="text-muted-foreground hidden sm:inline">j'aime</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <MessageCircle className="h-3.5 w-3.5 text-blue-500" />
            <span className="font-medium">{comments}</span>
            <span className="text-muted-foreground hidden sm:inline">commentaires</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Share2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-medium">{shares}</span>
            <span className="text-muted-foreground hidden sm:inline">partages</span>
          </div>
        </div>

        {/* Top topic */}
        {topTopic && (
          <div className="flex items-start gap-2 pt-1 border-t">
            <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Sujet le plus performant</p>
              <p className="text-sm font-medium">{topTopic}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
