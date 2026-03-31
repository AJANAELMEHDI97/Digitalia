import { Building2, Calendar, Link2, Link2Off, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { GoogleBusinessConnection } from "@/hooks/useGoogleBusiness";

interface GoogleConnectionCardProps {
  connection: GoogleBusinessConnection | null;
  loading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function GoogleConnectionCard({
  connection,
  loading,
  onConnect,
  onDisconnect,
}: GoogleConnectionCardProps) {
  if (loading) {
    return (
      <div className="rounded-[30px] border border-dashed border-[#d9e0f1] bg-white p-8 shadow-[0_18px_45px_rgba(110,122,167,0.08)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-5">
            <div className="h-20 w-20 animate-pulse rounded-[26px] bg-[#eff2fb]" />
            <div className="space-y-3">
              <div className="h-7 w-60 animate-pulse rounded-full bg-[#eff2fb]" />
              <div className="h-5 w-80 animate-pulse rounded-full bg-[#f4f6fc]" />
            </div>
          </div>
          <div className="h-14 w-44 animate-pulse rounded-[18px] bg-[#eff2fb]" />
        </div>
        <div className="mt-8 rounded-[24px] bg-[#f7f8fd] p-8">
          <div className="h-5 w-80 animate-pulse rounded-full bg-white/80" />
          <div className="mt-4 space-y-3">
            <div className="h-4 w-72 animate-pulse rounded-full bg-white/80" />
            <div className="h-4 w-80 animate-pulse rounded-full bg-white/80" />
            <div className="h-4 w-64 animate-pulse rounded-full bg-white/80" />
          </div>
        </div>
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="rounded-[30px] border border-dashed border-[#d9e0f1] bg-white p-8 shadow-[0_18px_45px_rgba(110,122,167,0.08)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[26px] bg-[#eef1fb] text-[#8e96b1]">
              <Building2 className="h-9 w-9" />
            </div>
            <div className="space-y-2">
              <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#1f2538]">
                Google Business Profile
              </h2>
              <p className="max-w-[680px] text-[15px] leading-7 text-[#98a0b9]">
                Connectez votre fiche pour gerer vos avis et publications
              </p>
            </div>
          </div>
          <Button
            onClick={onConnect}
            className="h-14 rounded-[18px] bg-[#5941d6] px-8 text-[16px] font-semibold text-white shadow-none hover:bg-[#4e38c7]"
          >
            <Link2 className="mr-2 h-4 w-4" />
            Connecter
          </Button>
        </div>

        <div className="mt-8 rounded-[24px] bg-[#f7f8fd] p-8 text-[#98a0b9]">
          <p className="text-[15px] leading-7 text-[#98a0b9]">
            La connexion a Google Business Profile vous permet de :
          </p>
          <ul className="mt-4 space-y-3 pl-6 text-[15px] leading-7 text-[#98a0b9]">
            <li className="list-disc">Consulter et repondre aux avis clients</li>
            <li className="list-disc">Publier des actualites et evenements</li>
            <li className="list-disc">Suivre les statistiques de visibilite</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[30px] border border-[#e7ebf6] bg-white p-8 shadow-[0_18px_45px_rgba(110,122,167,0.08)]">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[26px] bg-[#eef6ff] text-[#5941d6]">
            <Building2 className="h-9 w-9" />
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#1f2538]">
                {connection.location_name || "Google Business Profile"}
              </h2>
              <Badge className="rounded-full border-0 bg-[#dff7ec] px-3 py-1 text-[13px] font-semibold text-[#04966a]">
                Connecte
              </Badge>
            </div>
            <p className="max-w-[760px] text-[15px] leading-7 text-[#98a0b9]">
              Votre fiche est reliee. Vous pouvez repondre aux avis, publier des actualites et suivre vos statistiques locales.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-[14px] text-[#8f97b0]">
              {connection.email && (
                <span className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {connection.email}
                </span>
              )}
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Connecte le {format(new Date(connection.connected_at), "dd MMM yyyy", { locale: fr })}
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#04966a]" />
                Synchronisation active
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
          <Button
            variant="outline"
            onClick={onDisconnect}
            className="h-12 rounded-[16px] border-[#ffd8d5] px-6 text-[15px] font-semibold text-[#d14e4a] hover:border-[#ffcbc6] hover:bg-[#fff5f4] hover:text-[#c9403b]"
          >
            <Link2Off className="mr-2 h-4 w-4" />
            Deconnecter
          </Button>
        </div>
      </div>
    </div>
  );
}
