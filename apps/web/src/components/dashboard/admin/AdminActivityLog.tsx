import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ClipboardList, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { TOKEN_STORAGE_KEY } from "@/lib/local-auth";

interface AuditEntry {
  id: string;
  action: string;
  created_at: string;
  user_id: string;
  entity_type?: string;
}

interface AdminActivityLogProps {
  entries: AuditEntry[];
  loading?: boolean;
}

const actionLabels: Record<string, string> = {
  approve: "validated",
  reject: "refused",
  submit: "submitted",
  create: "created",
  edit: "edited",
  publish: "publication",
  schedule: "scheduled",
};

const anomalyActions = ["reject", "escalate", "refused"];

export function AdminActivityLog({ entries, loading }: AdminActivityLogProps) {
  const [filter, setFilter] = useState<"all" | "anomalies">("all");

  async function handleExportCSV() {
    try {
      const token = typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_STORAGE_KEY) : null;
      const headers: Record<string, string> = {} as any;
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/admin/logs?format=csv", { headers });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Erreur lors de l'export CSV");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      alert("Impossible d'exporter le journal");
    }
  }

  const filteredEntries =
    filter === "anomalies"
      ? entries.filter((entry) => anomalyActions.includes(entry.action))
      : entries;

  return (
    <Card className="rounded-[30px] border border-[#e8eaf4] bg-white shadow-[0_10px_30px_rgba(112,122,163,0.05)]">
      <CardHeader className="flex flex-row items-start justify-between px-10 pb-2 pt-9">
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardTitle className="flex items-center gap-2 text-[22px] font-semibold text-[#1f2538]">
                Journal d'activite
                <Info className="h-5 w-5 text-[#a0a8c0]" />
              </CardTitle>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[260px]">
              <p>Historique recent des actions et anomalies relevees sur la plateforme.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="inline-flex rounded-full border border-[#dfe3f2] bg-white p-1">
          {([
            { id: "all", label: "Tout" },
            { id: "anomalies", label: "Anomalies" },
          ] as const).map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id)}
              className={cn(
                "rounded-full px-5 py-2 text-[15px] font-medium transition-all",
                filter === option.id
                  ? "bg-[#5442d3] text-white"
                  : "text-[#1f2538] hover:bg-[#f5f6fc]",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="px-10 pb-10 pt-3">
        {loading ? (
          <div className="space-y-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-6 w-full rounded-full" />
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-[#97a0bc]">
            <ClipboardList className="h-8 w-8" />
            <p className="text-[16px]">Aucune activite a afficher pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="flex items-start justify-between gap-6">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={cn(
                      "mt-2 h-3 w-3 shrink-0 rounded-full",
                      anomalyActions.includes(entry.action) ? "bg-[#ff5448]" : "bg-[#5442d3]",
                    )}
                  />
                  <p className="text-[18px] text-[#1f2538]">
                    {actionLabels[entry.action] || entry.action}
                    {entry.entity_type ? ` · ${entry.entity_type}` : ""}
                  </p>
                </div>
                <span className="whitespace-nowrap text-[15px] text-[#9aa1b8]">
                  {formatDistanceToNow(new Date(entry.created_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </span>
              </div>
            ))}

            <div className="flex items-center gap-4">
              <button
                onClick={handleExportCSV}
                className="rounded-full border border-[#dfe3f2] bg-white px-4 py-2 text-[15px] font-medium text-[#5442d3] hover:bg-[#f5f6fc]"
              >
                Exporter CSV
              </button>
              <button className="pt-2 text-[16px] font-medium text-[#5442d3] transition-colors hover:text-[#4334b2]">
                Voir tout →
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
