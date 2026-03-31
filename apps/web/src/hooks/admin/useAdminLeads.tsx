import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, subMonths, format, differenceInDays } from "date-fns";

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  firm_name: string | null;
  specialty: string;
  status: string;
  preferred_date: string;
  preferred_time: string;
  created_at: string;
  source: string;
  responsible: string;
}

interface PipelineStage {
  label: string;
  count: number;
  color: string;
}

interface LeadsData {
  leads: Lead[];
  pipeline: PipelineStage[];
  totalLeads: number;
  leadsThisMonth: number;
  demosScheduled: number;
  conversionRate: number;
  avgResponseDays: number;
  loading: boolean;
}

const DEMO_SOURCES = ["Site web", "LinkedIn", "Recommandation", "Salon", "Google Ads"];
const DEMO_RESPONSIBLES = ["Marie D.", "Lucas P.", "Sarah B.", "Thomas R."];

const DEMO_LEADS: Lead[] = [
  { id: "1", full_name: "Cabinet Moreau & Associés", email: "moreau@cabinet.fr", firm_name: "Moreau & Associés", specialty: "Droit des affaires", status: "demo_scheduled", preferred_date: "2026-02-15", preferred_time: "10:00", created_at: "2026-02-01T09:00:00Z", source: "Site web", responsible: "Marie D." },
  { id: "2", full_name: "Me. Julie Fontaine", email: "j.fontaine@avocat.fr", firm_name: "Cabinet Fontaine", specialty: "Droit de la famille", status: "pending", preferred_date: "2026-02-18", preferred_time: "14:00", created_at: "2026-02-03T11:00:00Z", source: "LinkedIn", responsible: "Lucas P." },
  { id: "3", full_name: "SCP Dubois-Martin", email: "contact@dubois-martin.fr", firm_name: "Dubois-Martin", specialty: "Droit pénal", status: "converted", preferred_date: "2026-01-20", preferred_time: "09:00", created_at: "2026-01-10T08:30:00Z", source: "Recommandation", responsible: "Sarah B." },
  { id: "4", full_name: "Me. Antoine Bernard", email: "a.bernard@avocat.fr", firm_name: null, specialty: "Droit du travail", status: "demo_done", preferred_date: "2026-02-10", preferred_time: "11:00", created_at: "2026-02-02T15:00:00Z", source: "Google Ads", responsible: "Thomas R." },
  { id: "5", full_name: "Cabinet Lefèvre", email: "info@lefevre-avocats.fr", firm_name: "Lefèvre Avocats", specialty: "Droit immobilier", status: "lost", preferred_date: "2026-01-25", preferred_time: "16:00", created_at: "2026-01-05T10:00:00Z", source: "Salon", responsible: "Marie D." },
  { id: "6", full_name: "Me. Clara Petit", email: "c.petit@barreau.fr", firm_name: "Cabinet Petit", specialty: "Droit fiscal", status: "pending", preferred_date: "2026-02-20", preferred_time: "09:30", created_at: "2026-02-08T14:00:00Z", source: "Site web", responsible: "Lucas P." },
  { id: "7", full_name: "SCP Laurent & Fils", email: "contact@laurent-fils.fr", firm_name: "Laurent & Fils", specialty: "Droit commercial", status: "demo_scheduled", preferred_date: "2026-02-14", preferred_time: "15:00", created_at: "2026-02-05T09:00:00Z", source: "LinkedIn", responsible: "Sarah B." },
  { id: "8", full_name: "Me. Hugo Blanc", email: "h.blanc@avocat.fr", firm_name: null, specialty: "Droit social", status: "converted", preferred_date: "2026-01-28", preferred_time: "10:30", created_at: "2026-01-15T11:00:00Z", source: "Google Ads", responsible: "Thomas R." },
];

export function useAdminLeads(): LeadsData {
  const [data, setData] = useState<LeadsData>({
    leads: [],
    pipeline: [],
    totalLeads: 0,
    leadsThisMonth: 0,
    demosScheduled: 0,
    conversionRate: 0,
    avgResponseDays: 0,
    loading: true,
  });

  useEffect(() => {
    async function fetch() {
      try {
        const { data: requests } = await supabase
          .from("demo_requests")
          .select("*")
          .order("created_at", { ascending: false });

        const hasData = requests && requests.length > 0;
        const now = new Date();
        const monthStart = startOfMonth(now);

        let leads: Lead[];

        if (hasData) {
          leads = requests.map((r, i) => ({
            id: r.id,
            full_name: r.full_name,
            email: r.email,
            firm_name: r.firm_name,
            specialty: r.specialty,
            status: r.status,
            preferred_date: r.preferred_date,
            preferred_time: r.preferred_time,
            created_at: r.created_at,
            source: DEMO_SOURCES[i % DEMO_SOURCES.length],
            responsible: DEMO_RESPONSIBLES[i % DEMO_RESPONSIBLES.length],
          }));
        } else {
          leads = DEMO_LEADS;
        }

        const thisMonth = leads.filter(l => new Date(l.created_at) >= monthStart);
        const demos = leads.filter(l => ["demo_scheduled", "demo_done"].includes(l.status));
        const converted = leads.filter(l => l.status === "converted");
        const rate = leads.length > 0 ? Math.round((converted.length / leads.length) * 100) : 0;

        const statusCounts: Record<string, number> = {};
        leads.forEach(l => { statusCounts[l.status] = (statusCounts[l.status] || 0) + 1; });

        const pipeline: PipelineStage[] = [
          { label: "Nouveaux", count: statusCounts["pending"] || 0, color: "hsl(var(--primary))" },
          { label: "Démo planifiée", count: statusCounts["demo_scheduled"] || 0, color: "hsl(210, 80%, 55%)" },
          { label: "Démo réalisée", count: statusCounts["demo_done"] || 0, color: "hsl(270, 60%, 55%)" },
          { label: "Convertis", count: statusCounts["converted"] || 0, color: "hsl(142, 71%, 45%)" },
          { label: "Perdus", count: statusCounts["lost"] || 0, color: "hsl(var(--destructive))" },
        ];

        const avgDays = leads.length > 0
          ? Math.round(leads.reduce((s, l) => s + Math.max(1, differenceInDays(new Date(l.preferred_date), new Date(l.created_at))), 0) / leads.length)
          : 0;

        setData({
          leads,
          pipeline,
          totalLeads: leads.length,
          leadsThisMonth: thisMonth.length,
          demosScheduled: demos.length,
          conversionRate: rate,
          avgResponseDays: avgDays,
          loading: false,
        });
      } catch {
        setData(prev => ({ ...prev, loading: false }));
      }
    }
    fetch();
  }, []);

  return data;
}
