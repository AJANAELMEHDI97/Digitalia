import { useState } from "react";
import {
  BarChart3,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  TrendingDown,
  Percent,
  FileText,
  MousePointerClick,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LawyerQuickStatsCardProps {
  totalReach: number;
  previousMonthReach?: number;
  totalInteractions: number;
  likes: number;
  comments: number;
  shares: number;
  loading?: boolean;
  engagementRate?: number;
  totalPublications?: number;
  clicks?: number;
  goodPerformers?: number;
  mediumPerformers?: number;
  improvePerformers?: number;
}

type KpiType = "visibility" | "engagement" | "rate" | "publications" | null;

interface Interpretation {
  status: "green" | "yellow" | "red";
  label: string;
  text: string;
}

export function LawyerQuickStatsCard({
  totalReach,
  previousMonthReach = 9000,
  totalInteractions,
  likes,
  comments,
  shares,
  loading,
  engagementRate = 4.2,
  totalPublications = 47,
  clicks = 89,
  goodPerformers = 28,
  mediumPerformers = 14,
  improvePerformers = 5,
}: LawyerQuickStatsCardProps) {
  const [hoveredKpi, setHoveredKpi] = useState<KpiType>(null);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toLocaleString();
  };

  const reachGrowth =
    previousMonthReach > 0
      ? Math.round(((totalReach - previousMonthReach) / previousMonthReach) * 100)
      : 0;
  const isPositiveGrowth = reachGrowth > 0;

  const getGlobalStatus = (): "green" | "yellow" | "red" => {
    if (engagementRate >= 3.5) return "green";
    if (engagementRate >= 2) return "yellow";
    return "red";
  };

  const interpretations: Record<string, Interpretation> = {
    default: {
      status: getGlobalStatus(),
      label:
        getGlobalStatus() === "green"
          ? "Communication maitrisee"
          : getGlobalStatus() === "yellow"
            ? "Communication a optimiser"
            : "Attention requise",
      text:
        getGlobalStatus() === "green"
          ? "Votre communication est reguliere et genere un interet significatif aupres de votre audience professionnelle."
          : getGlobalStatus() === "yellow"
            ? "Votre communication progresse mais peut encore etre optimisee pour renforcer votre visibilite."
            : "Votre presence en ligne necessite plus d'attention pour developper votre notoriete.",
    },
    visibility: {
      status: isPositiveGrowth ? "green" : reachGrowth === 0 ? "yellow" : "red",
      label: isPositiveGrowth
        ? "Visibilite en hausse"
        : reachGrowth === 0
          ? "Visibilite stable"
          : "Visibilite en baisse",
      text: isPositiveGrowth
        ? `Votre portee est en progression de ${reachGrowth}%. Cette audience elargie renforce votre credibilite professionnelle.`
        : reachGrowth === 0
          ? "Votre visibilite reste stable. Envisagez de varier les formats pour elargir votre audience."
          : `Votre portee a diminue de ${Math.abs(reachGrowth)}%. Analysons les contenus qui performent le mieux.`,
    },
    engagement: {
      status: totalInteractions > 500 ? "green" : totalInteractions > 200 ? "yellow" : "red",
      label:
        totalInteractions > 500
          ? "Interet excellent"
          : totalInteractions > 200
            ? "Interet correct"
            : "Interet a developper",
      text:
        totalInteractions > 500
          ? "L'interet suscite est remarquable. Vos prises de parole generent des reactions significatives de votre audience."
          : totalInteractions > 200
            ? "Vos publications generent un interet satisfaisant. Les appels a l'action peuvent amplifier l'engagement."
            : "L'engagement peut etre renforce avec des sujets plus proches des preoccupations de votre audience.",
    },
    rate: {
      status: engagementRate >= 3.5 ? "green" : engagementRate >= 2 ? "yellow" : "red",
      label:
        engagementRate >= 3.5
          ? "Taux remarquable"
          : engagementRate >= 2
            ? "Taux dans la moyenne"
            : "Taux a ameliorer",
      text:
        engagementRate >= 3.5
          ? `Un taux de ${engagementRate.toFixed(1)}% est excellent pour le secteur juridique. La moyenne se situe entre 2% et 3%.`
          : engagementRate >= 2
            ? `Votre taux de ${engagementRate.toFixed(1)}% est dans la moyenne. Des visuels plus percutants peuvent l'ameliorer.`
            : `Un taux de ${engagementRate.toFixed(1)}% indique un potentiel d'amelioration. Privilegiez les sujets d'actualite juridique.`,
    },
    publications: {
      status: totalPublications >= 40 ? "green" : totalPublications >= 20 ? "yellow" : "red",
      label:
        totalPublications >= 40
          ? "Rythme soutenu"
          : totalPublications >= 20
            ? "Rythme regulier"
            : "Rythme a intensifier",
      text:
        totalPublications >= 40
          ? `${totalPublications} publications ce mois maintiennent une presence professionnelle constante et renforcent votre expertise.`
          : totalPublications >= 20
            ? `${totalPublications} publications assurent une regularite appreciable. Deux ou trois posts supplementaires par semaine seraient benefiques.`
            : `${totalPublications} publications ce mois. Une cadence plus soutenue renforcerait votre visibilite.`,
    },
  };

  const activeInterp = interpretations[hoveredKpi || "default"];

  const statusConfig = {
    green: {
      bg: "bg-[#effff7]",
      border: "border-[#bff4df]",
      icon: <CheckCircle2 className="h-3.5 w-3.5 text-[#18ba7b]" />,
      text: "text-[#109266]",
    },
    yellow: {
      bg: "bg-[#fff9ea]",
      border: "border-[#f4cf67]",
      icon: <AlertCircle className="h-3.5 w-3.5 text-[#f59f0d]" />,
      text: "text-[#a86507]",
    },
    red: {
      bg: "bg-[#fff3ec]",
      border: "border-[#ffc9ae]",
      icon: <Lightbulb className="h-3.5 w-3.5 text-[#ff7f50]" />,
      text: "text-[#b55c32]",
    },
  };

  const currentStatus = statusConfig[activeInterp.status];

  if (loading) {
    return (
      <Card className="h-full rounded-[30px] border border-[#e9ebf5] bg-white shadow-[0_14px_40px_rgba(110,122,167,0.05)]">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Skeleton className="h-20 rounded-[20px]" />
            <Skeleton className="h-20 rounded-[20px]" />
            <Skeleton className="h-20 rounded-[20px]" />
            <Skeleton className="h-20 rounded-[20px]" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-16 w-full rounded-[20px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full rounded-[30px] border border-[#e9ebf5] bg-white shadow-[0_14px_40px_rgba(110,122,167,0.05)]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3 text-[18px] font-semibold text-[#1f2538]">
          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#f1ecff]">
            <BarChart3 className="h-5 w-5 text-[#5b63d3]" />
          </div>
          Statistiques cles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div
            className={cn(
              "cursor-pointer rounded-[20px] border border-[#edf0f8] bg-[#fafbff] p-3 transition-all",
              hoveredKpi === "visibility" && "ring-2 ring-[#cfd4fb]",
            )}
            onMouseEnter={() => setHoveredKpi("visibility")}
            onMouseLeave={() => setHoveredKpi(null)}
          >
            <div className="mb-1 flex items-center gap-1 text-[11px] text-[#9aa1b8]">
              <Eye className="h-3.5 w-3.5" />
              Vues
            </div>
            <div className="text-[20px] font-bold text-[#1f2538] tabular-nums">
              {formatNumber(totalReach)}
            </div>
            <div
              className={cn(
                "mt-1 flex items-center gap-0.5 text-[11px] font-semibold",
                isPositiveGrowth
                  ? "text-[#18ba7b]"
                  : reachGrowth < 0
                    ? "text-[#f59f0d]"
                    : "text-[#9aa1b8]",
              )}
            >
              {isPositiveGrowth ? (
                <TrendingUp className="h-2.5 w-2.5" />
              ) : reachGrowth < 0 ? (
                <TrendingDown className="h-2.5 w-2.5" />
              ) : null}
              {reachGrowth > 0 ? "+" : ""}
              {reachGrowth}%
            </div>
          </div>

          <div
            className={cn(
              "cursor-pointer rounded-[20px] border border-[#edf0f8] bg-[#fafbff] p-3 transition-all",
              hoveredKpi === "engagement" && "ring-2 ring-[#cfd4fb]",
            )}
            onMouseEnter={() => setHoveredKpi("engagement")}
            onMouseLeave={() => setHoveredKpi(null)}
          >
            <div className="mb-1 flex items-center gap-1 text-[11px] text-[#9aa1b8]">
              <Heart className="h-3.5 w-3.5" />
              Interac.
            </div>
            <div className="text-[20px] font-bold text-[#1f2538] tabular-nums">
              {formatNumber(totalInteractions)}
            </div>
            <div className="mt-1 flex items-center gap-0.5 text-[11px] font-semibold text-[#18ba7b]">
              <TrendingUp className="h-2.5 w-2.5" />
              +12%
            </div>
          </div>

          <div
            className={cn(
              "cursor-pointer rounded-[20px] border border-[#edf0f8] bg-[#fafbff] p-3 transition-all",
              hoveredKpi === "rate" && "ring-2 ring-[#cfd4fb]",
            )}
            onMouseEnter={() => setHoveredKpi("rate")}
            onMouseLeave={() => setHoveredKpi(null)}
          >
            <div className="mb-1 flex items-center gap-1 text-[11px] text-[#9aa1b8]">
              <Percent className="h-3.5 w-3.5" />
              Taux eng.
            </div>
            <div className="text-[20px] font-bold text-[#1f2538] tabular-nums">
              {engagementRate.toFixed(1)}%
            </div>
            <div className="mt-1 flex items-center gap-0.5 text-[11px] font-semibold text-[#18ba7b]">
              <TrendingUp className="h-2.5 w-2.5" />
              +0.3pt
            </div>
          </div>

          <div
            className={cn(
              "cursor-pointer rounded-[20px] border border-[#edf0f8] bg-[#fafbff] p-3 transition-all",
              hoveredKpi === "publications" && "ring-2 ring-[#cfd4fb]",
            )}
            onMouseEnter={() => setHoveredKpi("publications")}
            onMouseLeave={() => setHoveredKpi(null)}
          >
            <div className="mb-1 flex items-center gap-1 text-[11px] text-[#9aa1b8]">
              <FileText className="h-3.5 w-3.5" />
              Posts
            </div>
            <div className="text-[20px] font-bold text-[#1f2538] tabular-nums">
              {totalPublications}
            </div>
            <div className="mt-1 text-[11px] text-[#9aa1b8]">ce mois</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#8d94ab]">
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            {comments}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {likes}
          </span>
          <span className="flex items-center gap-1">
            <Share2 className="h-3 w-3" />
            {shares}
          </span>
          <span className="flex items-center gap-1">
            <MousePointerClick className="h-3 w-3" />
            {clicks} clics
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
          <span className="flex items-center gap-1 text-[#18ba7b]">
            <CheckCircle2 className="h-3 w-3" />
            {goodPerformers} perfs
          </span>
          <span className="flex items-center gap-1 text-[#f59f0d]">
            <AlertCircle className="h-3 w-3" />
            {mediumPerformers} moyens
          </span>
          <span className="flex items-center gap-1 text-[#ff7f50]">
            <XCircle className="h-3 w-3" />
            {improvePerformers} a ameliorer
          </span>
        </div>

        <div
          className={cn(
            "rounded-[22px] border p-4 transition-all duration-200",
            currentStatus.bg,
            currentStatus.border,
          )}
        >
          <div
            className={cn(
              "mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold",
              currentStatus.text,
            )}
          >
            {currentStatus.icon}
            {activeInterp.label}
          </div>
          <p className="text-[13px] leading-relaxed text-[#8d94ab]">{activeInterp.text}</p>
        </div>

        <Link
          to="/metrics"
          className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#5b63d3] transition-colors hover:text-[#4047b8]"
        >
          Voir les metriques detaillees
          <TrendingUp className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}
