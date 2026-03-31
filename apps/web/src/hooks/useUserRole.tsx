import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

// Legacy système de rôles SocialPulse (9 rôles)
// Note: Le nouveau système simplifié utilise useSimpleRole avec 3 rôles
export type SPRole = 
  | "super_admin"      // Administrateur global
  | "finance"          // Administration Finance/Comptabilité
  | "ops_admin"        // Administrateur opérationnel
  | "commercial"       // Commercial/Vente/Onboarding
  | "community_manager"// Community Manager
  | "lawyer"           // Avocat (Client)
  | "lawyer_assistant" // Assistant avocat/Collaborateur
  | "support"          // Support/Customer Success
  | "demo_observer";   // Mode démonstration/Observateur

// Ancien système pour rétrocompatibilité
type LegacyAppRole = "admin" | "moderator" | "user";

interface UserRoleState {
  // Nouveau système
  roles: SPRole[];
  primaryRole: SPRole | null;
  
  // Vrais rôles (non affectés par la simulation)
  realRoles: SPRole[];
  isSimulatingRole: boolean;
  
  // Vérifications rapides par catégorie
  isSuperAdmin: boolean;
  isFinance: boolean;
  isOpsAdmin: boolean;
  isCommercial: boolean;
  isCommunityManager: boolean;
  isLawyer: boolean;
  isLawyerAssistant: boolean;
  isSupport: boolean;
  isDemoObserver: boolean;
  
  // Groupes de permissions (anciens)
  isInternalAdmin: boolean;      // super_admin, ops_admin, finance
  canManageUsers: boolean;       // super_admin, ops_admin
  canViewAllContent: boolean;    // super_admin, ops_admin, support
  canManageFinance: boolean;     // super_admin, finance
  canCreateContent: boolean;     // community_manager uniquement
  canValidateContent: boolean;   // lawyer uniquement
  canViewDemoOnly: boolean;      // demo_observer, commercial (limité)
  
  // ===== NOUVELLES PERMISSIONS GRANULAIRES =====
  
  // Dashboard & Vision
  canViewGlobalDashboard: boolean;    // Vision multi-cabinets (super_admin, finance, ops_admin, support)
  canViewCabinetDashboard: boolean;   // Vision mono-cabinet (lawyer, cm, assistant)
  
  // Contenu - Création & Modification
  canCreatePublications: boolean;     // Créer des publications (CM uniquement)
  canSuggestContent: boolean;         // Suggérer du contenu (assistant avocat)
  canEditOwnContent: boolean;         // Modifier son propre contenu (CM)
  canEditAllCabinetContent: boolean;  // Modifier tout contenu du cabinet (lawyer)
  
  // Contenu - Validation & Publication
  canSubmitForValidation: boolean;    // Soumettre à validation (CM)
  canValidatePublications: boolean;   // Valider les publications (lawyer uniquement)
  canRejectPublications: boolean;     // Refuser les publications (lawyer uniquement)
  canPublishDirectly: boolean;        // Publier directement (lawyer + CM)
  canScheduleContent: boolean;        // Programmer du contenu (lawyer + CM)
  canRequestModifications: boolean;   // Demander des modifications aux paramètres (CM)
  
  // Calendrier
  canViewCalendar: boolean;           // Voir le calendrier (tous sauf finance)
  canEditCalendar: boolean;           // Modifier le calendrier (CM, lawyer)
  
  // Canaux & Outils
  canAccessEmailing: boolean;         // Accès emailing (CM, lawyer)
  canAccessGoogleBusiness: boolean;   // Accès Google Business (CM, lawyer)
  canAccessBlog: boolean;             // Accès blog (CM, lawyer)
  canAccessMedia: boolean;            // Accès médiathèque (CM, lawyer)
  
  // Insights & Analytics
  canViewMetrics: boolean;            // Voir les métriques (CM, lawyer, support, admins)
  canViewTrends: boolean;             // Voir les tendances (CM, lawyer, assistant)
  canViewEditorialAdvice: boolean;    // Conseiller éditorial (CM, lawyer)
  
  // Administration
  canAccessAdmin: boolean;            // Accès zone admin (super_admin, ops_admin)
  canAccessFinance: boolean;          // Accès zone finance (finance, super_admin)
  canManageClients: boolean;          // Gérer les clients (commercial, ops_admin, super_admin)
  canAccessSupport: boolean;          // Accès tickets support (support, super_admin)
  
  // Paramètres
  canModifySettings: boolean;         // Modifier paramètres (lawyer, super_admin)
  canModifyProfile: boolean;          // Modifier profil (tous sauf demo_observer)
  
  // Mode spéciaux
  isReadOnlyMode: boolean;            // Mode lecture seule (assistant, commercial, demo, support)
  isDemoMode: boolean;                // Mode démonstration (commercial, demo_observer)
  
  // État
  loading: boolean;
  error: boolean;
  errorMessage: string | null;
  
  // Rétrocompatibilité avec l'ancien système
  isAdmin: boolean;  // Alias pour isSuperAdmin
  isModerator: boolean; // Alias pour isOpsAdmin
  role: LegacyAppRole | null; // Mapping vers l'ancien système
}

// Priorité des rôles (du plus élevé au plus bas)
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

// Clé de cache localStorage
const ROLES_CACHE_KEY = 'sp_user_roles_cache';

const mapRuntimeRole = (role: unknown): SPRole | null => {
  switch (role) {
    case "super_admin":
    case "finance":
    case "ops_admin":
    case "commercial":
    case "community_manager":
    case "lawyer":
    case "lawyer_assistant":
    case "support":
    case "demo_observer":
      return role;
    case "admin":
      return "super_admin";
    case "editor":
      return "community_manager";
    case "reader":
      return "lawyer";
    default:
      return null;
  }
};

// Fonction pour récupérer les rôles utilisateur avec fallback
async function fetchUserRoles(): Promise<SPRole[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      localStorage.removeItem(ROLES_CACHE_KEY);
      return [];
    }

    // Essayer d'abord le nouveau système (user_roles_v2)
    const runtimeRole = mapRuntimeRole(user.app_metadata?.role ?? user.user_metadata?.role);
    if (runtimeRole) {
      const roles = [runtimeRole];
      localStorage.setItem(ROLES_CACHE_KEY, JSON.stringify({ roles, userId: user.id, timestamp: Date.now() }));
      return roles;
    }

    const { data: newRoles, error: newError } = await supabase
      .from("user_roles_v2")
      .select("role")
      .eq("user_id", user.id);

    if (!newError && newRoles && newRoles.length > 0) {
      const roles = newRoles.map(r => r.role as SPRole);
      // Sauvegarder dans le cache local
      localStorage.setItem(ROLES_CACHE_KEY, JSON.stringify({ roles, userId: user.id, timestamp: Date.now() }));
      return roles;
    }

    // Fallback vers l'ancien système
    const { data: oldRoles, error: oldError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (!oldError && oldRoles && oldRoles.length > 0) {
      // Mapper les anciens rôles vers les nouveaux
      const roles = oldRoles.map(r => {
        if (r.role === "admin") return "super_admin";
        if (r.role === "moderator") return "ops_admin";
        return "lawyer" as SPRole;
      });
      localStorage.setItem(ROLES_CACHE_KEY, JSON.stringify({ roles, userId: user.id, timestamp: Date.now() }));
      return roles;
    }

    // Par défaut, utilisateur = lawyer
    const defaultRoles: SPRole[] = ["lawyer"];
    localStorage.setItem(ROLES_CACHE_KEY, JSON.stringify({ roles: defaultRoles, userId: user.id, timestamp: Date.now() }));
    return defaultRoles;
  } catch (error) {
    // En cas d'erreur réseau, essayer le cache local
    const cached = localStorage.getItem(ROLES_CACHE_KEY);
    if (cached) {
      try {
        const { roles, timestamp } = JSON.parse(cached);
        // Utiliser le cache s'il a moins de 24h
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          console.log("Using cached roles due to network error");
          return roles;
        }
      } catch {
        // Cache invalide
      }
    }
    throw error;
  }
}

export function useUserRole(): UserRoleState {
  const queryClient = useQueryClient();

  // Utiliser React Query pour le cache partagé entre composants
  const { data: realRoles = [], isLoading: loading, isError, error } = useQuery({
    queryKey: ['user-roles'],
    queryFn: fetchUserRoles,
    staleTime: 10 * 60 * 1000, // 10 minutes - les rôles changent rarement
    gcTime: 30 * 60 * 1000, // Garder en cache 30 minutes
    retry: 3, // Retry 3 fois avant d'échouer
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Backoff exponentiel
  });

  // Écouter les changements d'authentification pour invalider le cache
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        queryClient.invalidateQueries({ queryKey: ['user-roles'] });
        // Nettoyer le cache local si déconnexion
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem(ROLES_CACHE_KEY);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  // Note: La simulation de rôle est désormais gérée par useSimpleRole
  // Ce hook legacy n'utilise plus la simulation
  const isSimulatingRole = false;
  const roles = realRoles;

  // Déterminer le rôle principal (le plus prioritaire)
  const primaryRole = roles.length > 0
    ? ROLE_PRIORITY.find(r => roles.includes(r)) || roles[0]
    : null;

  // Vérifications individuelles
  const isSuperAdmin = roles.includes("super_admin");
  const isFinance = roles.includes("finance");
  const isOpsAdmin = roles.includes("ops_admin");
  const isCommercial = roles.includes("commercial");
  const isCommunityManager = roles.includes("community_manager");
  const isLawyer = roles.includes("lawyer");
  const isLawyerAssistant = roles.includes("lawyer_assistant");
  const isSupport = roles.includes("support");
  const isDemoObserver = roles.includes("demo_observer");

  // Groupes de permissions (anciens - rétrocompatibilité)
  const isInternalAdmin = isSuperAdmin || isOpsAdmin || isFinance;
  const canManageUsers = isSuperAdmin || isOpsAdmin;
  const canViewAllContent = isSuperAdmin || isOpsAdmin || isSupport;
  const canManageFinance = isSuperAdmin || isFinance;
  const canCreateContent = isCommunityManager || isSuperAdmin || isOpsAdmin;
  const canValidateContent = isLawyer || isSuperAdmin || isOpsAdmin;
  const canViewDemoOnly = isDemoObserver || (isCommercial && !isSuperAdmin);

  // ===== NOUVELLES PERMISSIONS GRANULAIRES =====

  // Dashboard & Vision
  const canViewGlobalDashboard = isSuperAdmin || isFinance || isOpsAdmin || isSupport;
  const canViewCabinetDashboard = isLawyer || isCommunityManager || isLawyerAssistant;

  // Contenu - Création & Modification
  const canCreatePublications = isCommunityManager || isLawyer || isSuperAdmin || isOpsAdmin;
  const canSuggestContent = isLawyerAssistant;
  const canEditOwnContent = isCommunityManager || isLawyer || isSuperAdmin || isOpsAdmin;
  const canEditAllCabinetContent = isLawyer || isSuperAdmin || isOpsAdmin;

  // Contenu - Validation & Publication
  const canSubmitForValidation = isCommunityManager || isSuperAdmin || isOpsAdmin;
  const canValidatePublications = isLawyer || isSuperAdmin || isOpsAdmin;
  const canRejectPublications = isLawyer || isSuperAdmin || isOpsAdmin;
  // CM peut publier directement selon les nouvelles specs
  const canPublishDirectly = isLawyer || isCommunityManager || isSuperAdmin || isOpsAdmin;
  const canScheduleContent = isLawyer || isCommunityManager || isSuperAdmin || isOpsAdmin;
  // CM peut demander des modifications aux paramètres du cabinet
  const canRequestModifications = isCommunityManager || isSuperAdmin || isOpsAdmin;

  // Calendrier
  const canViewCalendar = !isFinance; // Tous sauf finance
  const canEditCalendar = isCommunityManager || isLawyer || isSuperAdmin || isOpsAdmin;

  // Canaux & Outils
  const canAccessEmailing = isCommunityManager || isLawyer || isSuperAdmin;
  const canAccessGoogleBusiness = isCommunityManager || isLawyer || isSuperAdmin;
  const canAccessBlog = isCommunityManager || isLawyer || isSuperAdmin;
  const canAccessMedia = isCommunityManager || isLawyer || isSuperAdmin;

  // Insights & Analytics
  const canViewMetrics = isCommunityManager || isLawyer || isSupport || isSuperAdmin || isOpsAdmin;
  const canViewTrends = isCommunityManager || isLawyer || isLawyerAssistant || isSuperAdmin;
  const canViewEditorialAdvice = isCommunityManager || isLawyer || isSuperAdmin;

  // Administration
  const canAccessAdmin = isSuperAdmin || isOpsAdmin;
  const canAccessFinance = isSuperAdmin || isFinance;
  const canManageClients = isCommercial || isOpsAdmin || isSuperAdmin;
  const canAccessSupport = isSupport || isSuperAdmin;

  // Paramètres
  const canModifySettings = isLawyer || isSuperAdmin;
  const canModifyProfile = !isDemoObserver;

  // Modes spéciaux
  // CM n'est PAS en mode lecture seule - autonomie éditoriale complète
  const isReadOnlyMode = isLawyerAssistant || isDemoObserver || isSupport || 
    (isCommercial && !isSuperAdmin && !isOpsAdmin);
  const isDemoMode = isCommercial || isDemoObserver;

  // Mapping rétrocompatibilité
  let legacyRole: LegacyAppRole | null = null;
  if (isSuperAdmin) legacyRole = "admin";
  else if (isOpsAdmin || isFinance) legacyRole = "moderator";
  else if (roles.length > 0) legacyRole = "user";

  return {
    // Nouveau système
    roles,
    primaryRole,
    
    // Vrais rôles et état de simulation
    realRoles,
    isSimulatingRole,
    
    // Vérifications rapides
    isSuperAdmin,
    isFinance,
    isOpsAdmin,
    isCommercial,
    isCommunityManager,
    isLawyer,
    isLawyerAssistant,
    isSupport,
    isDemoObserver,
    
    // Groupes (rétrocompatibilité)
    isInternalAdmin,
    canManageUsers,
    canViewAllContent,
    canManageFinance,
    canCreateContent,
    canValidateContent,
    canViewDemoOnly,
    
    // Nouvelles permissions granulaires
    canViewGlobalDashboard,
    canViewCabinetDashboard,
    canCreatePublications,
    canSuggestContent,
    canEditOwnContent,
    canEditAllCabinetContent,
    canSubmitForValidation,
    canValidatePublications,
    canRejectPublications,
    canPublishDirectly,
    canScheduleContent,
    canRequestModifications,
    canViewCalendar,
    canEditCalendar,
    canAccessEmailing,
    canAccessGoogleBusiness,
    canAccessBlog,
    canAccessMedia,
    canViewMetrics,
    canViewTrends,
    canViewEditorialAdvice,
    canAccessAdmin,
    canAccessFinance,
    canManageClients,
    canAccessSupport,
    canModifySettings,
    canModifyProfile,
    isReadOnlyMode,
    isDemoMode,
    
    // État
    loading,
    error: isError,
    errorMessage: isError ? (error instanceof Error ? error.message : "Erreur de connexion") : null,
    
    // Rétrocompatibilité
    isAdmin: isSuperAdmin,
    isModerator: isOpsAdmin,
    role: legacyRole,
  };
}
