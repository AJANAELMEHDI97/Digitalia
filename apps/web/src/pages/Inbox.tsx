import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { apiRequest } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Search,
  Send,
  CheckCheck,
  Clock,
  AlertCircle,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Filter,
  RefreshCw,
  UserCheck,
  XCircle,
  MoreHorizontal,
  Inbox as InboxIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Conversation {
  id: string;
  platform: string;
  contactName: string;
  status: "open" | "assigned" | "closed";
  priority: "low" | "medium" | "high";
  assignedUserId: string | null;
  assignedUserName: string | null;
  lastMessageAt: string;
  unreadCount: number;
  tags: string[];
}

interface Message {
  id: string;
  conversationId: string;
  senderType: "internal" | "external";
  content: string;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PLATFORM_CONFIG: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; label: string }
> = {
  facebook: {
    icon: Facebook,
    color: "#1877F2",
    bg: "#E7F0FD",
    label: "Facebook",
  },
  instagram: {
    icon: Instagram,
    color: "#E1306C",
    bg: "#FCE8EF",
    label: "Instagram",
  },
  linkedin: {
    icon: Linkedin,
    color: "#0A66C2",
    bg: "#E8F0FA",
    label: "LinkedIn",
  },
  twitter: {
    icon: Twitter,
    color: "#000000",
    bg: "#F0F0F0",
    label: "X / Twitter",
  },
  youtube: { icon: Youtube, color: "#FF0000", bg: "#FFE8E8", label: "YouTube" },
};

const STATUS_CONFIG = {
  open: {
    label: "Ouvert",
    color: "text-[#f59f0d]",
    bg: "bg-[#fff9ea]",
    icon: Clock,
  },
  assigned: {
    label: "Assigné",
    color: "text-[#5b63d3]",
    bg: "bg-[#f0f1fd]",
    icon: UserCheck,
  },
  closed: {
    label: "Fermé",
    color: "text-[#9aa1b8]",
    bg: "bg-[#f5f6fb]",
    icon: CheckCheck,
  },
};

const PRIORITY_CONFIG = {
  high: { label: "Urgent", color: "text-[#ef4444]", dot: "bg-[#ef4444]" },
  medium: { label: "Normal", color: "text-[#f59f0d]", dot: "bg-[#f59f0d]" },
  low: { label: "Faible", color: "text-[#9aa1b8]", dot: "bg-[#9aa1b8]" },
};

function PlatformIcon({
  platform,
  size = "sm",
}: {
  platform: string;
  size?: "sm" | "md";
}) {
  const config = PLATFORM_CONFIG[platform] ?? PLATFORM_CONFIG.facebook;
  const Icon = config.icon;
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconDim = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div
      className={`flex ${dim} shrink-0 items-center justify-center rounded-full`}
      style={{ background: config.bg }}
    >
      <Icon className={iconDim} style={{ color: config.color }} />
    </div>
  );
}

// ─── Conversation List Item ───────────────────────────────────────────────────

function ConversationItem({
  conv,
  isSelected,
  messages,
  onClick,
}: {
  conv: Conversation;
  isSelected: boolean;
  messages: Message[];
  onClick: () => void;
}) {
  const lastMessage = messages
    .filter((m) => m.conversationId === conv.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];

  const status = STATUS_CONFIG[conv.status] ?? STATUS_CONFIG.open;
  const priority = PRIORITY_CONFIG[conv.priority] ?? PRIORITY_CONFIG.low;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border p-3.5 text-left transition-all ${
        isSelected
          ? "border-[#5b63d3] bg-[#f0f1fd] shadow-sm"
          : "border-transparent bg-white hover:border-[#e9edf7] hover:bg-[#f9f9fd]"
      }`}
    >
      <div className="flex items-start gap-3">
        <PlatformIcon platform={conv.platform} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[14px] font-semibold text-[#1f2538]">
              {conv.contactName}
            </span>
            <span className="shrink-0 text-[11px] text-[#b0b8d0]">
              {formatDistanceToNow(new Date(conv.lastMessageAt), {
                addSuffix: true,
                locale: fr,
              })}
            </span>
          </div>

          <p className="mt-0.5 truncate text-[13px] text-[#9aa1b8]">
            {lastMessage
              ? lastMessage.content
              : "Aucun message pour l'instant"}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${status.bg} ${status.color}`}
            >
              <status.icon className="h-3 w-3" />
              {status.label}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-[#9aa1b8]">
              <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
              {priority.label}
            </span>
            {conv.unreadCount > 0 && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#5b63d3] text-[10px] font-bold text-white">
                {conv.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Message Bubble ──────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isInternal = message.senderType === "internal";
  return (
    <div
      className={`flex ${isInternal ? "justify-end" : "justify-start"} mb-3`}
    >
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
          isInternal
            ? "rounded-br-md bg-[#5b63d3] text-white"
            : "rounded-bl-md border border-[#e9edf7] bg-white text-[#1f2538]"
        }`}
      >
        <p>{message.content}</p>
        <p
          className={`mt-1 text-[11px] ${isInternal ? "text-white/60" : "text-[#b0b8d0]"}`}
        >
          {formatDistanceToNow(new Date(message.createdAt), {
            addSuffix: true,
            locale: fr,
          })}
        </p>
      </div>
    </div>
  );
}

// ─── Thread Panel ────────────────────────────────────────────────────────────

function ConversationThread({
  conversation,
  messages,
  onReply,
  onClose,
  onReopen,
}: {
  conversation: Conversation;
  messages: Message[];
  onReply: (content: string) => Promise<void>;
  onClose: () => Promise<void>;
  onReopen: () => Promise<void>;
}) {
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const platform = PLATFORM_CONFIG[conversation.platform] ?? PLATFORM_CONFIG.facebook;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!replyText.trim() || sending) return;
    setSending(true);
    await onReply(replyText.trim());
    setReplyText("");
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const threadMessages = messages
    .filter((m) => m.conversationId === conversation.id)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

  return (
    <div className="flex h-full flex-col">
      {/* Thread header */}
      <div className="flex items-center justify-between border-b border-[#e9edf7] px-5 py-4">
        <div className="flex items-center gap-3">
          <PlatformIcon platform={conversation.platform} size="md" />
          <div>
            <p className="text-[15px] font-bold text-[#1f2538]">
              {conversation.contactName}
            </p>
            <p className="text-[12px] text-[#9aa1b8]">
              via {platform.label} ·{" "}
              {STATUS_CONFIG[conversation.status]?.label ?? "Ouvert"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {conversation.status !== "closed" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="gap-1 border-[#e9edf7] text-[13px] text-[#9aa1b8] hover:text-[#ef4444]"
            >
              <XCircle className="h-3.5 w-3.5" />
              Fermer
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={onReopen}
              className="gap-1 border-[#e9edf7] text-[13px] text-[#5b63d3]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Rouvrir
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {threadMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eef2ff]">
              <MessageSquare className="h-6 w-6 text-[#5b63d3]" />
            </div>
            <p className="text-[14px] text-[#9aa1b8]">
              Aucun message dans cette conversation.
            </p>
          </div>
        ) : (
          threadMessages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      {conversation.status !== "closed" && (
        <div className="border-t border-[#e9edf7] px-5 py-4">
          <div className="flex items-end gap-3">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Répondre… (Entrée pour envoyer)"
              rows={2}
              className="flex-1 resize-none rounded-xl border border-[#e9edf7] bg-[#f9f9fd] px-4 py-3 text-[14px] text-[#1f2538] outline-none placeholder:text-[#b0b8d0] focus:border-[#5b63d3]"
            />
            <Button
              onClick={handleSend}
              disabled={!replyText.trim() || sending}
              className="h-11 w-11 shrink-0 rounded-xl bg-[#5b63d3] p-0 text-white hover:bg-[#4a52c0]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-[#b0b8d0]">
            Entrée pour envoyer · Maj+Entrée pour sauter une ligne
          </p>
        </div>
      )}
      {conversation.status === "closed" && (
        <div className="border-t border-[#e9edf7] bg-[#f5f6fb] px-5 py-3 text-center text-[13px] text-[#9aa1b8]">
          Cette conversation est fermée. Rouvrez-la pour répondre.
        </div>
      )}
    </div>
  );
}

// ─── Main Inbox Page ──────────────────────────────────────────────────────────

export default function InboxPage() {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<{
        conversations: Conversation[];
        messages: Message[];
      }>("/inbox");
      setConversations(data.conversations);
      setMessages(data.messages);
      if (!selectedId && data.conversations.length > 0) {
        setSelectedId(data.conversations[0].id);
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger la boite de reception.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const handleReply = async (content: string) => {
    if (!selectedId) return;
    await apiRequest(`/inbox/${selectedId}/reply`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
    // Optimistic update
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        conversationId: selectedId,
        senderType: "internal",
        content,
        createdAt: new Date().toISOString(),
      },
    ]);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? { ...c, status: "assigned", unreadCount: 0, lastMessageAt: new Date().toISOString() }
          : c,
      ),
    );
    toast({ title: "Réponse envoyée" });
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await apiRequest(`/inbox/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setConversations((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: status as Conversation["status"] } : c,
        ),
      );
      toast({
        title:
          status === "closed"
            ? "Conversation fermée"
            : "Conversation rouverte",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
      });
    }
  };

  const filtered = conversations.filter((c) => {
    const matchSearch =
      !search ||
      c.contactName.toLowerCase().includes(search.toLowerCase());
    const matchPlatform =
      platformFilter === "all" || c.platform === platformFilter;
    const matchStatus =
      statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchPlatform && matchStatus;
  });

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  const stats = {
    open: conversations.filter((c) => c.status === "open").length,
    unread: conversations.reduce((s, c) => s + c.unreadCount, 0),
    responseRate:
      conversations.length > 0
        ? Math.round(
            (conversations.filter((c) => c.status !== "open").length /
              conversations.length) *
              100,
          )
        : 0,
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-80px)] flex-col gap-0">
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef2ff]">
              <MessageSquare className="h-5 w-5 text-[#5b63d3]" />
            </div>
            <div>
              <h1 className="text-[22px] font-bold text-[#1f2538]">
                Mon CM — Boite de réception
              </h1>
              <p className="text-[13px] text-[#9aa1b8]">
                Gérez toutes vos interactions sociales depuis un seul endroit.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInbox}
            className="gap-2 border-[#e9edf7] text-[13px]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Actualiser
          </Button>
        </div>

        {/* Stats bar */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          {[
            {
              label: "Conversations ouvertes",
              value: stats.open,
              icon: Clock,
              color: "text-[#f59f0d]",
              bg: "bg-[#fff9ea]",
            },
            {
              label: "Messages non lus",
              value: stats.unread,
              icon: AlertCircle,
              color: "text-[#ef4444]",
              bg: "bg-[#fff0f0]",
            },
            {
              label: "Taux de réponse",
              value: `${stats.responseRate}%`,
              icon: CheckCheck,
              color: "text-[#18ba7b]",
              bg: "bg-[#effff7]",
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className={`flex items-center gap-3 rounded-2xl border border-[#e9edf7] ${bg} px-4 py-3`}
            >
              <Icon className={`h-5 w-5 ${color}`} />
              <div>
                <p className={`text-[20px] font-bold ${color}`}>{value}</p>
                <p className="text-[12px] text-[#9aa1b8]">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main layout */}
        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Left panel: conversation list */}
          <div className="flex w-80 shrink-0 flex-col gap-3 overflow-hidden rounded-2xl border border-[#e9edf7] bg-white shadow-[0_4px_20px_rgba(110,122,167,0.06)]">
            {/* Filters */}
            <div className="border-b border-[#e9edf7] px-4 pt-4 pb-3 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa1b8]" />
                <Input
                  placeholder="Rechercher…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 border-[#e9edf7] bg-[#f9f9fd] pl-9 text-[13px] focus-visible:ring-[#5b63d3]"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="flex-1 rounded-lg border border-[#e9edf7] bg-[#f9f9fd] px-2 py-1.5 text-[12px] text-[#4b5270] focus:outline-none focus:ring-1 focus:ring-[#5b63d3]"
                >
                  <option value="all">Toutes plateformes</option>
                  {Object.entries(PLATFORM_CONFIG).map(([id, cfg]) => (
                    <option key={id} value={id}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 rounded-lg border border-[#e9edf7] bg-[#f9f9fd] px-2 py-1.5 text-[12px] text-[#4b5270] focus:outline-none focus:ring-1 focus:ring-[#5b63d3]"
                >
                  <option value="all">Tous statuts</option>
                  <option value="open">Ouvert</option>
                  <option value="assigned">Assigné</option>
                  <option value="closed">Fermé</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))
              ) : filtered.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
                  <InboxIcon className="h-8 w-8 text-[#d0d5ef]" />
                  <p className="text-[13px] text-[#9aa1b8]">
                    Aucune conversation trouvée.
                  </p>
                </div>
              ) : (
                filtered.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    isSelected={selectedId === conv.id}
                    messages={messages}
                    onClick={() => setSelectedId(conv.id)}
                  />
                ))
              )}
            </div>

            <div className="border-t border-[#e9edf7] px-4 py-2 text-center text-[11px] text-[#b0b8d0]">
              {filtered.length} conversation{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Right panel: message thread */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-[#e9edf7] bg-white shadow-[0_4px_20px_rgba(110,122,167,0.06)]">
            {loading ? (
              <div className="flex flex-1 items-center justify-center">
                <Skeleton className="h-40 w-80 rounded-2xl" />
              </div>
            ) : selectedConversation ? (
              <ConversationThread
                conversation={selectedConversation}
                messages={messages}
                onReply={handleReply}
                onClose={() => handleUpdateStatus(selectedConversation.id, "closed")}
                onReopen={() => handleUpdateStatus(selectedConversation.id, "open")}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#eef2ff]">
                  <MessageSquare className="h-9 w-9 text-[#5b63d3]" />
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-[#1f2538]">
                    Sélectionnez une conversation
                  </p>
                  <p className="mt-1 text-[13px] text-[#9aa1b8]">
                    Choisissez une conversation dans la liste pour afficher les
                    messages.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
