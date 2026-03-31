import { useUserRole } from "./useUserRole";

/**
 * Hook pour déterminer si l'utilisateur est en mode lecture seule
 * Rôles concernés : lawyer_assistant, commercial, demo_observer, support
 */
export function useReadOnlyMode() {
  const { 
    isLawyerAssistant, 
    isCommercial, 
    isDemoObserver, 
    isSupport,
    isSuperAdmin,
    isOpsAdmin,
    loading 
  } = useUserRole();

  // Commercial peut avoir accès écriture pour l'onboarding, 
  // mais lecture seule pour le reste
  const isReadOnly = isLawyerAssistant || isDemoObserver || isSupport || 
    (isCommercial && !isSuperAdmin && !isOpsAdmin);

  return {
    isReadOnly,
    loading,
    // Helpers pour afficher des messages appropriés
    readOnlyReason: isLawyerAssistant 
      ? "Assistant avocat - consultation uniquement"
      : isDemoObserver 
        ? "Mode démonstration"
        : isSupport 
          ? "Support - consultation uniquement"
          : isCommercial 
            ? "Commercial - mode démo"
            : null
  };
}
