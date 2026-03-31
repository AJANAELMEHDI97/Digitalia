import { Link } from "react-router-dom";
import { AlertCircle, Clock, ChevronRight, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Publication } from "@/hooks/usePublications";
import { AutoValidationInfo } from "@/hooks/useAutoValidation";

interface LawyerValidationBlockProps {
  publications: Publication[];
  loading?: boolean;
  getAutoValidationInfo?: (
    createdAt: string,
    scheduledDate: string,
    scheduledTime: string,
  ) => AutoValidationInfo | null;
}

export function LawyerValidationBlock({
  publications,
  loading,
  getAutoValidationInfo,
}: LawyerValidationBlockProps) {
  const pendingPublications = publications.filter((publication) => publication.status === "a_valider");
  const pendingCount = pendingPublications.length;

  const soonestDeadline = pendingPublications
    .map((publication) => ({
      info: getAutoValidationInfo?.(
        publication.created_at,
        publication.scheduled_date,
        publication.scheduled_time,
      ),
    }))
    .filter((entry) => entry.info && !entry.info.isBlocked)
    .sort((a, b) => {
      const aValue = (a.info?.hours || 0) * 60 + (a.info?.minutes || 0);
      const bValue = (b.info?.hours || 0) * 60 + (b.info?.minutes || 0);
      return aValue - bValue;
    })[0]?.info;

  if (loading) {
    return (
      <Card className="rounded-[30px] border border-[#f3cf6a] bg-white shadow-sm">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-14 w-80 rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </CardContent>
      </Card>
    );
  }

  if (pendingCount === 0) {
    return (
      <Card className="rounded-[30px] border border-[#c8efdf] bg-[linear-gradient(90deg,#ecfff7_0%,#ffffff_100%)] shadow-sm">
        <CardContent className="flex items-center gap-4 px-8 py-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d8f9e9]">
            <ShieldCheck className="h-6 w-6 text-[#00a36f]" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[#213040]">Aucune publication en attente</p>
            <p className="mt-1 text-sm text-[#97a0bb]">
              Toutes vos communications ont deja ete validees.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[30px] border border-[#f3cf6a] bg-[linear-gradient(90deg,#fff9eb_0%,#ffffff_58%,#fffef8_100%)] shadow-[0_10px_30px_rgba(223,181,76,0.06)]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-3 text-[18px] font-semibold text-[#2a3042]">
            <AlertCircle className="h-5 w-5 text-[#f08a1c]" />
            Publications en attente de validation
          </CardTitle>
          <Badge className="rounded-full border-0 bg-[#fff1c8] px-4 py-1.5 text-sm font-semibold text-[#cf7a16]">
            {pendingCount} en attente
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-1">
        <div className="flex items-center gap-2 text-[15px] text-[#9aa1b8]">
          <Clock className="h-5 w-5" />
          <span>
            {soonestDeadline
              ? `Delai actif : ${soonestDeadline.hours}h${soonestDeadline.minutes ? ` ${soonestDeadline.minutes}min` : ""}`
              : "Delai de validation actif"}
          </span>
        </div>

        <Button
          asChild
          className="h-14 rounded-2xl bg-primary px-8 text-lg font-semibold shadow-[0_14px_30px_rgba(79,70,229,0.22)] hover:bg-primary/95"
        >
          <Link to="/validation">
            Voir et valider mes publications
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>

        <div className="flex items-start gap-3 text-[14px] leading-7 text-[#97a0bb]">
          <ShieldCheck className="mt-1 h-5 w-5 flex-shrink-0 text-[#00b37f]" />
          <p>
            Ces prises de parole necessitent votre validation prioritaire.
            <br />
            Aucune publication ne sera diffusee sans votre decision.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
