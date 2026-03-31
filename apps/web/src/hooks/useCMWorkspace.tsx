import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLawFirmContextSafe, LawFirm } from "@/contexts/LawFirmContext";
import { Publication } from "./usePublications";

export interface FirmStats {
  firm: LawFirm;
  pending: number;
  scheduled: number;
  drafts: number;
  published: number;
  refused: number;
  late: number;
  total: number;
  status: 'ok' | 'attention' | 'blocked';
}

export interface CMWorkspaceData {
  assignedFirms: LawFirm[];
  selectedFirmId: string | null;
  selectedFirm: LawFirm | null;
  allPublications: Publication[];
  firmStats: FirmStats[];
  globalStats: {
    totalFirms: number;
    totalPending: number;
    totalDrafts: number;
    totalScheduled: number;
    totalPublished: number;
    totalRefused: number;
    totalLate: number;
    totalAtRisk: number;
    totalPublications30d: number;
    totalVolume: number;
  };
  isLoading: boolean;
  refetch: () => void;
}

export function useCMWorkspace(): CMWorkspaceData {
  const { 
    assignedFirms, 
    selectedFirmId, 
    selectedFirm, 
    isLoading: firmsLoading 
  } = useLawFirmContextSafe();

  const firmIds = useMemo(() => 
    assignedFirms.map(f => f.id), 
    [assignedFirms]
  );

  // Fetch publications for all assigned firms with pagination
  const { 
    data: allPublications = [], 
    isLoading: pubsLoading,
    refetch 
  } = useQuery({
    queryKey: ['cm-publications', firmIds],
    queryFn: async () => {
      if (firmIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .in('law_firm_id', firmIds)
        .order('scheduled_date', { ascending: false })
        .limit(100); // Limit to 100 publications for performance

      if (error) {
        console.error('Error fetching CM publications:', error);
        return [];
      }

      return data as Publication[];
    },
    enabled: firmIds.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Calculate stats per firm
  const firmStats = useMemo<FirmStats[]>(() => {
    const now = new Date();
    return assignedFirms.map(firm => {
      const firmPubs = allPublications.filter(p => p.law_firm_id === firm.id);
      const pending = firmPubs.filter(p => p.status === 'a_valider').length;
      const refused = firmPubs.filter(p => p.status === 'refuse').length;
      const scheduled = firmPubs.filter(p => p.status === 'programme').length;
      const drafts = firmPubs.filter(p => p.status === 'brouillon').length;
      const published = firmPubs.filter(p => p.status === 'publie').length;
      
      // Late = scheduled but date is past
      const late = firmPubs.filter(p => {
        if (p.status !== 'programme') return false;
        const scheduledDate = new Date(p.scheduled_date);
        return scheduledDate < now;
      }).length;

      // Calculate status
      let status: 'ok' | 'attention' | 'blocked' = 'ok';
      if (refused > 0 || late > 0) {
        status = 'blocked';
      } else if (pending >= 3 || drafts > 5) {
        status = 'attention';
      }

      return {
        firm,
        pending,
        scheduled,
        drafts,
        published,
        refused,
        late,
        total: firmPubs.length,
        status,
      };
    });
  }, [assignedFirms, allPublications]);

  // Calculate global stats
  const globalStats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return {
      totalFirms: assignedFirms.length,
      totalPending: firmStats.reduce((sum, fs) => sum + fs.pending, 0),
      totalDrafts: firmStats.reduce((sum, fs) => sum + fs.drafts, 0),
      totalScheduled: firmStats.reduce((sum, fs) => sum + fs.scheduled, 0),
      totalPublished: firmStats.reduce((sum, fs) => sum + fs.published, 0),
      totalRefused: firmStats.reduce((sum, fs) => sum + fs.refused, 0),
      totalLate: firmStats.reduce((sum, fs) => sum + fs.late, 0),
      totalAtRisk: firmStats.filter(fs => fs.status === 'blocked').length,
      totalPublications30d: allPublications.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length,
      totalVolume: allPublications.length,
    };
  }, [firmStats, assignedFirms.length, allPublications]);

  return {
    assignedFirms,
    selectedFirmId,
    selectedFirm,
    allPublications,
    firmStats,
    globalStats,
    isLoading: firmsLoading || pubsLoading,
    refetch,
  };
}
