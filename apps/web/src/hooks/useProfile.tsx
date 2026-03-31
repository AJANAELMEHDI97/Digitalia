import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  logo_url: string | null;
  role: string | null;
  auto_validation_delay: string | null;
  onboarding_complete: boolean;
  notification_new_proposals: boolean;
  notification_reminders: boolean;
  website_url: string | null;
  cabinet_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  bar_association: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar_url?: string;
  logo_url?: string;
  role?: string;
  auto_validation_delay?: string;
  onboarding_complete?: boolean;
  notification_new_proposals?: boolean;
  notification_reminders?: boolean;
  website_url?: string;
  cabinet_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  bar_association?: string;
  bio?: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      
      if (data) {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update profile
  const updateProfile = async (updates: ProfileUpdate): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);

      if (error) throw error;

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (err) {
      console.error("Error updating profile:", err);
      return false;
    }
  };

  // Get display name
  const displayName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile?.full_name || profile?.email?.split("@")[0] || "Utilisateur";

  // Get initials
  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    : profile?.full_name
      ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
      : "U";

  // Complete onboarding
  const completeOnboarding = async () => {
    return updateProfile({ onboarding_complete: true });
  };

  // Update notification preferences
  const updateNotificationPreferences = async (
    newProposals: boolean,
    reminders: boolean
  ) => {
    return updateProfile({
      notification_new_proposals: newProposals,
      notification_reminders: reminders
    });
  };

  return {
    profile,
    loading,
    error,
    displayName,
    initials,
    updateProfile,
    completeOnboarding,
    updateNotificationPreferences,
    refetch: fetchProfile
  };
}
