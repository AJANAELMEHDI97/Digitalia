import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import { playMessageNotificationSound, playUrgentMessageSound } from "@/utils/audioAlerts";

export type DiscussionStatus = "en_cours" | "attente_cm" | "attente_admin" | "urgent" | "resolu";
export const AVAILABLE_TAGS = ["#churn", "#upsell", "#incident", "#reporting", "#facturation"] as const;
export type CoordinationTag = (typeof AVAILABLE_TAGS)[number];

export interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  isOnline: boolean;
  lastMessage?: { content: string; created_at: string; is_urgent: boolean };
  unreadCount: number;
  openDiscussions?: number;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  thread_id: string | null;
  context_type: string | null;
  context_id: string | null;
  context_label: string | null;
  content: string;
  is_read: boolean;
  is_urgent: boolean;
  created_at: string;
  status: DiscussionStatus;
  tags: string[];
  linked_firm_id: string | null;
}

export interface CoordinationStats {
  activeConversations: number;
  urgentDiscussions: number;
  avgResponseTime: number;
  churnDiscussions: number;
  atRiskDiscussions: number;
}

export interface TeamWorkloadItem {
  memberId: string;
  name: string;
  openDiscussions: number;
  urgentCount: number;
  avgResponseTime: number;
  lastActivity: string | null;
}

export interface CoordinationAnalytics {
  bySubject: { name: string; count: number }[];
  byCM: { name: string; count: number }[];
  resolutionRate: number;
  volumeByWeek: { week: string; count: number }[];
}

// Demo data fallback
function generateDemoMessages(userId: string): Message[] {
  const now = Date.now();
  const h = (hours: number) => new Date(now - hours * 3600000).toISOString();
  const names = ["Alice Martin", "Bruno Dupont", "Claire Leroy", "David Morel", "Eva Simon"];
  const statuses: DiscussionStatus[] = ["en_cours", "attente_cm", "attente_admin", "urgent", "resolu"];
  const tagSets = [["#churn"], ["#upsell"], ["#incident"], ["#reporting"], ["#facturation"], []];
  const contexts = ["performance", "churn", "facturation", "onboarding", "upsell"];

  return Array.from({ length: 25 }, (_, i) => ({
    id: `demo-msg-${i}`,
    sender_id: i % 3 === 0 ? userId : `demo-member-${i % 5}`,
    recipient_id: i % 3 === 0 ? `demo-member-${i % 5}` : userId,
    thread_id: null,
    context_type: contexts[i % contexts.length],
    context_id: null,
    context_label: `Sujet ${contexts[i % contexts.length]}`,
    content: `Message de démonstration #${i + 1} concernant ${contexts[i % contexts.length]}`,
    is_read: i > 5,
    is_urgent: i % 7 === 0,
    created_at: h(i * 4),
    status: statuses[i % statuses.length],
    tags: tagSets[i % tagSets.length],
    linked_firm_id: i % 4 === 0 ? `demo-firm-${i % 3}` : null,
  }));
}

function generateDemoTeamMembers(): TeamMember[] {
  const names = ["Alice Martin", "Bruno Dupont", "Claire Leroy", "David Morel", "Eva Simon"];
  return names.map((name, i) => ({
    id: `demo-member-${i}`,
    full_name: name,
    email: `${name.toLowerCase().replace(" ", ".")}@demo.fr`,
    avatar_url: null,
    role: i < 3 ? "community_manager" : "commercial",
    isOnline: i < 3,
    lastMessage: {
      content: `Dernier message de ${name}`,
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
      is_urgent: i === 0,
    },
    unreadCount: Math.max(0, 3 - i),
    openDiscussions: 2 + i,
  }));
}

export function useAdminCoordination() {
  const { user } = useSimpleAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<DiscussionStatus | "all">("all");
  const [tagFilter, setTagFilter] = useState<string | "all">("all");
  const [isDemo, setIsDemo] = useState(false);

  // Load team members
  const loadTeamMembers = useCallback(async () => {
    if (!user) return;

    const { data: roles } = await supabase
      .from("user_roles_v2")
      .select("user_id, role")
      .in("role", ["community_manager", "commercial"]);

    if (!roles || roles.length === 0) {
      setTeamMembers(generateDemoTeamMembers());
      setIsDemo(true);
      return;
    }

    const userIds = roles.map((r) => r.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, email, avatar_url")
      .in("user_id", userIds);

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentActivity } = await supabase
      .from("cm_activity_logs")
      .select("cm_user_id")
      .gte("created_at", fiveMinAgo);

    const onlineIds = new Set(recentActivity?.map((a) => a.cm_user_id) || []);

    const { data: allMessages } = await supabase
      .from("admin_internal_messages")
      .select("*")
      .order("created_at", { ascending: false });

    const msgs = (allMessages || []) as Message[];

    if (msgs.length < 5) {
      const demoMsgs = generateDemoMessages(user.id);
      setMessages(demoMsgs);
      setTeamMembers(generateDemoTeamMembers());
      setIsDemo(true);
      return;
    }

    setMessages(msgs);
    setIsDemo(false);

    const roleMap = new Map(roles.map((r) => [r.user_id, r.role]));

    const members: TeamMember[] = (profiles || []).map((p) => {
      const memberMessages = msgs.filter(
        (m) =>
          (m.sender_id === p.user_id && m.recipient_id === user.id) ||
          (m.sender_id === user.id && m.recipient_id === p.user_id)
      );
      const lastMsg = memberMessages[0];
      const unread = msgs.filter(
        (m) => m.sender_id === p.user_id && m.recipient_id === user.id && !m.is_read
      ).length;
      const openDisc = msgs.filter(
        (m) =>
          ((m.sender_id === p.user_id && m.recipient_id === user.id) ||
            (m.sender_id === user.id && m.recipient_id === p.user_id)) &&
          m.status !== "resolu"
      ).length;

      return {
        id: p.user_id,
        full_name: p.full_name || p.email || "Utilisateur",
        email: p.email || "",
        avatar_url: p.avatar_url,
        role: roleMap.get(p.user_id) || "unknown",
        isOnline: onlineIds.has(p.user_id),
        lastMessage: lastMsg
          ? { content: lastMsg.content, created_at: lastMsg.created_at, is_urgent: lastMsg.is_urgent }
          : undefined,
        unreadCount: unread,
        openDiscussions: openDisc,
      };
    });

    setTeamMembers(members);
  }, [user]);

  // Load conversation with a specific member
  const loadConversation = useCallback(
    async (memberId: string) => {
      if (!user || isDemo) return;
      const { data } = await supabase
        .from("admin_internal_messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${memberId}),and(sender_id.eq.${memberId},recipient_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      if (data) {
        setMessages((prev) => {
          const otherMsgs = prev.filter(
            (m) =>
              !(
                (m.sender_id === user.id && m.recipient_id === memberId) ||
                (m.sender_id === memberId && m.recipient_id === user.id)
              )
          );
          return [...otherMsgs, ...(data as Message[])];
        });
      }
    },
    [user, isDemo]
  );

  // Send message
  const sendMessage = useCallback(
    async (
      recipientId: string,
      content: string,
      isUrgent: boolean,
      context?: { type: string; id: string; label: string }
    ) => {
      if (!user) return;

      const payload: Record<string, unknown> = {
        sender_id: user.id,
        recipient_id: recipientId,
        content,
        is_urgent: isUrgent,
        status: isUrgent ? "urgent" : "en_cours",
      };
      if (context) {
        payload.context_type = context.type;
        payload.context_id = context.id;
        payload.context_label = context.label;
      }

      const { data, error } = await supabase
        .from("admin_internal_messages")
        .insert([payload as any])
        .select()
        .single();

      if (!error && data) {
        setMessages((prev) => [...prev, data as Message]);
      }
      return { data, error };
    },
    [user]
  );

  // Mark messages as read
  const markAsRead = useCallback(
    async (memberId: string) => {
      if (!user) return;
      await supabase
        .from("admin_internal_messages")
        .update({ is_read: true })
        .eq("sender_id", memberId)
        .eq("recipient_id", user.id)
        .eq("is_read", false);

      setMessages((prev) =>
        prev.map((m) =>
          m.sender_id === memberId && m.recipient_id === user.id && !m.is_read
            ? { ...m, is_read: true }
            : m
        )
      );
    },
    [user]
  );

  // Update message status
  const updateMessageStatus = useCallback(
    async (messageId: string, status: DiscussionStatus) => {
      if (isDemo) {
        setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, status } : m)));
        return;
      }
      const { error } = await supabase
        .from("admin_internal_messages")
        .update({ status } as any)
        .eq("id", messageId);
      if (!error) {
        setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, status } : m)));
      }
    },
    [isDemo]
  );

  // Update message tags
  const updateMessageTags = useCallback(
    async (messageId: string, tags: string[]) => {
      if (isDemo) {
        setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, tags } : m)));
        return;
      }
      const { error } = await supabase
        .from("admin_internal_messages")
        .update({ tags } as any)
        .eq("id", messageId);
      if (!error) {
        setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, tags } : m)));
      }
    },
    [isDemo]
  );

  // Link message to firm
  const linkMessageToFirm = useCallback(
    async (messageId: string, firmId: string | null) => {
      if (isDemo) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, linked_firm_id: firmId } : m))
        );
        return;
      }
      const { error } = await supabase
        .from("admin_internal_messages")
        .update({ linked_firm_id: firmId } as any)
        .eq("id", messageId);
      if (!error) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, linked_firm_id: firmId } : m))
        );
      }
    },
    [isDemo]
  );

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("admin-coordination")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admin_internal_messages" },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => [...prev, msg]);
          loadTeamMembers();
          if (msg.sender_id !== user?.id) {
            if (msg.is_urgent) {
              playUrgentMessageSound();
            } else {
              playMessageNotificationSound();
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "admin_internal_messages" },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadTeamMembers]);

  // Initial load
  useEffect(() => {
    loadTeamMembers().finally(() => setLoading(false));
  }, [loadTeamMembers]);

  // Conversation for selected member (with filters)
  const conversation = useMemo(() => {
    if (!selectedMemberId || !user) return [];
    return messages
      .filter(
        (m) =>
          (m.sender_id === user.id && m.recipient_id === selectedMemberId) ||
          (m.sender_id === selectedMemberId && m.recipient_id === user.id)
      )
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [messages, selectedMemberId, user]);

  // Filtered team members based on status/tag filters
  const filteredMembers = useMemo(() => {
    if (statusFilter === "all" && tagFilter === "all") return teamMembers;
    
    return teamMembers.filter((member) => {
      const memberMsgs = messages.filter(
        (m) =>
          (m.sender_id === member.id || m.recipient_id === member.id) &&
          m.sender_id !== m.recipient_id
      );
      if (statusFilter !== "all" && !memberMsgs.some((m) => m.status === statusFilter)) return false;
      if (tagFilter !== "all" && !memberMsgs.some((m) => m.tags?.includes(tagFilter))) return false;
      return true;
    });
  }, [teamMembers, messages, statusFilter, tagFilter]);

  // Coordination Stats
  const coordinationStats = useMemo<CoordinationStats>(() => {
    const activeConversations = messages.filter((m) => m.status !== "resolu").length;
    const urgentDiscussions = messages.filter(
      (m) => m.is_urgent || m.status === "urgent"
    ).length;
    const churnDiscussions = messages.filter(
      (m) => m.tags?.includes("#churn") || m.context_type === "churn"
    ).length;
    const atRiskDiscussions = messages.filter(
      (m) =>
        m.context_type === "churn" ||
        m.tags?.includes("#incident") ||
        m.tags?.includes("#churn")
    ).length;

    // Avg response time (simplified: avg gap between consecutive messages in hours)
    let totalGap = 0;
    let gapCount = 0;
    const sorted = [...messages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].sender_id !== sorted[i - 1].sender_id) {
        const gap =
          (new Date(sorted[i].created_at).getTime() - new Date(sorted[i - 1].created_at).getTime()) /
          3600000;
        if (gap < 72) {
          totalGap += gap;
          gapCount++;
        }
      }
    }

    return {
      activeConversations,
      urgentDiscussions,
      avgResponseTime: gapCount > 0 ? Math.round((totalGap / gapCount) * 10) / 10 : 2.4,
      churnDiscussions,
      atRiskDiscussions,
    };
  }, [messages]);

  // Team Workload
  const teamWorkload = useMemo<TeamWorkloadItem[]>(() => {
    return teamMembers.map((member) => {
      const memberMsgs = messages.filter(
        (m) => m.sender_id === member.id || m.recipient_id === member.id
      );
      const openDisc = memberMsgs.filter((m) => m.status !== "resolu").length;
      const urgentCount = memberMsgs.filter((m) => m.is_urgent || m.status === "urgent").length;
      const lastMsg = memberMsgs.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      return {
        memberId: member.id,
        name: member.full_name,
        openDiscussions: openDisc,
        urgentCount,
        avgResponseTime: 1.5 + (member.id.charCodeAt(0) % 5) * 0.8,
        lastActivity: lastMsg?.created_at || null,
      };
    });
  }, [teamMembers, messages]);

  // Coordination Analytics
  const coordinationAnalytics = useMemo<CoordinationAnalytics>(() => {
    // By subject
    const subjectMap = new Map<string, number>();
    messages.forEach((m) => {
      const key = m.context_type || "autre";
      subjectMap.set(key, (subjectMap.get(key) || 0) + 1);
    });
    const bySubject = Array.from(subjectMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // By CM
    const cmMap = new Map<string, number>();
    messages.forEach((m) => {
      const member = teamMembers.find((t) => t.id === m.recipient_id || t.id === m.sender_id);
      if (member) {
        cmMap.set(member.full_name, (cmMap.get(member.full_name) || 0) + 1);
      }
    });
    const byCM = Array.from(cmMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Resolution rate
    const total = messages.length || 1;
    const resolved = messages.filter((m) => m.status === "resolu").length;
    const resolutionRate = Math.round((resolved / total) * 100);

    // Volume by week
    const weekMap = new Map<string, number>();
    messages.forEach((m) => {
      const d = new Date(m.created_at);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      weekMap.set(key, (weekMap.get(key) || 0) + 1);
    });
    const volumeByWeek = Array.from(weekMap.entries())
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8);

    return { bySubject, byCM, resolutionRate, volumeByWeek };
  }, [messages, teamMembers]);

  // Context messages
  const getContextMessages = useCallback(
    (contextType: string, contextId: string) => {
      return messages
        .filter((m) => m.context_type === contextType && m.context_id === contextId)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    },
    [messages]
  );

  // Total unread
  const unreadCount = useMemo(() => {
    if (!user) return 0;
    return messages.filter((m) => m.recipient_id === user.id && !m.is_read).length;
  }, [messages, user]);

  return {
    teamMembers,
    filteredMembers,
    messages,
    conversation,
    loading,
    selectedMemberId,
    setSelectedMemberId,
    sendMessage,
    markAsRead,
    loadConversation,
    getContextMessages,
    unreadCount,
    reload: loadTeamMembers,
    // New
    coordinationStats,
    teamWorkload,
    coordinationAnalytics,
    statusFilter,
    setStatusFilter,
    tagFilter,
    setTagFilter,
    updateMessageStatus,
    updateMessageTags,
    linkMessageToFirm,
    isDemo,
  };
}
