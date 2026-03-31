import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import type {
  Publication,
  ValidationExtendedStatus,
  UrgencyLevel,
  ExpirationBehavior,
} from "./usePublications";

export interface SLASettings {
  validationSlaHours: number;
  urgentSlaHours: number;
  expirationBehavior: ExpirationBehavior;
}

export interface ValidationTimeInfo {
  hoursRemaining: number;
  minutesRemaining: number;
  percentRemaining: number;
  isExpired: boolean;
  isUrgent: boolean;
  isCritical: boolean;
  expiresAt: Date | null;
  submittedAt: Date | null;
}

export interface AuditEntry {
  id: string;
  publication_id: string;
  user_id: string;
  action: string;
  previous_status: string | null;
  new_status: string | null;
  comment: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

const DEFAULT_SLA_SETTINGS: SLASettings = {
  validationSlaHours: 48,
  urgentSlaHours: 12,
  expirationBehavior: "do_not_publish",
};

const getStorageKey = (userId: string) => `socialpulse-validation-sla:${userId}`;

const readStoredSettings = (userId?: string | null): SLASettings => {
  if (!userId || typeof window === "undefined") {
    return DEFAULT_SLA_SETTINGS;
  }

  const raw = window.localStorage.getItem(getStorageKey(userId));
  if (!raw) {
    return DEFAULT_SLA_SETTINGS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SLASettings>;
    return {
      validationSlaHours: parsed.validationSlaHours ?? DEFAULT_SLA_SETTINGS.validationSlaHours,
      urgentSlaHours: parsed.urgentSlaHours ?? DEFAULT_SLA_SETTINGS.urgentSlaHours,
      expirationBehavior:
        parsed.expirationBehavior ?? DEFAULT_SLA_SETTINGS.expirationBehavior,
    };
  } catch {
    return DEFAULT_SLA_SETTINGS;
  }
};

const persistSettings = (userId: string, settings: SLASettings) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(settings));
};

export const VALIDATION_STATUS_LABELS: Record<ValidationExtendedStatus, string> = {
  draft: "Brouillon",
  cm_review: "A verifier (CM)",
  submitted_to_lawyer: "Envoye a l'avocat",
  in_lawyer_review: "En validation avocat",
  validated: "Valide",
  refused: "Refuse",
  modified_by_lawyer: "Modification demandee",
  expired: "Expire",
  published: "Publie",
};

export const VALIDATION_STATUS_COLORS: Record<ValidationExtendedStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  cm_review: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  submitted_to_lawyer: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  in_lawyer_review: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  validated: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  refused: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  modified_by_lawyer: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  expired: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
  published: "bg-emerald-500 text-white",
};

export function useValidationSLA() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: slaSettings = DEFAULT_SLA_SETTINGS, isLoading: settingsLoading } = useQuery({
    queryKey: ["sla-settings", user?.id],
    queryFn: async (): Promise<SLASettings> => readStoredSettings(user?.id),
    enabled: Boolean(user),
    staleTime: Infinity,
  });

  const updateSLASettings = useCallback(async (settings: Partial<SLASettings>) => {
    if (!user) return false;

    const nextSettings: SLASettings = {
      ...readStoredSettings(user.id),
      ...settings,
    };

    persistSettings(user.id, nextSettings);
    await queryClient.invalidateQueries({ queryKey: ["sla-settings", user.id] });
    toast({ title: "Succes", description: "Parametres de validation mis a jour" });
    return true;
  }, [queryClient, user]);

  const getValidationTimeInfo = useCallback((
    submittedAt: string | null | undefined,
    expiresAt: string | null | undefined,
    urgency: UrgencyLevel | null | undefined,
  ): ValidationTimeInfo => {
    if (!submittedAt || !expiresAt) {
      return {
        hoursRemaining: 0,
        minutesRemaining: 0,
        percentRemaining: 100,
        isExpired: false,
        isUrgent: urgency === "urgent",
        isCritical: false,
        expiresAt: null,
        submittedAt: null,
      };
    }

    const submitted = new Date(submittedAt);
    const expires = new Date(expiresAt);
    const now = new Date();

    const totalDuration = Math.max(expires.getTime() - submitted.getTime(), 1);
    const remaining = expires.getTime() - now.getTime();

    if (remaining <= 0) {
      return {
        hoursRemaining: 0,
        minutesRemaining: 0,
        percentRemaining: 0,
        isExpired: true,
        isUrgent: urgency === "urgent",
        isCritical: true,
        expiresAt: expires,
        submittedAt: submitted,
      };
    }

    const hoursRemaining = Math.floor(remaining / (60 * 60 * 1000));
    const minutesRemaining = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    const percentRemaining = Math.round((remaining / totalDuration) * 100);

    return {
      hoursRemaining,
      minutesRemaining,
      percentRemaining,
      isExpired: false,
      isUrgent: urgency === "urgent",
      isCritical: percentRemaining <= 20,
      expiresAt: expires,
      submittedAt: submitted,
    };
  }, []);

  const submitForValidation = useCallback(async (
    publicationId: string,
    isUrgent = false,
  ) => {
    if (!user) return false;

    try {
      await apiRequest(`/posts/${publicationId}`, {
        method: "PUT",
        body: JSON.stringify({
          status: "pending",
          approvalRequired: true,
          priority: isUrgent ? "important" : "routine",
        }),
      });

      await queryClient.invalidateQueries({ queryKey: ["publications"] });
      toast({
        title: "Succes",
        description: `Publication envoyee a l'avocat (${isUrgent ? slaSettings.urgentSlaHours : slaSettings.validationSlaHours}h)`,
      });
      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de soumettre la publication",
        variant: "destructive",
      });
      return false;
    }
  }, [queryClient, slaSettings.urgentSlaHours, slaSettings.validationSlaHours, user]);

  const validatePublication = useCallback(async (publicationId: string, comment?: string) => {
    if (!user) return false;

    try {
      await apiRequest(`/posts/${publicationId}/approve`, {
        method: "PUT",
        body: JSON.stringify({ comment: comment ?? "" }),
      });

      await queryClient.invalidateQueries({ queryKey: ["publications"] });
      toast({ title: "Succes", description: "Publication validee" });
      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de valider la publication",
        variant: "destructive",
      });
      return false;
    }
  }, [queryClient, user]);

  const refusePublication = useCallback(async (publicationId: string, reason: string) => {
    if (!user) return false;

    try {
      await apiRequest(`/posts/${publicationId}/reject`, {
        method: "PUT",
        body: JSON.stringify({ comment: reason }),
      });

      await queryClient.invalidateQueries({ queryKey: ["publications"] });
      toast({ title: "Publication refusee", description: "Le CM a ete notifie" });
      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de refuser la publication",
        variant: "destructive",
      });
      return false;
    }
  }, [queryClient, user]);

  const requestModification = useCallback(async (publicationId: string, comment: string) => {
    if (!user) return false;

    try {
      await apiRequest(`/posts/${publicationId}/request-modification`, {
        method: "PUT",
        body: JSON.stringify({ comment }),
      });

      await queryClient.invalidateQueries({ queryKey: ["publications"] });
      toast({
        title: "Modification demandee",
        description: "La publication a ete renvoyee au CM",
      });
      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de demander une modification",
        variant: "destructive",
      });
      return false;
    }
  }, [queryClient, user]);

  const fetchAuditTrail = useCallback(async (publicationId: string): Promise<AuditEntry[]> => {
    try {
      return await apiRequest<AuditEntry[]>(`/posts/${publicationId}/audit`);
    } catch (error) {
      console.error("Error fetching audit trail:", error);
      return [];
    }
  }, []);

  const filterByValidationStatus = useCallback((
    publications: Publication[],
    filter: "all" | "urgent" | "today" | "week" | "expired",
  ): Publication[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return publications.filter((publication) => {
      if (publication.status !== "a_valider") return false;

      switch (filter) {
        case "urgent":
          return (
            publication.urgency === "urgent" ||
            (publication.expires_at !== null &&
              new Date(publication.expires_at) <=
                new Date(now.getTime() + 12 * 60 * 60 * 1000))
          );
        case "today": {
          const expires = publication.expires_at ? new Date(publication.expires_at) : null;
          return expires !== null &&
            expires >= today &&
            expires < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        }
        case "week": {
          const expires = publication.expires_at ? new Date(publication.expires_at) : null;
          return expires !== null && expires >= today && expires < weekFromNow;
        }
        case "expired":
          return (
            publication.validation_status === "expired" ||
            (publication.expires_at !== null && new Date(publication.expires_at) < now)
          );
        default:
          return true;
      }
    });
  }, []);

  const approveByCM = useCallback(async (publicationId: string) => {
    return submitForValidation(publicationId);
  }, [submitForValidation]);

  const rejectByCM = useCallback(async (publicationId: string, reason: string) => {
    if (!user) return false;

    try {
      await apiRequest(`/posts/${publicationId}`, {
        method: "PUT",
        body: JSON.stringify({
          status: "rejected",
          rejectionReason: reason,
        }),
      });

      await queryClient.invalidateQueries({ queryKey: ["publications"] });
      toast({ title: "Publication rejetee", description: "Le brouillon a ete retire" });
      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de rejeter la publication",
        variant: "destructive",
      });
      return false;
    }
  }, [queryClient, user]);

  return {
    slaSettings,
    settingsLoading,
    updateSLASettings,
    getValidationTimeInfo,
    submitForValidation,
    validatePublication,
    refusePublication,
    requestModification,
    approveByCM,
    rejectByCM,
    fetchAuditTrail,
    filterByValidationStatus,
    VALIDATION_STATUS_LABELS,
    VALIDATION_STATUS_COLORS,
  };
}
