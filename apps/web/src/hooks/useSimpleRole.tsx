import { useEffect, useMemo, useState } from "react";
import { useRoleSimulationSafe } from "@/contexts/RoleSimulationContext";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";

export type SimpleRole = "admin" | "community_manager" | "lawyer";

export interface SimpleRoleState {
  role: SimpleRole | null;
  realRole: SimpleRole | null;
  effectiveRole: SimpleRole | null;
  loading: boolean;
  error: boolean;
  errorMessage: string | null;
  isSimulating: boolean;
  isAdmin: boolean;
  isCommunityManager: boolean;
  isLawyer: boolean;
  canCreateContent: boolean;
  canEditContent: boolean;
  canSubmitForValidation: boolean;
  canValidateContent: boolean;
  canRejectContent: boolean;
  canPublishContent: boolean;
  canManageUsers: boolean;
  canCreateUsers: boolean;
  canAssignCabinets: boolean;
  canViewAllCabinets: boolean;
  canAccessAssignedCabinets: boolean;
  canAccessOwnCabinet: boolean;
  canAccessAdmin: boolean;
  canViewMetrics: boolean;
  canViewCalendar: boolean;
  canAccessMedia: boolean;
  canAccessEmailing: boolean;
  canAccessBlog: boolean;
  isReadOnlyMode: boolean;
}

const ROLE_CACHE_KEY = "sp_simple_role_cache";

const normalizeRole = (role: unknown): SimpleRole => {
  if (role === "super_admin" || role === "ops_admin" || role === "admin") {
    return "admin";
  }

  if (role === "community_manager" || role === "editor") {
    return "community_manager";
  }

  if (role === "lawyer" || role === "reader") {
    return "lawyer";
  }

  return "admin";
};

export function useSimpleRole(): SimpleRoleState {
  const { user, loading: authLoading } = useSimpleAuth();
  const { simulatedRole, isSimulating } = useRoleSimulationSafe();
  const [realRole, setRealRole] = useState<SimpleRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      localStorage.removeItem(ROLE_CACHE_KEY);
      setRealRole(null);
      setIsLoading(false);
      return;
    }

    const nextRole = normalizeRole(user.app_metadata?.role ?? user.user_metadata?.role);
    setRealRole(nextRole);
    setIsLoading(false);
    localStorage.setItem(
      ROLE_CACHE_KEY,
      JSON.stringify({
        role: nextRole,
        userId: user.id,
        timestamp: Date.now(),
      }),
    );
  }, [authLoading, user]);

  const canSimulate = realRole === "admin";
  const effectiveSimulating = isSimulating && canSimulate && simulatedRole !== null;
  const effectiveRole = effectiveSimulating ? simulatedRole : realRole;

  const permissions = useMemo(() => {
    const isAdmin = effectiveRole === "admin";
    const isCommunityManager = effectiveRole === "community_manager";
    const isLawyer = effectiveRole === "lawyer";

    return {
      isAdmin,
      isCommunityManager,
      isLawyer,
      canCreateContent: isCommunityManager,
      canEditContent: isCommunityManager,
      canSubmitForValidation: isCommunityManager,
      canValidateContent: isLawyer,
      canRejectContent: isLawyer,
      canPublishContent: isLawyer,
      canManageUsers: isAdmin,
      canCreateUsers: isAdmin,
      canAssignCabinets: isAdmin,
      canViewAllCabinets: isAdmin,
      canAccessAssignedCabinets: isCommunityManager,
      canAccessOwnCabinet: isLawyer,
      canAccessAdmin: isAdmin,
      canViewMetrics: true,
      canViewCalendar: true,
      canAccessMedia: isCommunityManager || isLawyer,
      canAccessEmailing: isCommunityManager || isLawyer,
      canAccessBlog: isCommunityManager || isLawyer,
      isReadOnlyMode: false,
    };
  }, [effectiveRole]);

  return {
    role: realRole,
    realRole,
    effectiveRole,
    loading: authLoading || isLoading,
    error: false,
    errorMessage: null,
    isSimulating: effectiveSimulating,
    ...permissions,
  };
}

export function getSimpleRoleLabel(role: SimpleRole | null): string {
  switch (role) {
    case "admin":
      return "Super Admin";
    case "community_manager":
      return "Community Manager";
    case "lawyer":
      return "Avocat";
    default:
      return "Utilisateur";
  }
}
