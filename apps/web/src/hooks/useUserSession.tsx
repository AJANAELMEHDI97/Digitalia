import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { SPRole } from "@/hooks/useUserRole";
import type { Profile } from "@/hooks/useProfile";
import type { LawFirm, CMAssignment } from "@/hooks/useLawFirm";

interface UserFirmMembership {
  law_firm_id: string;
  role: SPRole;
  is_primary: boolean;
  can_validate: boolean;
  law_firms: LawFirm;
}

interface UserSessionData {
  profile: Profile | null;
  roles: SPRole[];
  firms: UserFirmMembership[];
  cm_assignments: CMAssignment[];
}

interface UseUserSessionReturn {
  // Session data
  profile: Profile | null;
  roles: SPRole[];
  firms: UserFirmMembership[];
  cmAssignments: CMAssignment[];
  
  // Computed role checks
  primaryRole: SPRole | null;
  isSuperAdmin: boolean;
  isFinance: boolean;
  isOpsAdmin: boolean;
  isCommercial: boolean;
  isCommunityManager: boolean;
  isLawyer: boolean;
  isLawyerAssistant: boolean;
  isSupport: boolean;
  isDemoObserver: boolean;
  isInternalAdmin: boolean;
  
  // Permissions
  canViewGlobalDashboard: boolean;
  canViewCabinetDashboard: boolean;
  canCreatePublications: boolean;
  canValidatePublications: boolean;
  canPublishDirectly: boolean;
  canAccessAdmin: boolean;
  canAccessFinance: boolean;
  isReadOnlyMode: boolean;
  isDemoMode: boolean;
  
  // Profile helpers
  displayName: string;
  initials: string;
  
  // Loading state
  loading: boolean;
  isError: boolean;
  
  // Actions
  refetch: () => void;
}

// Role priority (highest to lowest)
const ROLE_PRIORITY: SPRole[] = [
  "super_admin",
  "finance",
  "ops_admin",
  "commercial",
  "community_manager",
  "lawyer",
  "lawyer_assistant",
  "support",
  "demo_observer"
];

export function useUserSession(): UseUserSessionReturn {
  const { user } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['user-session', user?.id],
    queryFn: async (): Promise<UserSessionData> => {
      if (!user?.id) {
        return { profile: null, roles: [], firms: [], cm_assignments: [] };
      }

      const { data, error } = await supabase
        .rpc('get_user_session_data', { _user_id: user.id });

      if (error) {
        console.error("Error fetching user session:", error);
        throw error;
      }

      // Parse the JSON response - handle the unknown type safely
      const sessionData = data as unknown as UserSessionData | null;
      
      return {
        profile: sessionData?.profile || null,
        roles: sessionData?.roles || [],
        firms: sessionData?.firms || [],
        cm_assignments: sessionData?.cm_assignments || [],
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes - user data rarely changes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });

  const profile = data?.profile || null;
  const roles = data?.roles || [];
  const firms = data?.firms || [];
  const cmAssignments = data?.cm_assignments || [];

  // Get roles from law_firm_members as well (user can be a lawyer via firm membership)
  const firmRoles = firms.map(f => f.role);
  
  // Combine roles from user_roles_v2 AND law_firm_members
  const allRoles = [...new Set([...roles, ...firmRoles])];

  // Primary role (highest priority)
  const primaryRole = allRoles.length > 0
    ? ROLE_PRIORITY.find(r => allRoles.includes(r)) || allRoles[0]
    : null;

  // Role checks - check both user_roles_v2 AND law_firm_members roles
  const isSuperAdmin = allRoles.includes("super_admin");
  const isFinance = allRoles.includes("finance");
  const isOpsAdmin = allRoles.includes("ops_admin");
  const isCommercial = allRoles.includes("commercial");
  const isCommunityManager = allRoles.includes("community_manager");
  const isLawyer = allRoles.includes("lawyer") || firms.length > 0; // Any firm member is considered a lawyer
  const isLawyerAssistant = allRoles.includes("lawyer_assistant");
  const isSupport = allRoles.includes("support");
  const isDemoObserver = allRoles.includes("demo_observer");
  const isInternalAdmin = isSuperAdmin || isOpsAdmin || isFinance;

  // Permissions
  const canViewGlobalDashboard = isSuperAdmin || isFinance || isOpsAdmin || isSupport;
  const canViewCabinetDashboard = isLawyer || isCommunityManager || isLawyerAssistant;
  const canCreatePublications = isCommunityManager || isLawyer;
  const canValidatePublications = isLawyer;
  const canPublishDirectly = isLawyer || isCommunityManager;
  const canAccessAdmin = isSuperAdmin || isOpsAdmin;
  const canAccessFinance = isSuperAdmin || isFinance;
  const isReadOnlyMode = isLawyerAssistant || isDemoObserver || isSupport || 
    (isCommercial && !isSuperAdmin && !isOpsAdmin);
  const isDemoMode = isCommercial || isDemoObserver;

  // Profile helpers
  const displayName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile?.full_name || profile?.email?.split("@")[0] || "Utilisateur";

  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    : profile?.full_name
      ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
      : "U";

  return {
    // Session data
    profile,
    roles,
    firms,
    cmAssignments,
    
    // Computed role checks
    primaryRole,
    isSuperAdmin,
    isFinance,
    isOpsAdmin,
    isCommercial,
    isCommunityManager,
    isLawyer,
    isLawyerAssistant,
    isSupport,
    isDemoObserver,
    isInternalAdmin,
    
    // Permissions
    canViewGlobalDashboard,
    canViewCabinetDashboard,
    canCreatePublications,
    canValidatePublications,
    canPublishDirectly,
    canAccessAdmin,
    canAccessFinance,
    isReadOnlyMode,
    isDemoMode,
    
    // Profile helpers
    displayName,
    initials,
    
    // Loading state
    loading: isLoading,
    isError,
    
    // Actions
    refetch,
  };
}
