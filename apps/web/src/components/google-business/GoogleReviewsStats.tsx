import { Star, Clock, TrendingUp, MessageSquare, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import type { GoogleReview } from "@/hooks/useGoogleBusiness";
import { differenceInHours, differenceInDays, format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";

interface GoogleReviewsStatsProps {
  reviews: GoogleReview[];
}

export function GoogleReviewsStats({ reviews }: GoogleReviewsStatsProps) {
  // Calculate average rating
  const validRatings = reviews.filter(r => r.star_rating !== null);
  const averageRating = validRatings.length > 0 
    ? validRatings.reduce((sum, r) => sum + (r.star_rating || 0), 0) / validRatings.length 
    : 0;

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.star_rating === rating).length,
    label: `${rating} étoile${rating > 1 ? 's' : ''}`
  }));

  // Calculate response stats
  const reviewsWithReply = reviews.filter(r => r.review_reply);
  const responseRate = reviews.length > 0 
    ? Math.round((reviewsWithReply.length / reviews.length) * 100) 
    : 0;

  // Calculate average response time (in hours)
  const responseTimes = reviewsWithReply
    .filter(r => r.create_time && r.reply_updated_at)
    .map(r => {
      const created = new Date(r.create_time!);
      const replied = new Date(r.reply_updated_at!);
      return differenceInHours(replied, created);
    });
  
  const averageResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
    : 0;

  // Format response time for display
  const formatResponseTime = (hours: number) => {
    if (hours < 1) return "< 1h";
    if (hours < 24) return `${Math.round(hours)}h`;
    const days = Math.round(hours / 24);
    return `${days}j`;
  };

  // Calculate rating evolution over last 6 months
  const ratingEvolution = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(new Date(), i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    
    const monthReviews = reviews.filter(r => {
      if (!r.create_time) return false;
      const reviewDate = new Date(r.create_time);
      return isWithinInterval(reviewDate, { start: monthStart, end: monthEnd });
    });

    const monthAvg = monthReviews.length > 0
      ? monthReviews.reduce((sum, r) => sum + (r.star_rating || 0), 0) / monthReviews.length
      : null;

    ratingEvolution.push({
      month: format(monthDate, 'MMM', { locale: fr }),
      rating: monthAvg ? Math.round(monthAvg * 10) / 10 : null,
      count: monthReviews.length
    });
  }

  // Colors for star ratings
  const ratingColors: Record<number, string> = {
    5: 'hsl(142, 76%, 36%)',
    4: 'hsl(142, 60%, 50%)',
    3: 'hsl(45, 93%, 47%)',
    2: 'hsl(25, 95%, 53%)',
    1: 'hsl(0, 84%, 60%)'
  };

  const pendingCount = reviews.filter(r => !r.review_reply).length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-100">
                <Star className="h-5 w-5 text-yellow-600 fill-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Note moyenne</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reviews.length}</p>
                <p className="text-sm text-muted-foreground">Total avis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{responseRate}%</p>
                <p className="text-sm text-muted-foreground">Taux de réponse</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatResponseTime(averageResponseTime)}</p>
                <p className="text-sm text-muted-foreground">Temps réponse moy.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-5 w-5" />
              Répartition par note
            </CardTitle>
            <CardDescription>
              Distribution des avis par nombre d'étoiles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ratingDistribution.map((item) => {
                const percentage = reviews.length > 0 
                  ? Math.round((item.count / reviews.length) * 100) 
                  : 0;
                
                return (
                  <div key={item.rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium">{item.rating}</span>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: ratingColors[item.rating]
                        }}
                      />
                    </div>
                    <div className="w-16 text-right">
                      <span className="text-sm font-medium">{item.count}</span>
                      <span className="text-xs text-muted-foreground ml-1">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {pendingCount > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>{pendingCount} avis</strong> en attente de réponse
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rating Evolution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5" />
              Évolution de la note moyenne
            </CardTitle>
            <CardDescription>
              Note moyenne sur les 6 derniers mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ratingEvolution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs" 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, name: string) => [
                      value ? `${value.toFixed(1)} ★` : 'Aucun avis',
                      'Note moyenne'
                    ]}
                    labelFormatter={(label) => `Mois: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rating" 
                    stroke="hsl(45, 93%, 47%)" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(45, 93%, 47%)', r: 5 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex justify-center gap-4 text-xs text-muted-foreground">
              {ratingEvolution.map((item, idx) => (
                <span key={idx}>
                  {item.month}: <strong>{item.count}</strong> avis
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        💡 Ces statistiques sont calculées à partir des avis synchronisés. 
        Les temps de réponse sont estimés selon les dates de création et de réponse.
      </p>
    </div>
  );
}
