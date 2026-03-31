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

function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toLocaleString();
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
  totalPublications = 1,
  clicks = 215,
  goodPerformers = 1,
  mediumPerformers = 0,
  improvePerformers = 0,
}: LawyerQuickStatsCardProps) {
  const [hoveredKpi, setHoveredKpi] = useState<KpiType>(null);

  const reachGrowth =
    previousMonthReach > 0
      ? Math.round(((totalReach - previousMonthReach) / previousMonthReach) * 100)
      : 0;
  const isPositiveGrowth = reachGrowth > 0;
  const globalStatus = engagementRate >= 3.5 ? "green" : engagementRate >= 2 ? "yellow" : "red";

  const interpretations: Record<string, Interpretation> = {
    default: {
      status: globalStatus,
      label:
        globalStatus === "green"
          ? "Communication maitrisee"
          : globalStatus === "yellow"
            ? "Communication a optimiser"
            : "Attention requise",
      text:
        globalStatus === "green"
          ? "Votre communication est reguliere et genere un interet significatif aupres de votre audience professionnelle."
          : globalStatus === "yellow"
            ? "Votre communication progresse mais peut encore etre optimisee pour gagner en visibilite."
            : "Votre presence en ligne demande plus d'efforts pour renforcer votre notoriete.",
    },
    visibility: {
      status: isPositiveGrowth ? "green" : reachGrowth === 0 ? "yellow" : "red",
      label: isPositiveGrowth ? "Visibilite en hausse" : reachGrowth === 0 ? "Visibilite stable" : "Visibilite en baisse",
      text: isPositiveGrowth
        ? `Votre portee progresse de ${reachGrowth}%. Cette audience elargie renforce votre credibilite.`
        : reachGrowth === 0
          ? "Votre visibilite reste stable. Des formats varies peuvent aider a l'augmenter."
          : `Votre portee a baisse de ${Math.abs(reachGrowth)}%. Il faut reexaminer les contenus les plus performants.`,
    },
    engagement: {
      status: totalInteractions > 500 ? "green" : totalInteractions > 200 ? "yellow" : "red",
      label: totalInteractions > 500 ? "Interet excellent" : totalInteractions > 200 ? "Interet correct" : "Interet a developper",
      text: totalInteractions > 500
        ? "Vos prises de parole generent des reactions significatives et montrent un bon niveau d'interet."
        : totalInteractions > 200
          ? "Votre audience reagit correctement. Quelques appels a l'action peuvent amplifier l'engagement."
          : "L'engagement peut etre renforce avec des sujets encore plus proches des attentes de votre audience.",
    },
    rate: {
      status: engagementRate >= 3.5 ? "green" : engagementRate >= 2 ? "yellow" : "red",
      label: engagementRate >= 3.5 ? "Taux remarquable" : engagementRate >= 2 ? "Taux dans la moyenne" : "Taux a ameliorer",
      text:
        engagementRate >= 3.5
          ? `Un taux de ${engagementRate.toFixed(1)}% est excellent pour le secteur juridique.`
          : engagementRate >= 2
            ? `Votre taux de ${engagementRate.toFixed(1)}% reste correct. Des visuels plus percutants peuvent l'ameliorer.`
            : `Un taux de ${engagementRate.toFixed(1)}% laisse un vrai potentiel d'amelioration.`,
    },
    publications: {
      status: totalPublications >= 4 ? "green" : totalPublications >= 2 ? "yellow" : "red",
      label: totalPublications >= 4 ? "Rythme soutenu" : totalPublications >= 2 ? "Rythme regulier" : "Rythme a intensifier",
      text:
        totalPublications >= 4
          ? `${totalPublications} publications sur la periode maintiennent une bonne presence professionnelle.`
          : totalPublications >= 2
            ? `${totalPublications} publications assurent une base reguliere. Quelques posts supplementaires seraient utiles.`
            : `${totalPublications} publication seulement. Une cadence plus soutenue renforcerait votre visibilite.`,
    },
  };

  const activeInterpretation = interpretations[hoveredKpi || "default"];
  const statusConfig = {
    green: {
      bg: "bg-[#eefcf5]",
      border: "border-[#c5f0da]",
      icon: <CheckCircle2 className="h-4 w-4 text-[#14a36f]" />,
      text: "text-[#0f9c69]",
    },
    yellow: {
      bg: "bg-[#fff9ec]",
      border: "border-[#f5d687]",
      icon: <AlertCircle className="h-4 w-4 text-[#f1a020]" />,
      text: "text-[#d98912]",
    },
    red: {
      bg: "bg-[#fff4ef]",
      border: "border-[#ffdcd2]",
      icon: <Lightbulb className="h-4 w-4 text-[#ff7a43]" />,
      text: "text-[#f07a2c]",
    },
  };

  const currentStatus = statusConfig[activeInterpretation.status];

  if (loading) {
    return (
      <Card className="h-full rounded-[30px] border border-[#e5eaf8] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] shadow-[0_10px_28px_rgba(88,98,140,0.05)]">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
          <Skeleton className="h-14 rounded-[22px]" />
          <Skeleton className="h-5 w-44" />
        </CardContent>
      </Card>
    );
  }

  const cardBase =
    "cursor-pointer rounded-2xl border border-[#e8ecf7] bg-white p-3 shadow-sm transition-all";

  return (
    <Card className="h-full rounded-[30px] border border-[#e5eaf8] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] shadow-[0_10px_28px_rgba(88,98,140,0.05)]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-[18px] font-semibold text-[#2a3042]">
          <BarChart3 className="h-5 w-5 text-primary" />
          Statistiques cles
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div
            className={cn(cardBase, hoveredKpi === "visibility" && "ring-2 ring-[#d9dcf8]")}
            onMouseEnter={() => setHoveredKpi("visibility")}
            onMouseLeave={() => setHoveredKpi(null)}
          >
            <div className="mb-1 flex items-center gap-1 text-[12px] text-[#a0a7c1]">
              <Eye className="h-3.5 w-3.5" />
              Vues
            </div>
            <div className="text-[18px] font-semibold text-[#252b3b]">{formatNumber(totalReach)}</div>
            <div className={cn("mt-1 flex items-center gap-1 text-[12px] font-semibold", isPositiveGrowth || reachGrowth < 0 ? "text-[#ef6d5a]" : "text-[#9aa1b8]")}>
              {isPositiveGrowth ? <TrendingDown className="h-3 w-3 scale-x-[-1]" /> : reachGrowth < 0 ? <TrendingDown className="h-3 w-3" /> : null}
              {reachGrowth > 0 ? "+" : ""}
              {reachGrowth}%
            </div>
          </div>

          <div
            className={cn(cardBase, hoveredKpi === "engagement" && "ring-2 ring-[#d9dcf8]")}
            onMouseEnter={() => setHoveredKpi("engagement")}
            onMouseLeave={() => setHoveredKpi(null)}
          >
            <div className="mb-1 flex items-center gap-1 text-[12px] text-[#a0a7c1]">
              <Heart className="h-3.5 w-3.5" />
              Interac.
            </div>
            <div className="text-[18px] font-semibold text-[#252b3b]">{formatNumber(totalInteractions)}</div>
            <div className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-[#22b07d]">
              <TrendingUp className="h-3 w-3" />
              +12%
            </div>
          </div>

          <div
            className={cn(cardBase, hoveredKpi === "rate" && "ring-2 ring-[#d9dcf8]")}
            onMouseEnter={() => setHoveredKpi("rate")}
            onMouseLeave={() => setHoveredKpi(null)}
          >
            <div className="mb-1 flex items-center gap-1 text-[12px] text-[#a0a7c1]">
              <Percent className="h-3.5 w-3.5" />
              Taux eng.
            </div>
            <div className="text-[18px] font-semibold text-[#252b3b]">{engagementRate.toFixed(1)}%</div>
            <div className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-[#22b07d]">
              <TrendingUp className="h-3 w-3" />
              +0.3pt
            </div>
          </div>

          <div
            className={cn(cardBase, hoveredKpi === "publications" && "ring-2 ring-[#d9dcf8]")}
            onMouseEnter={() => setHoveredKpi("publications")}
            onMouseLeave={() => setHoveredKpi(null)}
          >
            <div className="mb-1 flex items-center gap-1 text-[12px] text-[#a0a7c1]">
              <FileText className="h-3.5 w-3.5" />
              Posts
            </div>
            <div className="text-[18px] font-semibold text-[#252b3b]">{totalPublications}</div>
            <div className="mt-1 text-[12px] text-[#a0a7c1]">ce mois</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#97a0bb]">
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {comments}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {likes}
          </span>
          <span className="flex items-center gap-1">
            <Share2 className="h-3.5 w-3.5" />
            {shares}
          </span>
          <span className="flex items-center gap-1">
            <MousePointerClick className="h-3.5 w-3.5" />
            {clicks} clics
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
          <span className="flex items-center gap-1 text-[#22b07d]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {goodPerformers} perfs
          </span>
          <span className="flex items-center gap-1 text-[#f1a020]">
            <AlertCircle className="h-3.5 w-3.5" />
            {mediumPerformers} moyens
          </span>
          <span className="flex items-center gap-1 text-[#ff7a43]">
            <XCircle className="h-3.5 w-3.5" />
            {improvePerformers} a ameliorer
          </span>
        </div>

        <div className={cn("rounded-[22px] border p-4 transition-all duration-200", currentStatus.bg, currentStatus.border)}>
          <div className={cn("mb-1.5 flex items-center gap-1.5 text-[14px] font-semibold", currentStatus.text)}>
            {currentStatus.icon}
            {activeInterpretation.label}
          </div>
          <p className="text-[14px] leading-relaxed text-[#97a0bb]">{activeInterpretation.text}</p>
        </div>

        <Link to="/metrics" className="inline-flex items-center gap-1 text-[15px] font-semibold text-primary transition-colors hover:text-primary/80">
          Voir les metriques detaillees
          <TrendingUp className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
