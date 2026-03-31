import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import { Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Users, BarChart3 } from "lucide-react";
import { useAdminCoordination } from "@/hooks/useAdminCoordination";
import { TeamMemberList } from "@/components/admin/coordination/TeamMemberList";
import { ConversationThread } from "@/components/admin/coordination/ConversationThread";
import { CoordinationKPIBar } from "@/components/admin/coordination/CoordinationKPIBar";
import { CoordinationFilters } from "@/components/admin/coordination/CoordinationFilters";
import { ConversationActions } from "@/components/admin/coordination/ConversationActions";
import { TeamWorkloadTab } from "@/components/admin/coordination/TeamWorkloadTab";
import { CoordinationStatsTab } from "@/components/admin/coordination/CoordinationStatsTab";
import type { DiscussionStatus } from "@/hooks/useAdminCoordination";

type TeamFilter = "all" | "community_manager" | "commercial";

export default function AdminCoordinationPage() {
  const { isAdmin, loading: roleLoading } = useSimpleRole();
  const { user } = useSimpleAuth();
  const {
    filteredMembers,
    conversation,
    loading,
    selectedMemberId,
    setSelectedMemberId,
    sendMessage,
    markAsRead,
    loadConversation,
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
    messages,
  } = useAdminCoordination();

  const [filter, setFilter] = useState<TeamFilter>("all");
  const [activeTab, setActiveTab] = useState("messagerie");

  if (!roleLoading && !isAdmin) return <Navigate to="/dashboard" replace />;

  const selectedMember = filteredMembers.find((m) => m.id === selectedMemberId);

  const handleSelect = (id: string) => {
    setSelectedMemberId(id);
    loadConversation(id);
    markAsRead(id);
  };

  const handleSend = (content: string, isUrgent: boolean) => {
    if (!selectedMemberId) return;
    sendMessage(selectedMemberId, content, isUrgent);
  };

  // Last message in current conversation for actions
  const lastConvMessage = conversation.length > 0 ? conversation[conversation.length - 1] : undefined;

  const handleWorkloadSelect = (memberId: string) => {
    setActiveTab("messagerie");
    handleSelect(memberId);
  };

  if (loading || roleLoading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto py-6 px-4 space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <Skeleton className="h-[500px]" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto py-6 px-4 space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Centre de coordination
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Cockpit managérial — Communication interne et pilotage d'équipe
          </p>
        </div>

        {/* KPI Bar */}
        <CoordinationKPIBar stats={coordinationStats} />

        {/* Main tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-9">
            <TabsTrigger value="messagerie" className="text-xs gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Messagerie
            </TabsTrigger>
            <TabsTrigger value="charge" className="text-xs gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Charge équipe
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-xs gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Statistiques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messagerie" className="mt-3">
            <div
              className="grid grid-cols-1 lg:grid-cols-3 gap-4"
              style={{ minHeight: "calc(100vh - 340px)" }}
            >
              {/* Left: Team list */}
              <Card className="flex flex-col overflow-hidden">
                {/* Filters */}
                <div className="px-2 pt-2 pb-1 border-b border-border/30">
                  <CoordinationFilters
                    statusFilter={statusFilter}
                    tagFilter={tagFilter}
                    onStatusChange={setStatusFilter}
                    onTagChange={setTagFilter}
                  />
                </div>
                <div className="px-3 pt-2 pb-1">
                  <Tabs value={filter} onValueChange={(v) => setFilter(v as TeamFilter)}>
                    <TabsList className="w-full h-8">
                      <TabsTrigger value="all" className="text-xs flex-1">
                        Tous
                      </TabsTrigger>
                      <TabsTrigger value="community_manager" className="text-xs flex-1">
                        CM
                      </TabsTrigger>
                      <TabsTrigger value="commercial" className="text-xs flex-1">
                        Commerciaux
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="flex-1 overflow-y-auto px-1 pb-2">
                  <TeamMemberList
                    members={filteredMembers}
                    selectedId={selectedMemberId}
                    onSelect={handleSelect}
                    filter={filter}
                  />
                </div>
              </Card>

              {/* Right: Conversation */}
              <Card className="lg:col-span-2 flex flex-col overflow-hidden">
                {!selectedMemberId ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                    <div className="text-center space-y-2">
                      <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/30" />
                      <p>Sélectionnez un membre pour démarrer une conversation</p>
                    </div>
                  </div>
                ) : user ? (
                  <>
                    <ConversationActions
                      lastMessage={lastConvMessage}
                      onStatusChange={(status) => {
                        if (lastConvMessage) updateMessageStatus(lastConvMessage.id, status);
                      }}
                      onTagsChange={(tags) => {
                        if (lastConvMessage) updateMessageTags(lastConvMessage.id, tags);
                      }}
                      onLinkFirm={() => {
                        // Simple prompt for now
                        if (lastConvMessage) {
                          const firmId = prompt("ID du cabinet à lier (ou vide pour retirer):");
                          linkMessageToFirm(lastConvMessage.id, firmId || null);
                        }
                      }}
                    />
                    <ConversationThread
                      messages={conversation}
                      currentUserId={user.id}
                      recipientName={selectedMember?.full_name || ""}
                      onSend={handleSend}
                    />
                  </>
                ) : null}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="charge" className="mt-3">
            <TeamWorkloadTab workload={teamWorkload} onSelectMember={handleWorkloadSelect} />
          </TabsContent>

          <TabsContent value="stats" className="mt-3">
            <CoordinationStatsTab analytics={coordinationAnalytics} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
