import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AutoValidationDelay = null | "24h" | "48h";

// Safety threshold: 2 hours before scheduled publication
const SAFETY_THRESHOLD_HOURS = 2;

export interface AutoValidationInfo {
  hours: number;
  minutes: number;
  isBlocked: boolean;
  blockReason?: string;
}

export function useAutoValidation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Use React Query for caching the delay setting
  const { data: delay = null, isLoading: loading } = useQuery({
    queryKey: ['auto-validation-delay', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("auto_validation_delay")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !data) return null;
      return data.auto_validation_delay as AutoValidationDelay;
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes - rarely changes
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const updateDelay = useCallback(async (newDelay: AutoValidationDelay) => {
    if (!user) return false;

    const { error } = await supabase
      .from("profiles")
      .update({ auto_validation_delay: newDelay })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating auto validation delay:", error);
      return false;
    }

    // Update cache
    queryClient.setQueryData(['auto-validation-delay', user.id], newDelay);
    return true;
  }, [user, queryClient]);

  // Calculate remaining time for a publication with 2h safety rule
  const getAutoValidationInfo = useCallback((
    createdAt: string, 
    scheduledDate: string, 
    scheduledTime: string
  ): AutoValidationInfo | null => {
    if (!delay) return null;

    const created = new Date(createdAt);
    const delayHours = delay === "24h" ? 24 : 48;
    const autoValidationTime = new Date(created.getTime() + delayHours * 60 * 60 * 1000);
    const now = new Date();

    // Parse scheduled publication time
    const [hours, minutes] = scheduledTime.split(":").map(Number);
    const publicationTime = new Date(scheduledDate);
    publicationTime.setHours(hours, minutes, 0, 0);

    // Check if auto-validation would happen within 2 hours of publication
    const timeBeforePublication = publicationTime.getTime() - autoValidationTime.getTime();
    const hoursBeforePublication = timeBeforePublication / (60 * 60 * 1000);

    if (hoursBeforePublication < SAFETY_THRESHOLD_HOURS) {
      return {
        hours: 0,
        minutes: 0,
        isBlocked: true,
        blockReason: `La validation automatique est désactivée à moins de ${SAFETY_THRESHOLD_HOURS}h de la publication.`
      };
    }

    // Calculate remaining time until auto-validation
    const remainingMs = autoValidationTime.getTime() - now.getTime();

    if (remainingMs <= 0) {
      return { hours: 0, minutes: 0, isBlocked: false };
    }

    const remainingHours = Math.floor(remainingMs / (60 * 60 * 1000));
    const remainingMinutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));

    return { 
      hours: remainingHours, 
      minutes: remainingMinutes, 
      isBlocked: false 
    };
  }, [delay]);

  // Legacy function for backward compatibility
  const getTimeRemaining = useCallback((createdAt: string): { hours: number; minutes: number } | null => {
    if (!delay) return null;

    const created = new Date(createdAt);
    const delayHours = delay === "24h" ? 24 : 48;
    const expiresAt = new Date(created.getTime() + delayHours * 60 * 60 * 1000);
    const now = new Date();

    const remainingMs = expiresAt.getTime() - now.getTime();

    if (remainingMs <= 0) return { hours: 0, minutes: 0 };

    const hours = Math.floor(remainingMs / (60 * 60 * 1000));
    const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));

    return { hours, minutes };
  }, [delay]);

  return {
    delay,
    loading,
    updateDelay,
    getTimeRemaining,
    getAutoValidationInfo,
  };
}
