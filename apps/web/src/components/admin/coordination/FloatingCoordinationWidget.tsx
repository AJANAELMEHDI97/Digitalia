import { useState, useMemo } from "react";
import { MessageSquare, ArrowLeft, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import { useAdminCoordination } from "@/hooks/useAdminCoordination";
import { TeamMemberList } from "./TeamMemberList";
import { ConversationThread } from "./ConversationThread";
import { NewDiscussionForm } from "./NewDiscussionForm";
import { cn } from "@/lib/utils";

type RoleFilter = "all" | "community_manager" | "commercial";

const CONTEXT_OPTIONS = [
  { value: "", label: "Général" },
  { value: "cabinet", label: "Cabinet" },
  { value: "performance", label: "Performance" },
  { value: "churn", label: "Churn" },
  { value: "acquisition", label: "Acquisition" },
  { value: "upsell", label: "Upsell" },
  { value: "conformite", label: "Conformité" },
  { value: "facturation", label: "Facturation" },
  { value: "urgence", label: "Urgence" },
] as const;

export function FloatingCoordinationWidget() {
  const { isAdmin } = useSimpleRole();
  const { user } = useSimpleAuth();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [contextType, setContextType] = useState("");
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);

  const {
    teamMembers,
    conversation,
    unreadCount,
    selectedMemberId,
    setSelectedMemberId,
    sendMessage,
    markAsRead,
    loadConversation,
  } = useAdminCoordination();

  const selectedMember = useMemo(
    () => teamMembers.find((m) => m.id === selectedMemberId),
    [teamMembers, selectedMemberId]
  );

  const filteredMembers = useMemo(() => {
    if (!search) return teamMembers;
    const q = search.toLowerCase();
    return teamMembers.filter((m) => m.full_name.toLowerCase().includes(q));
  }, [teamMembers, search]);

  if (!isAdmin) return null;

  const handleSelectMember = (id: string) => {
    setSelectedMemberId(id);
    loadConversation(id);
    markAsRead(id);
    setContextType("");
  };

  const handleBack = () => {
    setSelectedMemberId(null);
    setContextType("");
  };

  const handleSend = (content: string, isUrgent: boolean) => {
    if (!selectedMemberId) return;
    const context = contextType
      ? { type: contextType, id: "", label: CONTEXT_OPTIONS.find((c) => c.value === contextType)?.label || "" }
      : undefined;
    sendMessage(selectedMemberId, content, isUrgent, context);
  };

  const handleNewDiscussionSubmit = (
    recipientId: string,
    content: string,
    isUrgent: boolean,
    context?: { type: string; id: string; label: string }
  ) => {
    sendMessage(recipientId, content, isUrgent, context);
    setShowNewDiscussion(false);
    setSelectedMemberId(recipientId);
    loadConversation(recipientId);
    markAsRead(recipientId);
  };

  const filterTabs: { key: RoleFilter; label: string }[] = [
    { key: "all", label: "Tous" },
    { key: "community_manager", label: "CM" },
    { key: "commercial", label: "Commerciaux" },
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-20 z-50 flex items-center justify-center",
          "h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg",
          "hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
        )}
        aria-label="Communication interne"
      >
        <MessageSquare className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-[10px] bg-destructive text-destructive-foreground border-2 border-background">
            {unreadCount}
          </Badge>
        )}
      </button>

      {/* Sheet panel */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[400px] sm:max-w-[400px] p-0 flex flex-col">
          {showNewDiscussion ? (
            /* ── New discussion form ── */
            <NewDiscussionForm
              teamMembers={teamMembers}
              onSubmit={handleNewDiscussionSubmit}
              onCancel={() => setShowNewDiscussion(false)}
            />
          ) : !selectedMemberId ? (
            /* ── List view ── */
            <>
              <SheetHeader className="px-4 pt-4 pb-2">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-base">Communication interne</SheetTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={() => setShowNewDiscussion(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Nouvelle discussion
                  </Button>
                </div>
              </SheetHeader>

              {/* Search */}
              <div className="px-4 pb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un membre…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-8 text-sm"
                  />
                </div>
              </div>

              {/* Role filter tabs */}
              <div className="flex gap-1 px-4 pb-2">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setRoleFilter(tab.key)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                      roleFilter === tab.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Team list */}
              <div className="flex-1 overflow-y-auto px-2">
                <TeamMemberList
                  members={filteredMembers}
                  selectedId={selectedMemberId}
                  onSelect={handleSelectMember}
                  filter={roleFilter}
                />
              </div>
            </>
          ) : (
            /* ── Conversation view ── */
            <>
              {/* Header with back button */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-semibold truncate">{selectedMember?.full_name}</span>
              </div>

              {/* Context selector */}
              <div className="flex gap-1 px-4 py-2 flex-wrap border-b border-border/30">
                {CONTEXT_OPTIONS.map((ctx) => (
                  <button
                    key={ctx.value}
                    onClick={() => setContextType(ctx.value)}
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors",
                      contextType === ctx.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {ctx.label}
                  </button>
                ))}
              </div>

              {/* Conversation thread */}
              <div className="flex-1 overflow-hidden">
                <ConversationThread
                  messages={conversation}
                  currentUserId={user?.id || ""}
                  recipientName={selectedMember?.full_name || ""}
                  onSend={handleSend}
                  contextLabel={CONTEXT_OPTIONS.find((c) => c.value === contextType)?.label}
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
