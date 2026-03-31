import { Link } from "react-router-dom";
import { Users, MessageCircle, Calendar, Circle, ArrowRight, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MOCK_CM, MOCK_CONVERSATIONS } from "@/data/mockSupport";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return "Hier";
  return `Il y a ${diffDays}j`;
}

export function CMBlock() {
  const lastConversation = MOCK_CONVERSATIONS[0];
  const lastMessage = lastConversation?.messages[lastConversation.messages.length - 1];

  return (
    <Card className="bg-card border transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/20">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <span>Mon CM</span>
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
            <Link to="/assistant">
              Accéder
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* CM Profile */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
          <div className="relative">
            <Avatar className="h-14 w-14 border-2 border-background">
              <AvatarImage src={MOCK_CM.avatarUrl} alt={MOCK_CM.name} />
              <AvatarFallback>{MOCK_CM.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card ${
              MOCK_CM.isOnline ? 'bg-emerald-500' : 'bg-muted-foreground'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">{MOCK_CM.name}</span>
              <Badge 
                variant="secondary" 
                className={`text-xs border-0 ${MOCK_CM.isOnline ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}`}
              >
                <Circle className={`h-1.5 w-1.5 mr-1.5 ${MOCK_CM.isOnline ? 'fill-current' : ''}`} />
                {MOCK_CM.isOnline ? 'En ligne' : 'Hors ligne'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{MOCK_CM.role}</p>
            <p className="text-xs text-muted-foreground">{MOCK_CM.responseTime}</p>
          </div>
        </div>

        {/* Last conversation */}
        {lastConversation && lastMessage && (
          <div className="p-4 rounded-xl border">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1.5 font-medium">
                <MessageCircle className="h-3.5 w-3.5" />
                Dernière conversation
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {formatRelativeTime(lastMessage.timestamp)}
              </span>
            </div>
            <p className="text-sm font-medium mb-1">{lastConversation.subject}</p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              <span className="font-medium text-foreground">
                {lastMessage.sender === 'cm' ? `${MOCK_CM.name.split(' ')[0]}` : 'Vous'}
              </span>
              {' : '}
              {lastMessage.content}
            </p>
          </div>
        )}

        {/* Quick actions */}
        <div className="flex gap-3">
          <Button asChild variant="outline" size="sm" className="flex-1 h-10">
            <Link to="/assistant">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contacter
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex-1 h-10">
            <Link to="/assistant">
              <Calendar className="h-4 w-4 mr-2" />
              RDV
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
