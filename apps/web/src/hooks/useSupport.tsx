import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface SupportConversation {
  id: string;
  user_id: string;
  subject: string;
  reason: string;
  linked_publication_id: string | null;
  status: "open" | "closed" | "pending";
  source: "chat" | "email";
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export interface SupportMessage {
  id: string;
  conversation_id: string;
  content: string;
  sender: "user" | "cm" | "ai";
  is_read: boolean;
  created_at: string;
}

export function useSupport() {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("support_conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (fetchError) throw fetchError;
      
      // Type cast to match our interface
      const typedData = (data || []).map(conv => ({
        ...conv,
        status: conv.status as "open" | "closed" | "pending",
        source: (conv.source || "chat") as "chat" | "email"
      }));
      
      setConversations(typedData);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch conversations");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("support_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;
      
      // Type cast to match our interface
      const typedData = (data || []).map(msg => ({
        ...msg,
        sender: msg.sender as "user" | "cm" | "ai"
      }));
      
      setMessages(typedData);
      setActiveConversation(conversationId);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }, []);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!activeConversation) return;

    const channel = supabase
      .channel("support-messages-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `conversation_id=eq.${activeConversation}`
        },
        (payload) => {
          const newMessage = payload.new as SupportMessage;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Create a new conversation
  const createConversation = async (
    subject: string,
    reason: string,
    linkedPublicationId?: string
  ): Promise<SupportConversation | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("support_conversations")
        .insert({
          user_id: user.id,
          subject,
          reason,
          linked_publication_id: linkedPublicationId || null
        })
        .select()
        .single();

      if (error) throw error;

      const typedData = {
        ...data,
        status: data.status as "open" | "closed" | "pending",
        source: (data.source || "chat") as "chat" | "email"
      };

      setConversations(prev => [typedData, ...prev]);
      return typedData;
    } catch (err) {
      console.error("Error creating conversation:", err);
      return null;
    }
  };

  // Send a message
  const sendMessage = async (
    conversationId: string,
    content: string
  ): Promise<SupportMessage | null> => {
    try {
      const { data, error } = await supabase
        .from("support_messages")
        .insert({
          conversation_id: conversationId,
          content,
          sender: "user"
        })
        .select()
        .single();

      if (error) throw error;

      const typedData = {
        ...data,
        sender: data.sender as "user" | "cm" | "ai"
      };

      setMessages(prev => [...prev, typedData]);

      // Update conversation's updated_at
      await supabase
        .from("support_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      return typedData;
    } catch (err) {
      console.error("Error sending message:", err);
      return null;
    }
  };

  // Close a conversation
  const closeConversation = async (conversationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("support_conversations")
        .update({ 
          status: "closed",
          closed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", conversationId);

      if (error) throw error;

      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, status: "closed" as const, closed_at: new Date().toISOString() }
            : conv
        )
      );
      return true;
    } catch (err) {
      console.error("Error closing conversation:", err);
      return false;
    }
  };

  // Reopen a conversation
  const reopenConversation = async (conversationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("support_conversations")
        .update({ 
          status: "open",
          closed_at: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", conversationId);

      if (error) throw error;

      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, status: "open" as const, closed_at: null }
            : conv
        )
      );
      return true;
    } catch (err) {
      console.error("Error reopening conversation:", err);
      return false;
    }
  };

  // Get latest conversation
  const latestConversation = conversations[0] || null;

  // Get open conversations
  const openConversations = conversations.filter(c => c.status === "open");
  
  // Get closed (archived) conversations
  const archivedConversations = conversations.filter(c => c.status === "closed");

  // Get unread message count
  const unreadCount = messages.filter(m => !m.is_read && m.sender !== "user").length;

  return {
    conversations,
    openConversations,
    archivedConversations,
    messages,
    activeConversation,
    loading,
    error,
    latestConversation,
    unreadCount,
    fetchConversations,
    fetchMessages,
    createConversation,
    sendMessage,
    closeConversation,
    reopenConversation,
    setActiveConversation
  };
}
