import { useState, useRef, useEffect } from "react";
import {
  Send, User, Circle, MessageCircle, Mail, Clock, Archive,
  Search, Filter, ChevronDown, Sparkles, Copy, CheckCircle,
  AlertCircle, FileText, Calendar, BarChart2, Settings, HelpCircle,
  ExternalLink, Link, ListTodo, MessageSquarePlus, Inbox, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useCMMessaging,
  CMConversation,
  ConversationStatus,
  RequestType,
  Urgency,
  ExpectedAction,
  STATUS_CONFIG,
  REQUEST_TYPE_CONFIG,
  URGENCY_CONFIG,
  EXPECTED_ACTION_CONFIG
} from "@/hooks/useCMMessaging";
import { MOCK_CM } from "@/data/mockSupport";

const RequestTypeIcon = ({ type }: { type: RequestType }) => {
  const icons = {
    content_post: FileText,
    editorial_planning: Calendar,
    performance: BarChart2,
    firm_settings: Settings,
    general_question: HelpCircle
  };
  const Icon = icons[type] || HelpCircle;
  return <Icon className="h-3.5 w-3.5" />;
};

export function CMMessaging() {
  const {
    conversations,
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
    setAiResponse
  } = useCMMessaging();

  const [inputValue, setInputValue] = useState("");
  const [localRequestType, setLocalRequestType] = useState<RequestType>("general_question");
  const [localUrgency, setLocalUrgency] = useState<Urgency>("normal");
  const [localExpectedAction, setLocalExpectedAction] = useState<ExpectedAction>("information");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (activeConversation) {
      setLocalRequestType(activeConversation.request_type);
      setLocalUrgency(activeConversation.urgency);
      setLocalExpectedAction(activeConversation.expected_action);
    }
  }, [activeConversation]);

  const handleSend = async (channel: "chat" | "email") => {
    if (!inputValue.trim() || !activeConversation) return;
    const success = await sendMessage(inputValue, channel);
    if (success) {
      setInputValue("");
    }
  };

  const handleUseSuggestedResponse = () => {
    if (aiResponse?.suggestedResponse) {
      setInputValue(aiResponse.suggestedResponse);
      toast.success("Réponse suggérée copiée");
    }
  };

  const handleSaveQualification = async () => {
    await updateQualification(localRequestType, localUrgency, localExpectedAction);
  };

  const formatDate = (dateStr: string) => {
    return format(parseISO(dateStr), "d MMM yyyy", { locale: fr });
  };

  const formatTime = (dateStr: string) => {
    return format(parseISO(dateStr), "HH:mm", { locale: fr });
  };

  return (
    <div className="flex w-full h-[calc(100vh-12rem)] min-h-[600px] gap-0 bg-muted/30 rounded-lg overflow-hidden border border-border/50">
      {/* ===== COLUMN 1: Conversation List (Fixed 320px) ===== */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-background border-r border-border/50">
        {/* Header */}
        <div className="flex-shrink-0 p-3 border-b border-border/50 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">Conversations</h2>
            <Badge variant="secondary" className="text-xs h-5 px-1.5">
              {conversations.length}
            </Badge>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-1.5">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as ConversationStatus | "all")}
            >
              <SelectTrigger className="flex-1 h-7 text-xs">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={requestTypeFilter}
              onValueChange={(v) => setRequestTypeFilter(v as RequestType | "all")}
            >
              <SelectTrigger className="flex-1 h-7 text-xs">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {Object.entries(REQUEST_TYPE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {loading ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse space-y-2 p-3 rounded-lg bg-muted/50">
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-24 bg-muted rounded" />
                        <div className="h-2.5 w-32 bg-muted rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center">
                <Inbox className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Aucune conversation</p>
                <p className="text-xs text-muted-foreground/70">Les demandes apparaîtront ici</p>
                <Button variant="outline" size="sm" className="mt-3 h-7 text-xs gap-1.5">
                  <Plus className="h-3 w-3" />
                  Nouvelle
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={activeConversation?.id === conv.id}
                    onClick={() => selectConversation(conv)}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* ===== COLUMN 2: Conversation Thread (Flexible) ===== */}
      <div className="flex-1 min-w-0 flex flex-col bg-background">
        {activeConversation ? (
          <>
            {/* Thread Header */}
            <div className="flex-shrink-0 p-3 border-b border-border/50 bg-muted/20">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {activeConversation.lawyer_name?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {activeConversation.lawyer_name || "Avocat"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activeConversation.law_firm_name || "Cabinet"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className="h-6 text-xs gap-1">
                    {activeConversation.source === "email" ? (
                      <><Mail className="h-3 w-3" /> Email</>
                    ) : (
                      <><MessageCircle className="h-3 w-3" /> Chat</>
                    )}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-6 px-2 gap-1">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] h-4 px-1.5",
                            STATUS_CONFIG[activeConversation.status].bgColor,
                            STATUS_CONFIG[activeConversation.status].color
                          )}
                        >
                          {STATUS_CONFIG[activeConversation.status].label}
                        </Badge>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <DropdownMenuItem
                          key={key}
                          onClick={() => updateStatus(key as ConversationStatus)}
                          disabled={key === "archive" && activeConversation.status !== "resolu"}
                          className="text-xs"
                        >
                          <span className={cn("w-2 h-2 rounded-full mr-2", config.bgColor)} />
                          {config.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="mt-2 p-2 bg-background rounded border border-border/50">
                <p className="text-sm font-medium truncate">{activeConversation.subject}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Créée le {formatDate(activeConversation.created_at)}
                </p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-3" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Aucun message</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn("flex gap-2", message.sender === "cm" && "justify-end")}
                    >
                      {message.sender === "user" && (
                        <Avatar className="w-7 h-7 flex-shrink-0">
                          <AvatarFallback className="text-[10px] bg-muted">
                            {activeConversation.lawyer_name?.charAt(0) || "A"}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className={cn("max-w-[70%]", message.sender === "cm" && "order-first")}>
                        <div
                          className={cn(
                            "rounded-lg p-2.5 text-sm",
                            message.sender === "user" && "bg-muted",
                            message.sender === "cm" && "bg-primary text-primary-foreground",
                            message.sender === "ai" && "bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800"
                          )}
                        >
                          {message.sender === "ai" && (
                            <span className="text-[10px] text-violet-600 dark:text-violet-400 flex items-center gap-1 mb-1">
                              <Sparkles className="h-2.5 w-2.5" /> Brouillon IA
                            </span>
                          )}
                          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 px-1">
                          {formatTime(message.created_at)}
                        </p>
                      </div>

                      {message.sender === "cm" && (
                        <Avatar className="w-7 h-7 flex-shrink-0">
                          <AvatarImage src={MOCK_CM.avatarUrl} />
                          <AvatarFallback className="text-[10px]">CM</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Reply Area */}
            {activeConversation.status !== "archive" && (
              <div className="flex-shrink-0 p-3 border-t border-border/50 bg-muted/20">
                <Textarea
                  placeholder="Rédigez votre réponse..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="min-h-[80px] resize-none text-sm mb-2"
                />
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={getAIAssistance}
                    disabled={aiLoading || messages.length === 0}
                    className="h-7 text-xs gap-1.5 text-violet-600"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {aiLoading ? "Analyse..." : "Assistance IA"}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSend("email")}
                      disabled={!inputValue.trim()}
                      className="h-7 text-xs gap-1.5"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Email
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSend("chat")}
                      disabled={!inputValue.trim()}
                      className="h-7 text-xs gap-1.5"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Envoyer
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/10">
            <div className="text-center">
              <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Sélectionnez une conversation</p>
            </div>
          </div>
        )}
      </div>

      {/* ===== COLUMN 3: Qualification & AI (Fixed 340px) ===== */}
      <div className="w-[340px] flex-shrink-0 flex flex-col bg-background border-l border-border/50">
        {/* Header */}
        <div className="flex-shrink-0 p-3 border-b border-border/50">
          <h2 className="font-semibold text-sm">Qualification & Assistance</h2>
        </div>

        {activeConversation ? (
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-4">
              {/* Qualification */}
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Qualification
                </h3>
                <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Type</Label>
                    <Select
                      value={localRequestType}
                      onValueChange={(v) => setLocalRequestType(v as RequestType)}
                    >
                      <SelectTrigger className="h-8 text-xs mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(REQUEST_TYPE_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key} className="text-xs">
                            <span className="flex items-center gap-2">
                              <RequestTypeIcon type={key as RequestType} />
                              {config.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-[11px] text-muted-foreground">Urgence</Label>
                    <Select
                      value={localUrgency}
                      onValueChange={(v) => setLocalUrgency(v as Urgency)}
                    >
                      <SelectTrigger className="h-8 text-xs mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(URGENCY_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key} className="text-xs">
                            <span className={config.color}>{config.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-[11px] text-muted-foreground">Action</Label>
                    <Select
                      value={localExpectedAction}
                      onValueChange={(v) => setLocalExpectedAction(v as ExpectedAction)}
                    >
                      <SelectTrigger className="h-8 text-xs mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(EXPECTED_ACTION_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key} className="text-xs">
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full h-7 text-xs mt-1"
                    onClick={handleSaveQualification}
                    disabled={
                      localRequestType === activeConversation.request_type &&
                      localUrgency === activeConversation.urgency &&
                      localExpectedAction === activeConversation.expected_action
                    }
                  >
                    <CheckCircle className="h-3 w-3 mr-1.5" />
                    Sauvegarder
                  </Button>
                </div>
              </div>

              <Separator />

              {/* AI Assistance */}
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-violet-500" />
                  Assistance IA
                </h3>

                {!aiResponse ? (
                  <div className="p-4 bg-violet-50/50 dark:bg-violet-950/20 rounded-lg border border-violet-100 dark:border-violet-900/30 text-center">
                    <p className="text-xs text-muted-foreground mb-2">
                      Analysez la conversation pour obtenir des suggestions
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={getAIAssistance}
                      disabled={aiLoading || messages.length === 0}
                      className="h-7 text-xs gap-1.5 border-violet-200 dark:border-violet-800"
                    >
                      <Sparkles className="h-3 w-3" />
                      {aiLoading ? "Analyse..." : "Analyser"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-2.5 bg-violet-50 dark:bg-violet-950/30 rounded-lg border border-violet-200 dark:border-violet-800">
                      <p className="text-[10px] font-medium text-violet-600 dark:text-violet-400 mb-1">
                        Résumé
                      </p>
                      <p className="text-xs leading-relaxed">{aiResponse.summary}</p>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[10px] font-medium text-muted-foreground">Réponse suggérée</p>
                      <div className="p-2.5 bg-muted/50 rounded-lg text-xs leading-relaxed">
                        {aiResponse.suggestedResponse}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full h-7 text-xs gap-1.5"
                        onClick={handleUseSuggestedResponse}
                      >
                        <Copy className="h-3 w-3" />
                        Utiliser
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[10px] font-medium text-muted-foreground">Actions</p>
                      {aiResponse.recommendedActions.map((action, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-2 bg-emerald-50/50 dark:bg-emerald-950/20 rounded text-xs border border-emerald-100 dark:border-emerald-900/30"
                        >
                          <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-6 text-[10px] text-muted-foreground"
                      onClick={() => setAiResponse(null)}
                    >
                      Effacer l'analyse
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Actions
                </h3>
                <div className="space-y-1.5">
                  <Button variant="outline" size="sm" className="w-full justify-start h-7 text-xs gap-2">
                    <FileText className="h-3 w-3" />
                    Créer tâche éditoriale
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start h-7 text-xs gap-2">
                    <Link className="h-3 w-3" />
                    Lier à publication
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start h-7 text-xs gap-2">
                    <ExternalLink className="h-3 w-3" />
                    Demande formelle
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-1 p-3">
            <div className="h-full flex flex-col">
              {/* Disabled qualification */}
              <div className="space-y-2 opacity-50">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Qualification
                </h3>
                <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Type</Label>
                    <Select disabled>
                      <SelectTrigger className="h-8 text-xs mt-1">
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Urgence</Label>
                    <Select disabled>
                      <SelectTrigger className="h-8 text-xs mt-1">
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Action</Label>
                    <Select disabled>
                      <SelectTrigger className="h-8 text-xs mt-1">
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 opacity-50">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Assistance IA
                </h3>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <Sparkles className="h-6 w-6 mx-auto text-muted-foreground/30 mb-1" />
                  <p className="text-[10px] text-muted-foreground">
                    Sélectionnez une conversation
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Conversation Item Component
function ConversationItem({
  conversation,
  isActive,
  onClick
}: {
  conversation: CMConversation;
  isActive: boolean;
  onClick: () => void;
}) {
  const statusConfig = STATUS_CONFIG[conversation.status];
  const requestConfig = REQUEST_TYPE_CONFIG[conversation.request_type];

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-2.5 rounded-lg transition-colors",
        isActive
          ? "bg-primary/10 border border-primary/30"
          : "hover:bg-muted/50 border border-transparent"
      )}
    >
      <div className="flex items-start gap-2.5">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
            {conversation.lawyer_name?.charAt(0) || "A"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <p className="font-medium text-sm truncate">
              {conversation.lawyer_name || "Avocat"}
            </p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {conversation.unread_count > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-semibold px-1.5">
                  {conversation.unread_count}
                </span>
              )}
              {conversation.source === "email" ? (
                <Mail className="h-3 w-3 text-muted-foreground" />
              ) : (
                <MessageCircle className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground truncate">
            {conversation.law_firm_name || "Cabinet"}
          </p>

          <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">
            {conversation.last_message_preview || conversation.subject}
          </p>

          <div className="flex items-center gap-1 mt-1.5">
            <Badge
              variant="secondary"
              className={cn("text-[9px] px-1 py-0 h-4", statusConfig.bgColor, statusConfig.color)}
            >
              {statusConfig.label}
            </Badge>
            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 gap-0.5">
              <RequestTypeIcon type={conversation.request_type} />
            </Badge>
          </div>
        </div>
      </div>
    </button>
  );
}
