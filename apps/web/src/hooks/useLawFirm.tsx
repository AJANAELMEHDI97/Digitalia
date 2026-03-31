import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { SPRole } from "@/hooks/useUserRole";

export interface LawFirm {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  logo_url: string | null;
  bar_association: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subscription_plan: string | null;
}

export interface LawFirmMember {
  id: string;
  user_id: string;
  law_firm_id: string;
  role: SPRole;
  is_primary: boolean;
  can_validate: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  profile?: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

export interface CMAssignment {
  id: string;
  cm_user_id: string;
  lawyer_user_id: string;
  law_firm_id: string | null;
  assigned_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateFirmInput {
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website_url?: string;
  logo_url?: string;
  bar_association?: string;
}

interface AddMemberInput {
  user_id: string;
  law_firm_id: string;
  role?: SPRole;
  is_primary?: boolean;
  can_validate?: boolean;
}

interface AssignCMInput {
  cm_user_id: string;
  lawyer_user_id: string;
  law_firm_id?: string;
}

export function useLawFirm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer les cabinets de l'utilisateur
  const { data: userFirms, isLoading: firmsLoading } = useQuery({
    queryKey: ["user-law-firms", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("law_firm_members")
        .select(`
          law_firm_id,
          role,
          is_primary,
          can_validate,
          law_firms:law_firm_id (*)
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Récupérer tous les cabinets (admin only)
  const { data: allFirms, isLoading: allFirmsLoading } = useQuery({
    queryKey: ["all-law-firms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("law_firms")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as LawFirm[];
    },
  });

  // Récupérer les membres d'un cabinet
  const getFirmMembers = async (firmId: string) => {
    const { data, error } = await supabase
      .from("law_firm_members")
      .select("*")
      .eq("law_firm_id", firmId);

    if (error) throw error;
    return data;
  };

  // Créer un cabinet
  const createFirmMutation = useMutation({
    mutationFn: async (firm: CreateFirmInput) => {
      const { data, error } = await supabase
        .from("law_firms")
        .insert({
          name: firm.name,
          address: firm.address,
          city: firm.city,
          postal_code: firm.postal_code,
          phone: firm.phone,
          email: firm.email,
          website_url: firm.website_url,
          logo_url: firm.logo_url,
          bar_association: firm.bar_association,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-law-firms"] });
      toast({
        title: "Cabinet créé",
        description: "Le cabinet a été créé avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le cabinet.",
        variant: "destructive",
      });
    },
  });

  // Ajouter un membre à un cabinet
  const addMemberMutation = useMutation({
    mutationFn: async (member: AddMemberInput) => {
      const { data, error } = await supabase
        .from("law_firm_members")
        .insert({
          user_id: member.user_id,
          law_firm_id: member.law_firm_id,
          role: member.role || "lawyer",
          is_primary: member.is_primary || false,
          can_validate: member.can_validate || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-law-firms"] });
      toast({
        title: "Membre ajouté",
        description: "Le membre a été ajouté au cabinet.",
      });
    },
  });

  // Affectation CM
  const assignCMMutation = useMutation({
    mutationFn: async (assignment: AssignCMInput) => {
      const { data, error } = await supabase
        .from("cm_assignments")
        .insert({
          cm_user_id: assignment.cm_user_id,
          lawyer_user_id: assignment.lawyer_user_id,
          law_firm_id: assignment.law_firm_id,
          assigned_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cm-assignments"] });
      toast({
        title: "Affectation créée",
        description: "Le Community Manager a été affecté.",
      });
    },
  });

  // Récupérer les affectations CM de l'utilisateur
  const { data: cmAssignments } = useQuery({
    queryKey: ["cm-assignments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("cm_assignments")
        .select("*")
        .or(`cm_user_id.eq.${user.id},lawyer_user_id.eq.${user.id}`)
        .eq("is_active", true);

      if (error) throw error;
      return data as CMAssignment[];
    },
    enabled: !!user?.id,
  });

  return {
    // Cabinets de l'utilisateur
    userFirms,
    firmsLoading,
    
    // Tous les cabinets (admin)
    allFirms,
    allFirmsLoading,
    
    // Affectations CM
    cmAssignments,
    
    // Actions
    createFirm: createFirmMutation.mutate,
    addMember: addMemberMutation.mutate,
    assignCM: assignCMMutation.mutate,
    getFirmMembers,
    
    // États de chargement
    isCreatingFirm: createFirmMutation.isPending,
    isAddingMember: addMemberMutation.isPending,
    isAssigningCM: assignCMMutation.isPending,
  };
}
