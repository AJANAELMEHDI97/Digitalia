import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface EmailTemplate {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  content: string;
  category: string | null;
  is_system_template: boolean | null;
  html_content: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaign {
  id: string;
  user_id: string;
  name: string;
  template_id: string | null;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  total_recipients: number;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  bounce_count: number;
  unsubscribe_count: number;
  created_at: string;
  updated_at: string;
}

export interface EmailRecipient {
  id: string;
  campaign_id: string;
  email: string;
  name: string | null;
  status: string;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  unsubscribed_at: string | null;
  click_count: number;
  error_message: string | null;
  created_at: string;
}

export interface ContactList {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  contact_count: number;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  list_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export function useEmailing() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setTemplates(data as EmailTemplate[]);
    }
  }, [user]);

  const fetchCampaigns = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("email_campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setCampaigns(data as EmailCampaign[]);
    }
  }, [user]);

  const fetchContactLists = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("contact_lists")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setContactLists(data as ContactList[]);
    }
  }, [user]);

  const refetch = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchTemplates(), fetchCampaigns(), fetchContactLists()]);
    setLoading(false);
  }, [fetchTemplates, fetchCampaigns, fetchContactLists]);

  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  // Template operations
  const createTemplate = async (data: { name: string; subject: string; content: string; category?: string }) => {
    if (!user) return null;
    const { data: newTemplate, error } = await supabase
      .from("email_templates")
      .insert({ ...data, user_id: user.id })
      .select()
      .single();
    if (error) {
      toast({ title: "Erreur", description: "Impossible de créer le template", variant: "destructive" });
      return null;
    }
    toast({ title: "Succès", description: "Template créé" });
    await fetchTemplates();
    return newTemplate as EmailTemplate;
  };

  const updateTemplate = async (id: string, data: Partial<EmailTemplate>) => {
    const { error } = await supabase.from("email_templates").update(data).eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de modifier le template", variant: "destructive" });
      return false;
    }
    toast({ title: "Succès", description: "Template modifié" });
    await fetchTemplates();
    return true;
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase.from("email_templates").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer le template", variant: "destructive" });
      return false;
    }
    toast({ title: "Succès", description: "Template supprimé" });
    await fetchTemplates();
    return true;
  };

  // Campaign operations
  const createCampaign = async (data: { name: string; template_id?: string }) => {
    if (!user) return null;
    const { data: newCampaign, error } = await supabase
      .from("email_campaigns")
      .insert({ ...data, user_id: user.id })
      .select()
      .single();
    if (error) {
      toast({ title: "Erreur", description: "Impossible de créer la campagne", variant: "destructive" });
      return null;
    }
    toast({ title: "Succès", description: "Campagne créée" });
    await fetchCampaigns();
    return newCampaign as EmailCampaign;
  };

  const updateCampaign = async (id: string, data: Partial<EmailCampaign>) => {
    const { error } = await supabase.from("email_campaigns").update(data).eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de modifier la campagne", variant: "destructive" });
      return false;
    }
    await fetchCampaigns();
    return true;
  };

  const deleteCampaign = async (id: string) => {
    const { error } = await supabase.from("email_campaigns").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer la campagne", variant: "destructive" });
      return false;
    }
    toast({ title: "Succès", description: "Campagne supprimée" });
    await fetchCampaigns();
    return true;
  };

  // Contact list operations
  const createContactList = async (data: { name: string; description?: string }) => {
    if (!user) return null;
    const { data: newList, error } = await supabase
      .from("contact_lists")
      .insert({ ...data, user_id: user.id })
      .select()
      .single();
    if (error) {
      toast({ title: "Erreur", description: "Impossible de créer la liste", variant: "destructive" });
      return null;
    }
    toast({ title: "Succès", description: "Liste créée" });
    await fetchContactLists();
    return newList as ContactList;
  };

  const updateContactList = async (id: string, data: Partial<ContactList>) => {
    const { error } = await supabase.from("contact_lists").update(data).eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de modifier la liste", variant: "destructive" });
      return false;
    }
    await fetchContactLists();
    return true;
  };

  const deleteContactList = async (id: string) => {
    const { error } = await supabase.from("contact_lists").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer la liste", variant: "destructive" });
      return false;
    }
    toast({ title: "Succès", description: "Liste supprimée" });
    await fetchContactLists();
    return true;
  };

  // Contact operations
  const fetchContacts = async (listId: string) => {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("list_id", listId)
      .order("created_at", { ascending: false });
    if (error) return [];
    return data as Contact[];
  };

  const addContact = async (listId: string, data: { email: string; first_name?: string; last_name?: string; company?: string }) => {
    const { data: newContact, error } = await supabase
      .from("contacts")
      .insert({ ...data, list_id: listId })
      .select()
      .single();
    if (error) {
      toast({ title: "Erreur", description: error.message.includes("duplicate") ? "Ce contact existe déjà" : "Impossible d'ajouter le contact", variant: "destructive" });
      return null;
    }
    toast({ title: "Succès", description: "Contact ajouté" });
    await fetchContactLists();
    return newContact as Contact;
  };

  const deleteContact = async (contactId: string) => {
    const { error } = await supabase.from("contacts").delete().eq("id", contactId);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer le contact", variant: "destructive" });
      return false;
    }
    toast({ title: "Succès", description: "Contact supprimé" });
    await fetchContactLists();
    return true;
  };

  const importLawyersToList = async (listId: string, lawyerIds: string[]) => {
    if (!user) return false;
    
    // Fetch lawyers data
    const { data: lawyers, error: fetchError } = await supabase
      .from("lawyers")
      .select("email, first_name, last_name, bar_association")
      .in("id", lawyerIds)
      .not("email", "is", null);
    
    if (fetchError || !lawyers) {
      toast({ title: "Erreur", description: "Impossible de récupérer les avocats", variant: "destructive" });
      return false;
    }

    const contacts = lawyers.map(lawyer => ({
      list_id: listId,
      email: lawyer.email!,
      first_name: lawyer.first_name,
      last_name: lawyer.last_name,
      company: lawyer.bar_association,
    }));

    const { error } = await supabase.from("contacts").upsert(contacts, { onConflict: "list_id,email" });
    if (error) {
      toast({ title: "Erreur", description: "Impossible d'importer les contacts", variant: "destructive" });
      return false;
    }
    
    toast({ title: "Succès", description: `${contacts.length} contact(s) importé(s)` });
    await fetchContactLists();
    return true;
  };

  // Bulk import contacts from CSV
  const importContactsToList = async (listId: string, contacts: { email: string; first_name?: string; last_name?: string; company?: string }[]) => {
    const contactsWithListId = contacts.map(c => ({ ...c, list_id: listId }));
    const { error } = await supabase.from("contacts").insert(contactsWithListId);
    if (error) {
      throw error;
    }
    await fetchContactLists();
  };

  // Campaign recipients operations
  const fetchCampaignRecipients = async (campaignId: string): Promise<EmailRecipient[]> => {
    const { data, error } = await supabase
      .from("email_recipients")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching recipients:", error);
      return [];
    }
    return data as EmailRecipient[];
  };

  return {
    templates,
    campaigns,
    contactLists,
    loading,
    refetch,
    // Template operations
    createTemplate,
    updateTemplate,
    deleteTemplate,
    // Campaign operations
    createCampaign,
    updateCampaign,
    deleteCampaign,
    // Contact list operations
    createContactList,
    updateContactList,
    deleteContactList,
    // Contact operations
    fetchContacts,
    addContact,
    deleteContact,
    importLawyersToList,
    importContactsToList,
    // Campaign recipients
    fetchCampaignRecipients,
  };
}
