import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { playMessageNotificationSound } from "@/utils/audioAlerts";

// Status values
export type ConversationStatus = "en_attente" | "en_cours" | "en_validation" | "resolu" | "archive";
export type RequestType = "content_post" | "editorial_planning" | "performance" | "firm_settings" | "general_question";
export type Urgency = "low" | "normal" | "urgent";
export type ExpectedAction = "information" | "modification" | "validation" | "advice";
export type Channel = "chat" | "email";

export interface CMConversation {
  id: string;
  user_id: string;
  subject: string;
  reason: string;
  linked_publication_id: string | null;
  status: ConversationStatus;
  source: Channel;
  request_type: RequestType;
  urgency: Urgency;
  expected_action: ExpectedAction;
  lawyer_name: string | null;
  law_firm_name: string | null;
  last_message_preview: string | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export interface CMMessage {
  id: string;
  conversation_id: string;
  content: string;
  sender: "user" | "cm" | "ai";
  is_read: boolean;
  ai_generated: boolean;
  ai_summary: string | null;
  ai_suggested_actions: string[] | null;
  created_at: string;
}

export interface AIAssistantResponse {
  summary: string;
  suggestedResponse: string;
  recommendedActions: string[];
  suggestedRequestType: RequestType;
  suggestedUrgency: Urgency;
  suggestedExpectedAction: ExpectedAction;
}

export const STATUS_CONFIG: Record<ConversationStatus, { label: string; color: string; bgColor: string }> = {
  en_attente: { label: "En attente", color: "text-amber-700", bgColor: "bg-amber-100" },
  en_cours: { label: "En cours", color: "text-blue-700", bgColor: "bg-blue-100" },
  en_validation: { label: "En validation", color: "text-purple-700", bgColor: "bg-purple-100" },
  resolu: { label: "Résolu", color: "text-emerald-700", bgColor: "bg-emerald-100" },
  archive: { label: "Archivé", color: "text-muted-foreground", bgColor: "bg-muted" }
};

export const REQUEST_TYPE_CONFIG: Record<RequestType, { label: string; icon: string }> = {
  content_post: { label: "Contenu / publication", icon: "FileText" },
  editorial_planning: { label: "Planning éditorial", icon: "Calendar" },
  performance: { label: "Performance", icon: "BarChart2" },
  firm_settings: { label: "Paramètres cabinet", icon: "Settings" },
  general_question: { label: "Question générale", icon: "HelpCircle" }
};

export const URGENCY_CONFIG: Record<Urgency, { label: string; color: string }> = {
  low: { label: "Basse", color: "text-muted-foreground" },
  normal: { label: "Normale", color: "text-blue-600" },
  urgent: { label: "Urgente", color: "text-red-600" }
};

export const EXPECTED_ACTION_CONFIG: Record<ExpectedAction, { label: string }> = {
  information: { label: "Information" },
  modification: { label: "Modification" },
  validation: { label: "Validation" },
  advice: { label: "Conseil" }
};

// ===== DEMO DATA =====
const DEMO_CONVERSATIONS: CMConversation[] = [
  {
    id: "demo-conv-1",
    user_id: "demo-user-1",
    subject: "Modification de ma publication LinkedIn",
    reason: "Je souhaite modifier le texte de ma publication programmée pour demain",
    linked_publication_id: null,
    status: "en_attente",
    source: "chat",
    request_type: "content_post",
    urgency: "urgent",
    expected_action: "modification",
    lawyer_name: "Me Marie Dupont",
    law_firm_name: "Cabinet Dupont & Associés",
    last_message_preview: "Bonjour, j'aimerais modifier le texte de ma publication...",
    unread_count: 2,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    closed_at: null
  },
  {
    id: "demo-conv-2",
    user_id: "demo-user-2",
    subject: "Question sur mes statistiques",
    reason: "Je ne comprends pas l'évolution de mon engagement ce mois-ci",
    linked_publication_id: null,
    status: "en_cours",
    source: "email",
    request_type: "performance",
    urgency: "normal",
    expected_action: "information",
    lawyer_name: "Me Jean-Pierre Martin",
    law_firm_name: "Martin Avocats",
    last_message_preview: "Merci pour votre retour. J'ai une question supplémentaire...",
    unread_count: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    closed_at: null
  },
  {
    id: "demo-conv-3",
    user_id: "demo-user-3",
    subject: "Planning éditorial du mois prochain",
    reason: "Je voudrais revoir le planning prévu pour février",
    linked_publication_id: null,
    status: "en_validation",
    source: "chat",
    request_type: "editorial_planning",
    urgency: "normal",
    expected_action: "validation",
    lawyer_name: "Me Sophie Bernard",
    law_firm_name: "Bernard & Legrand",
    last_message_preview: "J'ai validé les modifications, pouvez-vous confirmer ?",
    unread_count: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    closed_at: null
  },
  {
    id: "demo-conv-4",
    user_id: "demo-user-4",
    subject: "Mise à jour de l'adresse du cabinet",
    reason: "Nous avons déménagé, il faut mettre à jour nos informations",
    linked_publication_id: null,
    status: "resolu",
    source: "email",
    request_type: "firm_settings",
    urgency: "low",
    expected_action: "modification",
    lawyer_name: "Me Philippe Rousseau",
    law_firm_name: "Rousseau Conseil",
    last_message_preview: "Parfait, merci pour votre réactivité !",
    unread_count: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    closed_at: null
  },
  {
    id: "demo-conv-5",
    user_id: "demo-user-5",
    subject: "Comment fonctionne l'assistant IA ?",
    reason: "Question sur les fonctionnalités de l'IA",
    linked_publication_id: null,
    status: "en_attente",
    source: "chat",
    request_type: "general_question",
    urgency: "low",
    expected_action: "information",
    lawyer_name: "Me Isabelle Lefevre",
    law_firm_name: "Lefevre & Partners",
    last_message_preview: "Bonjour, j'ai vu qu'il y avait un assistant IA...",
    unread_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    closed_at: null
  }
];

const DEMO_MESSAGES: Record<string, CMMessage[]> = {
  "demo-conv-1": [
    {
      id: "demo-msg-1-1",
      conversation_id: "demo-conv-1",
      content: "Bonjour, j'aimerais modifier le texte de ma publication LinkedIn programmée pour demain matin. Le titre ne me convient finalement pas, je voudrais quelque chose de plus accrocheur sur le thème du droit du travail.",
      sender: "user",
      is_read: true,
      ai_generated: false,
      ai_summary: null,
      ai_suggested_actions: null,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
      id: "demo-msg-1-2",
      conversation_id: "demo-conv-1",
      content: "Bonjour Me Dupont,\n\nJe prends en charge votre demande immédiatement. Pourriez-vous me préciser quel angle vous souhaiteriez pour le nouveau titre ? Par exemple :\n- Un angle plus juridique technique\n- Un angle orienté conseil pratique\n- Un angle actualité/tendance\n\nJe vous proposerai ensuite 3 alternatives.",
      sender: "cm",
      is_read: true,
      ai_generated: false,
      ai_summary: null,
      ai_suggested_actions: null,
      created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString()
    }
  ],
  "demo-conv-2": [
    {
      id: "demo-msg-2-1",
      conversation_id: "demo-conv-2",
      content: "Bonjour,\n\nJ'ai consulté mes statistiques et je constate une baisse de 15% de l'engagement ce mois-ci par rapport au mois dernier. Est-ce normal ? Y a-t-il quelque chose que nous devrions changer dans notre stratégie ?",
      sender: "user",
      is_read: true,
      ai_generated: false,
      ai_summary: null,
      ai_suggested_actions: null,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
    },
    {
      id: "demo-msg-2-2",
      conversation_id: "demo-conv-2",
      content: "Bonjour Me Martin,\n\nMerci pour votre vigilance sur vos métriques. Cette baisse peut s'expliquer par plusieurs facteurs :\n\n1. La période de fin d'année est généralement moins active sur LinkedIn\n2. L'algorithme favorise actuellement les contenus vidéo\n3. Vos publications récentes ont été postées à des horaires moins optimaux\n\nJe vous propose d'analyser en détail et de vous envoyer un rapport avec des recommandations d'ici demain.",
      sender: "cm",
      is_read: true,
      ai_generated: false,
      ai_summary: null,
      ai_suggested_actions: null,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    },
    {
      id: "demo-msg-2-3",
      conversation_id: "demo-conv-2",
      content: "Merci pour votre retour. J'ai une question supplémentaire : serait-il pertinent de tester des formats vidéo courts ? J'ai vu que certains confrères le faisaient avec succès.",
      sender: "user",
      is_read: true,
      ai_generated: false,
      ai_summary: null,
      ai_suggested_actions: null,
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
    }
  ],
  "demo-conv-3": [
    {
      id: "demo-msg-3-1",
      conversation_id: "demo-conv-3",
      content: "Bonjour,\n\nJe voudrais revoir le planning éditorial prévu pour février. J'ai plusieurs événements professionnels qui vont impacter ma disponibilité et je souhaite m'assurer que les publications sont bien alignées.",
      sender: "user",
      is_read: true,
      ai_generated: false,
      ai_summary: null,
      ai_suggested_actions: null,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    },
    {
      id: "demo-msg-3-2",
      conversation_id: "demo-conv-3",
      content: "Bonjour Me Bernard,\n\nBien sûr, voici le planning proposé pour février :\n\n📅 Semaine 1 : Article sur les nouvelles obligations RGPD\n📅 Semaine 2 : Post LinkedIn sur un cas client (anonymisé)\n📅 Semaine 3 : Infographie sur les délais de prescription\n📅 Semaine 4 : Article blog + newsletter\n\nDites-moi quelles dates vous posent problème et je réajusterai.",
      sender: "cm",
      is_read: true,
      ai_generated: false,
      ai_summary: null,
      ai_suggested_actions: null,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
    },
    {
      id: "demo-msg-3-3",
      conversation_id: "demo-conv-3",
      content: "J'ai validé les modifications, pouvez-vous confirmer que le planning est bien mis à jour dans le système ?",
      sender: "user",
      is_read: true,
      ai_generated: false,
      ai_summary: null,
      ai_suggested_actions: null,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    }
  ],
  "demo-conv-4": [
    {
      id: "demo-msg-4-1",
      conversation_id: "demo-conv-4",
      content: "Bonjour,\n\nNous avons déménagé nos locaux. Voici la nouvelle adresse : 45 rue de la Paix, 75002 Paris. Merci de mettre à jour toutes nos informations.",
      sender: "user",
      is_read: true,
      ai_generated: false,
      ai_summary: null,
      ai_suggested_actions: null,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
    },
    {
      id: "demo-msg-4-2",
      conversation_id: "demo-conv-4",
      content: "Bonjour Me Rousseau,\n\nC'est fait ! J'ai mis à jour :\n✅ Votre fiche Google Business\n✅ Votre profil LinkedIn entreprise\n✅ Les informations sur votre site web\n✅ Votre signature email\n\nN'hésitez pas si vous avez besoin d'autre chose !",
      sender: "cm",
      is_read: true,
      ai_generated: false,
      ai_summary: null,
      ai_suggested_actions: null,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    },
    {
      id: "demo-msg-4-3",
      conversation_id: "demo-conv-4",
      content: "Parfait, merci pour votre réactivité !",
      sender: "user",
      is_read: true,
      ai_generated: false,
      ai_summary: null,
      ai_suggested_actions: null,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
    }
  ],
  "demo-conv-5": [
    {
      id: "demo-msg-5-1",
      conversation_id: "demo-conv-5",
      content: "Bonjour, j'ai vu qu'il y avait un assistant IA dans l'application. Comment fonctionne-t-il exactement ? Est-ce qu'il peut rédiger des publications à ma place ?",
      sender: "user",
      is_read: false,
      ai_generated: false,
      ai_summary: null,
      ai_suggested_actions: null,
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    }
  ]
};

export function useCMMessaging() {
  const [conversations, setConversations] = useState<CMConversation[]>([]);
  const [messages, setMessages] = useState<CMMessage[]>([]);
  const [activeConversation, setActiveConversation] = useState<CMConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [useDemoData, setUseDemoData] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIAssistantResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | "all">("all");
  const [requestTypeFilter, setRequestTypeFilter] = useState<RequestType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      
      // Try to fetch real data first
      const { data, error } = await supabase
        .from("support_conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // If no real data, use demo data
      if (!data || data.length === 0) {
        setConversations(DEMO_CONVERSATIONS);
        setUseDemoData(true);
        setLoading(false);
        return;
      }

      const typedData: CMConversation[] = (data || []).map(conv => ({
        ...conv,
        status: (conv.status || "en_attente") as ConversationStatus,
        source: (conv.source || "chat") as Channel,
        request_type: (conv.request_type || "general_question") as RequestType,
        urgency: (conv.urgency || "normal") as Urgency,
        expected_action: (conv.expected_action || "information") as ExpectedAction,
        unread_count: 0
      }));

      setConversations(typedData);
      setUseDemoData(false);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      // Fallback to demo data on error
      setConversations(DEMO_CONVERSATIONS);
      setUseDemoData(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    // Check if this is a demo conversation
    if (conversationId.startsWith("demo-")) {
      setMessages(DEMO_MESSAGES[conversationId] || []);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const typedData: CMMessage[] = (data || []).map(msg => ({
        ...msg,
        sender: msg.sender as "user" | "cm" | "ai",
        ai_generated: msg.ai_generated || false,
        ai_summary: msg.ai_summary || null,
        ai_suggested_actions: msg.ai_suggested_actions as string[] | null
      }));

      setMessages(typedData);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }, []);

  // Select a conversation
  const selectConversation = useCallback(async (conversation: CMConversation) => {
    setActiveConversation(conversation);
    setAiResponse(null);
    await fetchMessages(conversation.id);
  }, [fetchMessages]);

  // Send message as CM
  const sendMessage = async (content: string, channel: "chat" | "email", aiGenerated = false): Promise<boolean> => {
    if (!activeConversation || !content.trim()) return false;

    // Handle demo data
    if (activeConversation.id.startsWith("demo-")) {
      const newMessage: CMMessage = {
        id: `demo-msg-${Date.now()}`,
        conversation_id: activeConversation.id,
        content,
        sender: "cm",
        is_read: true,
        ai_generated: aiGenerated,
        ai_summary: null,
        ai_suggested_actions: null,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMessage]);
      toast.success(`Message envoyé via ${channel === "email" ? "email" : "chat"} (démo)`);
      return true;
    }

    try {
      const { error } = await supabase
        .from("support_messages")
        .insert({
          conversation_id: activeConversation.id,
          content,
          sender: "cm",
          ai_generated: aiGenerated
        });

      if (error) throw error;

      // Update last message preview
      await supabase
        .from("support_conversations")
        .update({
          last_message_preview: content.slice(0, 100),
          updated_at: new Date().toISOString()
        })
        .eq("id", activeConversation.id);

      // Log activity
      await logActivity("message_sent", { channel, ai_generated: aiGenerated });

      await fetchMessages(activeConversation.id);
      await fetchConversations();
      
      toast.success(`Message envoyé via ${channel === "email" ? "email" : "chat"}`);
      return true;
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Erreur lors de l'envoi du message");
      return false;
    }
  };

  // Update conversation status
  const updateStatus = async (newStatus: ConversationStatus): Promise<boolean> => {
    if (!activeConversation) return false;

    // Handle demo data
    if (activeConversation.id.startsWith("demo-")) {
      setActiveConversation(prev => prev ? { ...prev, status: newStatus } : null);
      setConversations(prev => prev.map(c => 
        c.id === activeConversation.id ? { ...c, status: newStatus } : c
      ));
      toast.success(`Statut mis à jour: ${STATUS_CONFIG[newStatus].label} (démo)`);
      return true;
    }

    try {
      const updateData: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === "archive") {
        updateData.closed_at = new Date().toISOString();
      } else if (activeConversation.status === "archive") {
        updateData.closed_at = null;
      }

      const { error } = await supabase
        .from("support_conversations")
        .update(updateData)
        .eq("id", activeConversation.id);

      if (error) throw error;

      await logActivity("status_change", {
        previous_status: activeConversation.status,
        new_status: newStatus
      });

      setActiveConversation(prev => prev ? { ...prev, status: newStatus } : null);
      await fetchConversations();
      
      toast.success(`Statut mis à jour: ${STATUS_CONFIG[newStatus].label}`);
      return true;
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Erreur lors de la mise à jour du statut");
      return false;
    }
  };

  // Update qualification
  const updateQualification = async (
    requestType: RequestType,
    urgency: Urgency,
    expectedAction: ExpectedAction
  ): Promise<boolean> => {
    if (!activeConversation) return false;

    // Handle demo data
    if (activeConversation.id.startsWith("demo-")) {
      setActiveConversation(prev => prev ? {
        ...prev,
        request_type: requestType,
        urgency,
        expected_action: expectedAction
      } : null);
      toast.success("Qualification mise à jour (démo)");
      return true;
    }

    try {
      const { error } = await supabase
        .from("support_conversations")
        .update({
          request_type: requestType,
          urgency,
          expected_action: expectedAction,
          updated_at: new Date().toISOString()
        })
        .eq("id", activeConversation.id);

      if (error) throw error;

      await logActivity("qualification_updated", { requestType, urgency, expectedAction });

      setActiveConversation(prev => prev ? {
        ...prev,
        request_type: requestType,
        urgency,
        expected_action: expectedAction
      } : null);

      await fetchConversations();
      toast.success("Qualification mise à jour");
      return true;
    } catch (err) {
      console.error("Error updating qualification:", err);
      toast.error("Erreur lors de la mise à jour");
      return false;
    }
  };

  // Get AI assistance
  const getAIAssistance = async (): Promise<void> => {
    if (!activeConversation || messages.length === 0) {
      toast.error("Sélectionnez une conversation avec des messages");
      return;
    }

    // Demo fallback response
    if (activeConversation.id.startsWith("demo-")) {
      setAiLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      
      setAiResponse({
        summary: `${activeConversation.lawyer_name} souhaite ${activeConversation.request_type === "content_post" ? "modifier une publication" : activeConversation.request_type === "performance" ? "comprendre ses statistiques" : "obtenir des informations"}.`,
        suggestedResponse: `Bonjour ${activeConversation.lawyer_name?.split(" ").pop()},\n\nMerci pour votre message. Je prends en charge votre demande immédiatement.\n\n${activeConversation.request_type === "content_post" ? "Je vais procéder aux modifications demandées et vous envoie une prévisualisation dans les plus brefs délais." : "Je vais analyser votre situation et reviens vers vous avec des recommandations personnalisées."}\n\nN'hésitez pas si vous avez d'autres questions.\n\nCordialement,\nVotre Community Manager`,
        recommendedActions: [
          "Répondre rapidement au client",
          activeConversation.request_type === "content_post" ? "Préparer une nouvelle version de la publication" : "Analyser les métriques récentes",
          "Mettre à jour le statut en 'En cours'"
        ],
        suggestedRequestType: activeConversation.request_type,
        suggestedUrgency: activeConversation.urgency === "urgent" ? "urgent" : "normal",
        suggestedExpectedAction: activeConversation.expected_action
      });
      setAiLoading(false);
      toast.success("Analyse IA terminée (démo)");
      return;
    }

    try {
      setAiLoading(true);
      
      const { data, error } = await supabase.functions.invoke("cm-ai-assistant", {
        body: {
          conversationMessages: messages.map(m => ({
            sender: m.sender,
            content: m.content
          })),
          lawyerName: activeConversation.lawyer_name,
          lawFirmName: activeConversation.law_firm_name,
          requestType: activeConversation.request_type,
          action: "analyze"
        }
      });

      if (error) throw error;

      setAiResponse(data as AIAssistantResponse);
      await logActivity("ai_assistance_used", { action: "analyze" });
    } catch (err) {
      console.error("Error getting AI assistance:", err);
      toast.error("Erreur lors de l'assistance IA");
    } finally {
      setAiLoading(false);
    }
  };

  // Apply AI suggestions
  const applyAISuggestions = async () => {
    if (!aiResponse) return;

    await updateQualification(
      aiResponse.suggestedRequestType,
      aiResponse.suggestedUrgency,
      aiResponse.suggestedExpectedAction
    );
  };

  // Log activity
  const logActivity = async (actionType: string, details: Record<string, unknown>) => {
    if (!user || !activeConversation) return;

    try {
      await supabase.from("support_activity_logs").insert([{
        conversation_id: activeConversation.id,
        user_id: user.id,
        action_type: actionType,
        details: details as Record<string, string | number | boolean | null>
      }]);
    } catch (err) {
      console.error("Error logging activity:", err);
    }
  };

  // Filtered conversations
  const filteredConversations = conversations.filter(conv => {
    if (statusFilter !== "all" && conv.status !== statusFilter) return false;
    if (requestTypeFilter !== "all" && conv.request_type !== requestTypeFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        conv.subject?.toLowerCase().includes(query) ||
        conv.lawyer_name?.toLowerCase().includes(query) ||
        conv.law_firm_name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Subscribe to realtime for active conversation messages
  useEffect(() => {
    if (!activeConversation || activeConversation.id.startsWith("demo-")) return;

    const channel = supabase
      .channel(`cm-messages-${activeConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `conversation_id=eq.${activeConversation.id}`
        },
        (payload) => {
          const newMessage = payload.new as { sender: string; content: string };
          // Only show notification if it's from the user (not our own message)
          if (newMessage.sender === "user") {
            toast.info("Nouveau message reçu", {
              description: newMessage.content.slice(0, 50) + (newMessage.content.length > 50 ? "..." : ""),
              duration: 4000
            });
          }
          fetchMessages(activeConversation.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation, fetchMessages]);

  // Global subscription for new messages across all conversations
  useEffect(() => {
    const channel = supabase
      .channel("cm-global-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages"
        },
        (payload) => {
          const newMessage = payload.new as { 
            conversation_id: string; 
            sender: string; 
            content: string 
          };
          
          // Only notify for user messages not in active conversation
          if (newMessage.sender === "user" && 
              (!activeConversation || newMessage.conversation_id !== activeConversation.id)) {
            
            // Find the conversation to get lawyer name
            const conv = conversations.find(c => c.id === newMessage.conversation_id);
            const lawyerName = conv?.lawyer_name || "Un avocat";
            
            // Play notification sound for new message
            playMessageNotificationSound();
            
            toast.info(`Nouveau message de ${lawyerName}`, {
              description: newMessage.content.slice(0, 50) + (newMessage.content.length > 50 ? "..." : ""),
              duration: 5000,
              action: conv ? {
                label: "Voir",
                onClick: () => selectConversation(conv)
              } : undefined
            });
            
            // Update unread count for the conversation
            setConversations(prev => prev.map(c => 
              c.id === newMessage.conversation_id 
                ? { ...c, unread_count: c.unread_count + 1 }
                : c
            ));
          }
          
          // Refresh conversations list to get updated previews
          fetchConversations();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_conversations"
        },
        (payload) => {
          const newConv = payload.new as { lawyer_name: string | null; subject: string };
          
          // Play notification sound for new conversation
          playMessageNotificationSound();
          
          toast.info("Nouvelle conversation", {
            description: `${newConv.lawyer_name || "Un avocat"}: ${newConv.subject}`,
            duration: 5000
          });
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation, conversations, fetchConversations, selectConversation]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations: filteredConversations,
    allConversations: conversations,
    messages,
    activeConversation,
    loading,
    aiLoading,
    aiResponse,
    statusFilter,
    requestTypeFilter,
    searchQuery,
    setStatusFilter,
    setRequestTypeFilter,
    setSearchQuery,
    selectConversation,
    sendMessage,
    updateStatus,
    updateQualification,
    getAIAssistance,
    applyAISuggestions,
    setAiResponse,
    fetchConversations
  };
}
