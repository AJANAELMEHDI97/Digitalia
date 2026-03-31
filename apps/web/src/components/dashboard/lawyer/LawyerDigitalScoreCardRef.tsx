import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Target, CheckCircle2, AlertCircle, TrendingUp, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

function getFactorIcon(label: string) {
  if (label === "Regularite") {
    return <TrendingUp className="h-4 w-4 text-[#ff6661]" />;
  }

  if (label === "Engagement") {
    return <CheckCircle2 className="h-4 w-4 text-[#22c58b]" />;
  }

  return <AlertCircle className="h-4 w-4 text-[#f7a623]" />;
}

export function LawyerDigitalScoreCard() {
  const { publications, loading: pubLoading } = usePublications();
  const { globalMetrics, loading: metricsLoading } = useMetrics();
  const { connections, loading: connectionsLoading } = useSocialConnections();
  const { reviews, loading: googleLoading } = useGoogleBusiness();
  const { articles, loading: blogLoading } = useBlogArticles();

  const loading = pubLoading || metricsLoading || connectionsLoading || googleLoading || blogLoading;

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
    const reputationScore = Math.round(replyRate * 15);

    const publishedArticles = articles.filter((article) => article.status === "publie").length || 2;
    const blogScore = Math.min(publishedArticles * 3, 15);

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
        score: reputationScore,
        maxScore: 15,
        status: reputationScore >= 10 ? "good" : reputationScore >= 5 ? "warning" : "improve",
      },
      {
        label: "Blog",
        score: blogScore,
        maxScore: 15,
        status: blogScore >= 10 ? "good" : blogScore >= 5 ? "warning" : "improve",
      },
    ];

    return {
      totalScore: regularityScore + engagementScore + networksScore + reputationScore + blogScore,
      factors,
    };
  }, [articles, connections, globalMetrics.avgEngagementRate, publications, reviews]);

  const scoreStatus = useMemo(() => {
    if (scoreData.totalScore >= 75) {
      return { label: "Excellente", fill: "#22c58b" };
    }
    if (scoreData.totalScore >= 50) {
      return { label: "Bonne", fill: "#4f46e5" };
    }
    if (scoreData.totalScore >= 25) {
      return { label: "A ameliorer", fill: "#f59e0b" };
    }

    return { label: "A developper", fill: "#ef4444" };
  }, [scoreData.totalScore]);

  useEffect(() => {
    if (loading || hasAnimated) {
      return;
    }

    const duration = 1400;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);

      setAnimatedScore(Math.round(scoreData.totalScore * eased));
      setProgressMultiplier(eased);

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
      <Card className="rounded-[30px] border border-[#ececf6] bg-white shadow-sm">
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-44 w-full rounded-[24px]" />
        </CardContent>
      </Card>
    );
  }

  const ringSize = 154;
  const strokeWidth = 12;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressMultiplier * scoreData.totalScore) / 100 * circumference;

  return (
    <Card className="rounded-[30px] border border-[#ececf6] bg-white shadow-[0_10px_30px_rgba(88,98,140,0.05)]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3 text-[19px] font-semibold text-[#262c3d]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0ecff]">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex cursor-default items-center gap-2">
                  Score de presence digitale
                  <Info className="h-4 w-4 text-[#a4aac0]" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[280px]">
                <p>Vue d'ensemble de votre regularite, engagement, reseaux, reputation et blog.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5 pt-2">
        <div className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
          <div className="flex justify-center md:justify-start">
            <div className="relative h-[154px] w-[154px]">
              <svg className="absolute inset-0 -rotate-90" width={ringSize} height={ringSize}>
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  fill="none"
                  stroke="#eceef8"
                  strokeWidth={strokeWidth}
                />
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  fill="none"
                  stroke={scoreStatus.fill}
                  strokeLinecap="round"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-[52px] font-semibold leading-none text-[#25293b]">{animatedScore}</span>
                  <span className="text-[18px] text-[#a1a9c0]">/100</span>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.25 }}
                className="absolute bottom-2 right-0 rounded-[20px] bg-[#f8a30d] px-4 py-2 text-center text-sm font-semibold leading-tight text-white shadow-lg"
              >
                {scoreStatus.label}
              </motion.div>
            </div>
          </div>

          <div className="space-y-4">
            {scoreData.factors.map((factor, index) => {
              const staggerDelay = index * 0.08;
              const factorProgress = Math.max(0, Math.min(1, (progressMultiplier - staggerDelay) / (1 - staggerDelay)));
              const animatedFactorScore = Math.round(factor.score * factorProgress);

              return (
                <div key={factor.label} className="grid items-center gap-4 md:grid-cols-[148px_minmax(0,1fr)_64px]">
                  <div className="flex items-center gap-2 text-[15px] text-[#98a0b8]">
                    {getFactorIcon(factor.label)}
                    <span>{factor.label}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#edeff7]">
                    <div
                      className="h-2.5 rounded-full bg-primary transition-all duration-300"
                      style={{
                        width: `${(factor.score / factor.maxScore) * 100 * factorProgress}%`,
                      }}
                    />
                  </div>
                  <span className="text-right text-[15px] font-semibold text-[#4a4f63]">
                    {animatedFactorScore}/{factor.maxScore}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-full bg-[#f5f6fc] px-5 py-3 text-center text-sm text-[#9aa1b8]">
          <span className="mr-2">🏆</span>
          Votre presence est dans le <span className="font-semibold text-[#555d73]">top 25%</span> des cabinets de votre specialite
        </div>
      </CardContent>
    </Card>
  );
}
