import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Send, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { Message } from "@/hooks/useAdminCoordination";

interface ConversationThreadProps {
  messages: Message[];
  currentUserId: string;
  recipientName: string;
  onSend: (content: string, isUrgent: boolean) => void;
  contextLabel?: string | null;
}

export function ConversationThread({
  messages,
  currentUserId,
  recipientName,
  onSend,
  contextLabel,
}: ConversationThreadProps) {
  const [input, setInput] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed, isUrgent);
    setInput("");
    setIsUrgent(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
        <span className="font-semibold text-sm">{recipientName}</span>
        {contextLabel && (
          <Badge variant="outline" className="text-[10px] px-1.5">
            {contextLabel}
          </Badge>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        style={{ backgroundColor: "hsl(var(--muted) / 0.3)" }}
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Aucun message. Démarrez la conversation !
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id}
              className={cn("flex", isMine ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[75%] rounded-xl px-3.5 py-2 shadow-sm",
                  isMine
                    ? "bg-primary/10 text-foreground"
                    : "bg-background text-foreground border border-border/50"
                )}
              >
                {msg.context_label && (
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1 py-0 mb-1 block w-fit"
                  >
                    {msg.context_label}
                  </Badge>
                )}
                {msg.is_urgent && (
                  <Badge className="text-[9px] px-1 py-0 mb-1 bg-destructive text-destructive-foreground">
                    ⚡ Urgent
                  </Badge>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                <p className="text-[10px] text-muted-foreground mt-1 text-right">
                  {formatDistanceToNow(new Date(msg.created_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border/50">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Votre message…"
              rows={1}
              className={cn(
                "w-full resize-none rounded-lg border px-3 py-2 text-sm",
                "border-border/60 bg-background placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/30",
                "min-h-[38px] max-h-[120px]"
              )}
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
          </div>
          <Button
            variant={isUrgent ? "destructive" : "ghost"}
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => setIsUrgent(!isUrgent)}
            title={isUrgent ? "Retirer l'urgence" : "Marquer urgent"}
          >
            <AlertTriangle className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
