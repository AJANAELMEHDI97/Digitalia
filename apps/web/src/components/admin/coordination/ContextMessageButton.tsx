import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MessageSquare } from "lucide-react";
import { useAdminCoordination } from "@/hooks/useAdminCoordination";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import { TeamMemberList } from "./TeamMemberList";
import { ConversationThread } from "./ConversationThread";

interface ContextMessageButtonProps {
  contextType: string;
  contextId: string;
  contextLabel: string;
}

export function ContextMessageButton({
  contextType,
  contextId,
  contextLabel,
}: ContextMessageButtonProps) {
  const { user } = useSimpleAuth();
  const [open, setOpen] = useState(false);
  const {
    teamMembers,
    selectedMemberId,
    setSelectedMemberId,
    conversation,
    sendMessage,
    markAsRead,
    loadConversation,
  } = useAdminCoordination();

  const selectedMember = teamMembers.find((m) => m.id === selectedMemberId);

  const handleSelect = (id: string) => {
    setSelectedMemberId(id);
    loadConversation(id);
    markAsRead(id);
  };

  const handleSend = (content: string, isUrgent: boolean) => {
    if (!selectedMemberId) return;
    sendMessage(selectedMemberId, content, isUrgent, {
      type: contextType,
      id: contextId,
      label: contextLabel,
    });
  };

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <MessageSquare className="h-3.5 w-3.5" />
          Discuter avec l'équipe
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b border-border/50">
          <SheetTitle className="text-sm">
            Discussion — {contextLabel}
          </SheetTitle>
        </SheetHeader>

        {!selectedMemberId ? (
          <div className="flex-1 overflow-y-auto p-2">
            <p className="text-xs text-muted-foreground px-3 py-2">
              Sélectionnez un membre de l'équipe :
            </p>
            <TeamMemberList
              members={teamMembers}
              selectedId={null}
              onSelect={handleSelect}
              filter="all"
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <button
              onClick={() => setSelectedMemberId(null)}
              className="text-xs text-primary px-4 py-2 text-left hover:underline"
            >
              ← Retour à la liste
            </button>
            <div className="flex-1 min-h-0">
              <ConversationThread
                messages={conversation}
                currentUserId={user.id}
                recipientName={selectedMember?.full_name || ""}
                onSend={handleSend}
                contextLabel={contextLabel}
              />
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
