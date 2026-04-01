import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Info, TrendingUp, Eye, Zap } from "lucide-react";
import { usePublications, type Publication } from "@/hooks/usePublications";
import { Skeleton } from "@/components/ui/skeleton";
import { subDays, isAfter, parseISO } from "date-fns";
import { MetricsFilters } from "@/components/metrics/MetricsFilters";
import { MetricsGrid, type MetricsPublication } from "@/components/metrics/MetricsGrid";
import { MetricsDetailView } from "@/components/metrics/MetricsDetailView";
import type { PerformanceLevel, PerformanceAnalysis } from "@/data/mockMetrics";

type SupportedPlatform = "linkedin" | "instagram" | "facebook" | "twitter";

const PLATFORM_PARAMS: Record<SupportedPlatform, { reach: number; engBase: number }> = {
  linkedin:  { reach: 3200, engBase: 0.042 },
  instagram: { reach: 5400, engBase: 0.062 },
  facebook:  { reach: 2100, engBase: 0.031 },
  twitter:   { reach: 1600, engBase: 0.022 },
};

const PEAK_TIMES_BY_PLATFORM: Record<SupportedPlatform, { day: string; hour: string }[]> = {
  linkedin:  [{ day: "Mardi", hour: "10h" }, { day: "Jeudi", hour: "14h" }],
  instagram: [{ day: "Mercredi", hour: "18h" }, { day: "Samedi", hour: "11h" }],
  facebook:  [{ day: "Mercredi", hour: "13h" }, { day: "Vendredi", hour: "15h" }],
  twitter:   [{ day: "Lundi", hour: "09h" }, { day: "Jeudi", hour: "12h" }],
};

function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function seededFraction(seed: number, offset: number): number {
  return ((seed * (offset + 1) * 2654435761) >>> 0) / 0xffffffff;
}

function buildAnalysis(level: PerformanceLevel, engRate: number, platform: SupportedPlatform): PerformanceAnalysis {
  if (level === "good") {
    return {
      summary: "Contenu haute performance",
      explanations: [
        `Taux d'engagement de ${engRate.toFixed(1)}% nettement au-dessus de la moyenne ${platform}.`,
        "La portee organique depasse les projections initiales.",
        "Le format et le timing ont favorise la viralite.",
      ],
      recommendation: "Reproduire ce format pour vos prochaines communications strategiques.",
    };
  }
  if (level === "medium") {
    return {
      summary: "Performance correcte",
      explanations: [
        `Taux d'engagement de ${engRate.toFixed(1)}% dans la moyenne du secteur.`,
        "La portee est conforme aux attentes pour ce type de contenu.",
      ],
      recommendation: "Testez un visuel plus impactant ou un appel a l'action plus direct.",
    };
  }
  return {
    summary: "Contenu a optimiser",
    explanations: [
      `Taux d'engagement de ${engRate.toFixed(1)}% en dessous de la moyenne.`,
      "La portee organique est limitee — envisagez une publication sponsorisee.",
    ],
    recommendation: "Retravailler le hook d'accroche et privilegier un format court.",
  };
}

function mapPublicationToMetrics(post: Publication): MetricsPublication | null {
  const rawPlatform = post.platform ?? (post.platforms?.[0] as string | undefined);
  const platform = (["linkedin", "instagram", "facebook", "twitter"].includes(rawPlatform ?? "")
    ? rawPlatform
    : "linkedin") as SupportedPlatform;

  const publishedAt = post.published_at ?? post.created_at;
  const params = PLATFORM_PARAMS[platform];
  const seed = hashSeed(post.id);

  const reach = Math.round(params.reach * (0.4 + seededFraction(seed, 1) * 1.2));
  const engagementRate = parseFloat((params.engBase * (0.4 + seededFraction(seed, 2) * 1.4) * 100).toFixed(1));
  const likes = Math.round(reach * 0.028 * (0.5 + seededFraction(seed, 3)));
  const comments = Math.round(reach * 0.006 * (0.5 + seededFraction(seed, 4)));
  const shares = Math.round(reach * 0.009 * (0.5 + seededFraction(seed, 5)));
  const clicks = Math.round(reach * 0.022 * (0.5 + seededFraction(seed, 6)));

  const performanceLevel: PerformanceLevel =
    engagementRate >= 4.5 ? "good" : engagementRate >= 2.5 ? "medium" : "improve";

  return {
    id: post.id,
    publicationId: post.id,
    content: post.content,
    platform,
    publishedAt,
    imageUrl: post.image_url ?? undefined,
    reach,
    likes,
    comments,
    shares,
    clicks,
    engagementRate,
    performanceLevel,
    analysis: buildAnalysis(performanceLevel, engagementRate, platform),
    audienceAge: [
      { range: "25-34", percentage: 34 + Math.round(seededFraction(seed, 7) * 10) },
      { range: "35-44", percentage: 28 + Math.round(seededFraction(seed, 8) * 8) },
      { range: "18-24", percentage: 18 + Math.round(seededFraction(seed, 9) * 6) },
      { range: "45+", percentage: 20 },
    ],
    audienceLocation: [
      { location: "Casablanca", percentage: 42 + Math.round(seededFraction(seed, 10) * 10) },
      { location: "Rabat", percentage: 22 + Math.round(seededFraction(seed, 11) * 6) },
      { location: "Marrakech", percentage: 14 },
      { location: "Autres", percentage: 22 },
    ],
    audienceGender: [
      { gender: "Femmes", percentage: 45 + Math.round(seededFraction(seed, 12) * 10) },
      { gender: "Hommes", percentage: 55 - Math.round(seededFraction(seed, 12) * 10) },
    ],
    peakTimes: PEAK_TIMES_BY_PLATFORM[platform],
  };
}

export default function Metrics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { publications, loading } = usePublications();
  const [selectedPublication, setSelectedPublication] = useState<MetricsPublication | null>(null);

  const [platformFilter, setPlatformFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [performanceFilter, setPerformanceFilter] = useState("all");

  const allMetrics = useMemo(() => {
    return publications
      .filter((p) => p.status === "publie" && (p.published_at || p.created_at))
      .map(mapPublicationToMetrics)
      .filter((m): m is MetricsPublication => m !== null);
  }, [publications]);

  const stats = useMemo(() => {
    const totalReach = allMetrics.reduce((sum, publication) => sum + publication.reach, 0);
    const avgEngagement =
      allMetrics.reduce((sum, publication) => sum + publication.engagementRate, 0) /
      allMetrics.length;
    const goodPerformers = allMetrics.filter(
      (publication) => publication.performanceLevel === "good",
    ).length;

    return { totalReach, avgEngagement, goodPerformers, total: allMetrics.length };
  }, [allMetrics]);

  const filteredMetrics = useMemo(() => {
    let result = [...allMetrics];

    if (platformFilter !== "all") {
      result = result.filter((publication) => publication.platform === platformFilter);
    }

    if (periodFilter !== "all") {
      const now = new Date();
      const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
      const days = daysMap[periodFilter];
      if (days) {
        const cutoff = subDays(now, days);
        result = result.filter((publication) => isAfter(parseISO(publication.publishedAt), cutoff));
      }
    }

    if (performanceFilter !== "all") {
      result = result.filter(
        (publication) => publication.performanceLevel === performanceFilter,
      );
    }

    result.sort((left, right) => {
      const perfOrder = { good: 0, medium: 1, improve: 2 };
      const perfDiff = perfOrder[left.performanceLevel] - perfOrder[right.performanceLevel];
      if (perfDiff !== 0) return perfDiff;

      return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();
    });

    return result;
  }, [allMetrics, performanceFilter, periodFilter, platformFilter]);

  useEffect(() => {
    const publicationId = searchParams.get("publication");
    if (publicationId && allMetrics.length > 0) {
      const publication = allMetrics.find(
        (metric) => metric.publicationId === publicationId || metric.id === publicationId,
      );
      if (publication) {
        setSelectedPublication(publication);
        setSearchParams({});
      }
    }
  }, [allMetrics, searchParams, setSearchParams]);

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Skeleton key={item} className="h-80 rounded-[26px]" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (selectedPublication) {
    return (
      <AppLayout>
        <MetricsDetailView publication={selectedPublication} onBack={() => setSelectedPublication(null)} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 pb-10">
        <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#eef2ff]">
              <BarChart3 className="h-6 w-6 text-[#5b63d3]" />
            </div>
            <div>
              <h1 className="text-[34px] font-bold tracking-[-0.04em] text-[#1f2538] md:text-[42px]">
                Performances
              </h1>
              <p className="mt-1 text-[18px] text-[#9aa1b8]">
                Mesurez l&apos;impact de vos prises de parole et identifiez les contenus qui performent.
              </p>
            </div>
          </div>

          <div className="inline-flex h-11 items-center rounded-full border border-[#dde2f4] bg-white px-5 text-[14px] font-semibold text-[#5b63d3] shadow-[0_10px_30px_rgba(112,122,163,0.05)]">
            {filteredMetrics.length} contenu{filteredMetrics.length > 1 ? "s" : ""} analyse{filteredMetrics.length > 1 ? "s" : ""}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard icon={Eye} label="Visibilite totale" value={stats.totalReach.toLocaleString("fr-FR")} />
          <StatCard icon={TrendingUp} label="Taux d'interet moyen" value={`${stats.avgEngagement.toFixed(1)}%`} />
          <StatCard icon={Zap} label="Communications efficaces" value={`${stats.goodPerformers}/${stats.total}`} />
          <StatCard icon={BarChart3} label="Prises de parole analysees" value={stats.total.toString()} />
        </div>

        <div
          className={`rounded-[30px] border px-7 py-6 ${
            stats.avgEngagement >= 3.5
              ? "border-[#bff4df] bg-[linear-gradient(90deg,#effff7_0%,#f8fffb_100%)]"
              : "border-[#f4cf67] bg-[linear-gradient(90deg,#fff9ea_0%,#fffdf7_100%)]"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                stats.avgEngagement >= 3.5 ? "bg-[#dff8ea]" : "bg-[#fff3da]"
              }`}
            >
              <Info className={`h-5 w-5 ${stats.avgEngagement >= 3.5 ? "text-[#18ba7b]" : "text-[#f59f0d]"}`} />
            </div>
            <div className="text-[15px] leading-7 text-[#6f7691]">
              <strong className="text-[#1f2538]">
                {stats.avgEngagement >= 3.5 ? "Communication maitrisee." : "Mode demonstration."}
              </strong>{" "}
              {stats.avgEngagement >= 3.5
                ? "Vos meilleurs contenus generent deja un niveau d'interet solide. Servez-vous de cette grille pour generaliser les bons formats."
                : "Connectez vos reseaux sociaux pour obtenir des metriques en temps reel. Ces projections sont calculees a partir de vos publications."}
            </div>
          </div>
        </div>

        <div className="space-y-5 rounded-[30px] border border-[#e9edf7] bg-white p-5 shadow-[0_14px_40px_rgba(110,122,167,0.05)] md:p-6">
          <MetricsFilters
            selectedPlatform={platformFilter}
            selectedPeriod={periodFilter}
            selectedPerformance={performanceFilter}
            onPlatformChange={setPlatformFilter}
            onPeriodChange={setPeriodFilter}
            onPerformanceChange={setPerformanceFilter}
          />

          <p className="text-[14px] text-[#8d94ab]">
            {filteredMetrics.length} prise{filteredMetrics.length > 1 ? "s" : ""} de parole analysee{filteredMetrics.length > 1 ? "s" : ""}
          </p>

          <MetricsGrid publications={filteredMetrics} onSelect={setSelectedPublication} />
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card className="rounded-[26px] border border-[#e9edf7] bg-white shadow-[0_10px_30px_rgba(112,122,163,0.05)]">
      <CardContent className="flex items-center gap-4 py-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#eef2ff]">
          <Icon className="h-5 w-5 text-[#5b63d3]" />
        </div>
        <div>
          <p className="text-[24px] font-bold text-[#1f2538]">{value}</p>
          <p className="text-[13px] text-[#9aa1b8]">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
