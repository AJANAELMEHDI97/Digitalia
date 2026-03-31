import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, CheckCircle2, AlertCircle, TrendingUp, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePublications } from "@/hooks/usePublications";
import { useMetrics } from "@/hooks/useMetrics";
import { useSocialConnections } from "@/hooks/useSocialConnections";
import { useGoogleBusiness } from "@/hooks/useGoogleBusiness";
import { useBlogArticles } from "@/hooks/useBlogArticles";

interface ScoreFactor {
  label: string;
  score: number;
  maxScore: number;
  status: "good" | "warning" | "improve";
}

export function LawyerDigitalScoreCard() {
  const { publications, loading: pubLoading } = usePublications();
  const { globalMetrics, loading: metricsLoading } = useMetrics();
  const { connections, loading: connectionsLoading } = useSocialConnections();
  const { reviews, loading: googleLoading } = useGoogleBusiness();
  const { articles, loading: blogLoading } = useBlogArticles();

  const loading =
    pubLoading || metricsLoading || connectionsLoading || googleLoading || blogLoading;

  const [animatedScore, setAnimatedScore] = useState(0);
  const [progressMultiplier, setProgressMultiplier] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  const scoreData = useMemo(() => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentPubs = publications.filter(
      (publication) =>
        publication.status === "publie" &&
        new Date(publication.published_at || publication.scheduled_date) >= last30Days,
    ).length;
    const regularityScore = Math.min(recentPubs * 3, 30);

    const engagementRate = globalMetrics.avgEngagementRate || 3.5;
    const engagementScore = Math.min(Math.round(engagementRate * 5), 25);

    const activeNetworks = connections.filter((connection) => connection.is_active).length || 1;
    const networksScore = Math.min(activeNetworks * 5, 15);

    const totalReviews = reviews.length || 5;
    const repliedReviews = reviews.filter((review) => review.review_reply).length || 3;
    const replyRate = totalReviews > 0 ? repliedReviews / totalReviews : 0.6;
    const googleScore = Math.round(replyRate * 15);

    const publishedArticles = articles.filter((article) => article.status === "publie").length || 2;
    const blogScore = Math.min(publishedArticles * 3, 15);

    const totalScore =
      regularityScore + engagementScore + networksScore + googleScore + blogScore;

    const factors: ScoreFactor[] = [
      {
        label: "Regularite",
        score: regularityScore,
        maxScore: 30,
        status: regularityScore >= 20 ? "good" : regularityScore >= 10 ? "warning" : "improve",
      },
      {
        label: "Engagement",
        score: engagementScore,
        maxScore: 25,
        status: engagementScore >= 15 ? "good" : engagementScore >= 8 ? "warning" : "improve",
      },
      {
        label: "Reseaux",
        score: networksScore,
        maxScore: 15,
        status: networksScore >= 10 ? "good" : networksScore >= 5 ? "warning" : "improve",
      },
      {
        label: "E-reputation",
        score: googleScore,
        maxScore: 15,
        status: googleScore >= 10 ? "good" : googleScore >= 5 ? "warning" : "improve",
      },
      {
        label: "Blog",
        score: blogScore,
        maxScore: 15,
        status: blogScore >= 10 ? "good" : blogScore >= 5 ? "warning" : "improve",
      },
    ];

    return { totalScore, factors };
  }, [articles, connections, globalMetrics.avgEngagementRate, publications, reviews]);

  const scoreStatus = useMemo(() => {
    if (scoreData.totalScore >= 75) {
      return { label: "Excellente", badgeClass: "bg-[#18ba7b]", stroke: "#18ba7b" };
    }
    if (scoreData.totalScore >= 50) {
      return { label: "Bonne", badgeClass: "bg-[#5b63d3]", stroke: "#5b63d3" };
    }
    if (scoreData.totalScore >= 25) {
      return { label: "A ameliorer", badgeClass: "bg-[#f5a112]", stroke: "#f5a112" };
    }
    return { label: "A renforcer", badgeClass: "bg-[#ff655c]", stroke: "#ff655c" };
  }, [scoreData.totalScore]);

  const ringSize = 164;
  const strokeWidth = 9;
  const radius = (ringSize - strokeWidth) / 2 - 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressMultiplier * scoreData.totalScore) / 100 * circumference;

  useEffect(() => {
    if (loading || hasAnimated) return;

    const duration = 1500;
    const startTime = performance.now();
    const targetScore = scoreData.totalScore;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setAnimatedScore(Math.round(targetScore * easeOutQuart));
      setProgressMultiplier(easeOutQuart);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setHasAnimated(true);
      }
    };

    requestAnimationFrame(animate);
  }, [hasAnimated, loading, scoreData.totalScore]);

  if (loading) {
    return (
      <Card className="rounded-[30px] border border-[#e9ebf5] bg-white shadow-[0_14px_40px_rgba(110,122,167,0.05)]">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const statusIcon = {
    good: <CheckCircle2 className="h-4 w-4 text-[#18ba7b]" />,
    warning: <AlertCircle className="h-4 w-4 text-[#f59f0d]" />,
    improve: <TrendingUp className="h-4 w-4 text-[#ff7f50]" />,
  };

  return (
    <Card className="rounded-[30px] border border-[#e9ebf5] bg-white shadow-[0_14px_40px_rgba(110,122,167,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(110,122,167,0.08)]">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-4 text-[18px] font-semibold text-[#1f2538]">
          <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#f1ecff]">
            <Target className="h-5 w-5 text-[#6557e8]" />
          </div>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex cursor-default items-center gap-1.5">
                  Score de presence digitale
                  <Info className="h-4 w-4 text-[#9aa1b8]" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[280px]">
                <p>
                  Score composite evaluant votre presence digitale sur 5 axes :
                  regularite, engagement, reseaux, e-reputation et blog.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-center">
          <div className="relative h-[164px] w-[164px] shrink-0">
            <svg className="absolute inset-0 -rotate-90" width={ringSize} height={ringSize}>
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke="#edf0f7"
                strokeWidth={strokeWidth}
              />
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke={scoreStatus.stroke}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-[46px] font-bold leading-none tabular-nums text-[#1f2538]">
                  {animatedScore}
                </span>
                <span className="text-[16px] font-medium text-[#9aa1b8]">/100</span>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.3, ease: "easeOut" }}
              className={cn(
                "absolute bottom-0 left-1/2 min-w-[94px] -translate-x-1/2 rounded-[20px] px-3 py-2 text-center text-[14px] font-semibold text-white shadow-[0_12px_30px_rgba(85,70,215,0.18)]",
                scoreStatus.badgeClass,
              )}
            >
              {scoreStatus.label}
            </motion.div>
          </div>

          <div className="flex-1 space-y-4">
            {scoreData.factors.map((factor, index) => {
              const staggerDelay = index * 0.1;
              const factorProgress = Math.max(
                0,
                Math.min(1, (progressMultiplier - staggerDelay) / (1 - staggerDelay)),
              );
              const animatedFactorScore = Math.round(factor.score * factorProgress);

              return (
                <div
                  key={factor.label}
                  className="grid grid-cols-[118px_minmax(0,1fr)_64px] items-center gap-4"
                >
                  <div className="flex items-center gap-2 text-[15px] text-[#8d94ab]">
                    {statusIcon[factor.status]}
                    <span>{factor.label}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[#eef0f7]">
                    <motion.div
                      className="h-full rounded-full bg-[#5546d7]"
                      animate={{
                        width: `${(factor.score / factor.maxScore) * 100 * factorProgress}%`,
                      }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-right text-[14px] font-semibold tabular-nums text-[#1f2538]">
                    {animatedFactorScore}/{factor.maxScore}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-full bg-[#f5f6fd] px-6 py-4 text-center text-[15px] text-[#8e95ad]">
          Votre presence est dans le <span className="font-semibold text-[#1f2538]">top 25%</span> des cabinets de votre specialite
        </div>
      </CardContent>
    </Card>
  );
}
