import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  suggestions?: string[];
  faqLink?: { question: string; id: string };
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  content: 'Bonjour ! Je suis l\'assistant IA de SocialPulse. Je peux vous aider à comprendre les fonctionnalités de la plateforme, répondre à vos questions simples ou vous orienter vers la bonne ressource. Comment puis-je vous aider ?',
  sender: 'ai',
  timestamp: new Date(),
  suggestions: [
    'Comment valider une publication ?',
    'Où voir mes statistiques ?',
    'Comment contacter mon CM ?',
  ],
};

const AI_RESPONSES: Record<string, { response: string; suggestions?: string[] }> = {
  'valider': {
    response: 'Pour valider une publication, rendez-vous dans la section "À valider" du menu principal. Cliquez sur la publication concernée, vérifiez le contenu et les visuels, puis cliquez sur le bouton "Valider". La publication sera alors programmée pour diffusion à la date prévue.',
    suggestions: ['Puis-je modifier avant validation ?', 'Quel délai pour valider ?'],
  },
  'statistiques': {
    response: 'Vos statistiques sont disponibles dans la section "Métriques" du menu. Vous y trouverez un tableau de bord avec vos indicateurs de performance, l\'évolution de votre audience et le détail par publication.',
    suggestions: ['Comment interpréter les metrics ?', 'Quelle fréquence de publication ?'],
  },
  'contact': {
    response: 'Vous pouvez contacter votre community manager depuis l\'onglet "Messagerie" de cette page. Sophie Martin est votre CM dédiée. Vous pouvez aussi prendre rendez-vous pour un appel ou une visio.',
    suggestions: ['Prendre rendez-vous', 'Voir la FAQ'],
  },
  'calendrier': {
    response: 'Le calendrier éditorial est accessible depuis le menu principal. Il affiche vos publications planifiées et les dates clés juridiques pertinentes. Vous pouvez cliquer sur une date pour voir les détails ou ajouter une nouvelle publication.',
    suggestions: ['Comment ajouter une publication ?', 'Quelles dates clés ?'],
  },
  'publication': {
    response: 'Pour créer une publication, vous pouvez soit valider et personnaliser une de nos propositions, soit créer votre propre contenu depuis le calendrier. Cliquez sur une date, puis "Nouvelle publication" pour commencer.',
    suggestions: ['Comment choisir le réseau ?', 'Formats recommandés ?'],
  },
  'default': {
    response: 'Je comprends votre question. Pour une réponse plus précise, je vous suggère de consulter notre FAQ ou de contacter directement votre community manager Sophie. Elle pourra vous accompagner de manière personnalisée.',
    suggestions: ['Voir la FAQ', 'Contacter mon CM'],
  },
};

function findBestResponse(message: string): { response: string; suggestions?: string[] } {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('valider') || lowerMessage.includes('validation')) {
    return AI_RESPONSES['valider'];
  }
  if (lowerMessage.includes('statistique') || lowerMessage.includes('métrique') || lowerMessage.includes('performance')) {
    return AI_RESPONSES['statistiques'];
  }
  if (lowerMessage.includes('contact') || lowerMessage.includes('cm') || lowerMessage.includes('community')) {
    return AI_RESPONSES['contact'];
  }
  if (lowerMessage.includes('calendrier') || lowerMessage.includes('planning') || lowerMessage.includes('date')) {
    return AI_RESPONSES['calendrier'];
  }
  if (lowerMessage.includes('publication') || lowerMessage.includes('post') || lowerMessage.includes('créer')) {
    return AI_RESPONSES['publication'];
  }
  
  return AI_RESPONSES['default'];
}

export function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (message?: string) => {
    const content = message || inputValue;
    if (!content.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const { response, suggestions } = findBestResponse(content);
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: response,
        sender: 'ai',
        timestamp: new Date(),
        suggestions,
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Assistant IA</CardTitle>
              <p className="text-xs text-muted-foreground">Réponses instantanées 24/7</p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            IA
          </Badge>
        </div>
      </CardHeader>
      
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}
            >
              {message.sender === 'ai' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              
              <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-first' : ''}`}>
                <div
                  className={`rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => handleSend(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              
              {message.sender === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Posez votre question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping}
          />
          <Button onClick={() => handleSend()} disabled={isTyping || !inputValue.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          L'assistant IA ne remplace pas votre CM. Pour un accompagnement personnalisé, contactez Sophie.
        </p>
      </div>
    </Card>
  );
}
