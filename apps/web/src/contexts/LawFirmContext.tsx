import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useRoleSimulationSafe } from "@/contexts/RoleSimulationContext";

export type SubscriptionPlan = 'essentiel' | 'avance' | 'expert';

export interface LawFirm {
  id: string;
  name: string;
  city: string | null;
  bar_association: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  postal_code: string | null;
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean | null;
  specialization_areas: string[] | null;
  editorial_tone: string | null;
  publication_frequency: string | null;
  social_networks: string[] | null;
  subscription_plan: string | null;
}

interface LawFirmContextType {
  assignedFirms: LawFirm[];
  selectedFirmId: string | null;
  selectedFirm: LawFirm | null;
  setSelectedFirmId: (id: string | null) => void;
  isLoading: boolean;
  refetchFirms: () => Promise<void>;
}

const LawFirmContext = createContext<LawFirmContextType | undefined>(undefined);

const STORAGE_KEY = "socialpulse_selected_firm";

interface LawFirmProviderProps {
  children: ReactNode;
}

export function LawFirmProvider({ children }: LawFirmProviderProps) {
  const { user } = useAuth();
  const { isCommunityManager: realIsCM, loading: roleLoading } = useUserRole();
  const { simulatedRole } = useRoleSimulationSafe();
  const isCommunityManager = simulatedRole === 'community_manager' || realIsCM;
  
  const [assignedFirms, setAssignedFirms] = useState<LawFirm[]>([]);
  const [selectedFirmId, setSelectedFirmIdState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignedFirms = useCallback(async () => {
    if (!user?.id || roleLoading) return;

    // Only fetch for CM role
    if (!isCommunityManager) {
      setAssignedFirms([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Get CM assignments
      const { data: assignments, error: assignmentError } = await supabase
        .from("cm_assignments")
        .select("law_firm_id")
        .eq("cm_user_id", user.id)
        .eq("is_active", true);

      if (assignmentError) {
        console.error("Error fetching CM assignments:", assignmentError);
        setAssignedFirms([]);
        return;
      }

      if (!assignments || assignments.length === 0) {
        setAssignedFirms([]);
        return;
      }

      const firmIds = assignments.map(a => a.law_firm_id).filter(Boolean) as string[];

      // Fetch law firms details
      const { data: firms, error: firmsError } = await supabase
        .from("law_firms")
        .select("*")
        .in("id", firmIds)
        .eq("is_active", true);

      if (firmsError) {
        console.error("Error fetching law firms:", firmsError);
        setAssignedFirms([]);
        return;
      }

      setAssignedFirms(firms || []);

      // Auto-select first firm if none selected
      if (!selectedFirmId && firms && firms.length > 0) {
        setSelectedFirmIdState(firms[0].id);
        localStorage.setItem(STORAGE_KEY, firms[0].id);
      }
    } catch (error) {
      console.error("Error in fetchAssignedFirms:", error);
      setAssignedFirms([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isCommunityManager, roleLoading, selectedFirmId]);

  useEffect(() => {
    fetchAssignedFirms();
  }, [fetchAssignedFirms]);

  const setSelectedFirmId = useCallback((id: string | null) => {
    setSelectedFirmIdState(id);
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const selectedFirm = assignedFirms.find(f => f.id === selectedFirmId) || null;

  // Validate selected firm is in assigned list
  useEffect(() => {
    if (selectedFirmId && assignedFirms.length > 0) {
      const isValid = assignedFirms.some(f => f.id === selectedFirmId);
      if (!isValid) {
        // Reset to first assigned firm
        setSelectedFirmId(assignedFirms[0].id);
      }
    }
  }, [selectedFirmId, assignedFirms, setSelectedFirmId]);

  return (
    <LawFirmContext.Provider
      value={{
        assignedFirms,
        selectedFirmId,
        selectedFirm,
        setSelectedFirmId,
        isLoading,
        refetchFirms: fetchAssignedFirms,
      }}
    >
      {children}
    </LawFirmContext.Provider>
  );
}

export function useLawFirmContext(): LawFirmContextType {
  const context = useContext(LawFirmContext);
  if (context === undefined) {
    throw new Error("useLawFirmContext must be used within a LawFirmProvider");
  }
  return context;
}

// Safe hook that returns defaults if outside provider
export function useLawFirmContextSafe(): LawFirmContextType {
  const context = useContext(LawFirmContext);
  if (context === undefined) {
    return {
      assignedFirms: [],
      selectedFirmId: null,
      selectedFirm: null,
      setSelectedFirmId: () => {},
      isLoading: false,
      refetchFirms: async () => {},
    };
  }
  return context;
}
