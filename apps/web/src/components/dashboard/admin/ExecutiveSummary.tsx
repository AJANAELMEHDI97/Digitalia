import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ExecutiveSummaryProps {
  mrr: number;
  mrrVariation: number;
  paymentDelays: number;
  pendingPosts: number;
  atRiskChurn: number;
  activeFirms: number;
  healthTrend7d: "improving" | "degrading" | "stable";
  loading?: boolean;
}

export function ExecutiveSummary({
  mrr, mrrVariation, paymentDelays, pendingPosts, atRiskChurn, activeFirms, healthTrend7d, loading,
}: ExecutiveSummaryProps) {
  if (loading) return null;

  const totalAlerts = paymentDelays + atRiskChurn;
  const status = totalAlerts === 0 ? "stable" : totalAlerts <= 3 ? "attention" : "critique";

  const statusConfig = {
    stable: { color: "bg-emerald-500", label: "Stable", text: "text-emerald-700" },
    attention: { color: "bg-amber-500", label: "Attention", text: "text-amber-700" },
    critique: { color: "bg-destructive", label: "Critique", text: "text-destructive" },
  };

  const cfg = statusConfig[status];

  const TrendIcon = healthTrend7d === "improving" ? TrendingUp : healthTrend7d === "degrading" ? TrendingDown : Minus;

  // Build summary lines
  const lines: string[] = [];
  if (mrrVariation !== 0) {
    lines.push(`MRR ${mrrVariation > 0 ? "en hausse" : "en baisse"} de ${mrrVariation > 0 ? "+" : ""}${mrrVariation}% vs mois précédent.`);
  } else {
    lines.push(`MRR stable à ${mrr.toLocaleString("fr-FR")} €.`);
  }
  if (paymentDelays > 0) lines.push(`${paymentDelays} retard${paymentDelays > 1 ? "s" : ""} de paiement détecté${paymentDelays > 1 ? "s" : ""}.`);
  if (atRiskChurn > 0) lines.push(`${atRiskChurn} compte${atRiskChurn > 1 ? "s" : ""} à risque de churn.`);
  if (pendingPosts > 0) lines.push(`${pendingPosts} post${pendingPosts > 1 ? "s" : ""} en attente de validation.`);

  return (
    <Card className="flex overflow-hidden">
      <div className={cn("w-1.5 shrink-0", cfg.color)} />
      <div className="flex-1 p-4 flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-semibold", cfg.text)}>{cfg.label}</span>
            <TrendIcon className={cn("h-3.5 w-3.5", cfg.text)} />
            <span className="text-xs text-muted-foreground">{activeFirms} cabinets actifs</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {lines.join(" ")}
          </p>
        </div>
      </div>
    </Card>
  );
}
