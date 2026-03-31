import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const INITIAL_MESSAGE: ChatMessage = {
  id: "1",
  sender: "ai",
  content: "Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider aujourd'hui ?",
  timestamp: new Date(),
  suggestions: ["Comment créer une publication ?", "Voir mes métriques", "Aide sur le calendrier"],
};

const AI_RESPONSES: Record<string, { response: string; suggestions: string[] }> = {
  publication: {
    response: "Pour créer une publication, rendez-vous dans l'Éditeur via le menu latéral. Vous pouvez rédiger votre contenu, ajouter des images et programmer la date de publication.",
    suggestions: ["Comment ajouter une image ?", "Programmer une publication", "Voir mes brouillons"],
  },
  métriques: {
    response: "Vos métriques sont disponibles dans la section 'Métriques' du menu. Vous y trouverez vos impressions, engagements et performances par publication.",
    suggestions: ["Comprendre le taux d'engagement", "Exporter mes données", "Meilleures publications"],
  },
  calendrier: {
    response: "Le calendrier vous permet de visualiser et planifier vos publications. Cliquez sur une date pour voir les détails ou ajouter du contenu.",
    suggestions: ["Ajouter un événement", "Voir les dates clés", "Synchroniser mon agenda"],
  },
  default: {
    response: "Je suis là pour vous aider ! N'hésitez pas à me poser des questions sur la création de publications, les métriques, ou toute autre fonctionnalité.",
    suggestions: ["Créer une publication", "Voir mes métriques", "Contacter mon CM"],
  },
};

function findBestResponse(message: string): { response: string; suggestions: string[] } {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes("publication") || lowerMessage.includes("créer") || lowerMessage.includes("post")) {
    return AI_RESPONSES.publication;
  }
  if (lowerMessage.includes("métrique") || lowerMessage.includes("performance") || lowerMessage.includes("stat")) {
    return AI_RESPONSES.métriques;
  }
  if (lowerMessage.includes("calendrier") || lowerMessage.includes("planifier") || lowerMessage.includes("date")) {
    return AI_RESPONSES.calendrier;
  }
  return AI_RESPONSES.default;
}

interface AIAssistantPopoverProps {
  onClose: () => void;
}

export function AIAssistantPopover({ onClose }: AIAssistantPopoverProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (content: string = inputValue) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const { response, suggestions } = findBestResponse(content);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content: response,
        timestamp: new Date(),
        suggestions,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-[340px] md:w-[380px] bg-card border rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">Assistant IA</h3>
          <p className="text-xs text-muted-foreground">Toujours disponible pour vous</p>
        </div>
        <Badge variant="secondary" className="text-xs">IA</Badge>
      </div>

      {/* Messages */}
      <ScrollArea className="h-[320px] p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "ai" && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p>{message.content}</p>
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(suggestion)}
                        className="text-xs px-2 py-1 rounded-full bg-background/80 hover:bg-background transition-colors text-foreground"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {message.sender === "user" && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2 items-center">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-xl px-3 py-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t bg-muted/30">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Posez votre question..."
            className="flex-1 text-sm h-9"
          />
          <Button
            onClick={() => handleSend()}
            size="icon"
            className="h-9 w-9"
            disabled={!inputValue.trim() || isTyping}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
