import { Users, HelpCircle, BarChart3, Calendar, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MOCK_CM } from "@/data/mockSupport";

interface SupportHubProps {
  onNavigate: (tab: string) => void;
  activeTab: string;
}

const SUPPORT_OPTIONS = [
  {
    id: 'faq',
    title: 'Base de réponses',
    description: 'Trouvez rapidement une réponse à vos questions',
    icon: HelpCircle,
    badge: '15 articles',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    id: 'stats',
    title: 'Statistiques',
    description: 'Performance et indicateurs de support',
    icon: BarChart3,
    badge: 'Ce mois',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  {
    id: 'messaging',
    title: 'Messagerie',
    description: 'Échangez avec votre CM',
    icon: MessageCircle,
    badge: MOCK_CM.isOnline ? 'CM en ligne' : 'CM hors ligne',
    badgeVariant: MOCK_CM.isOnline ? 'default' : 'secondary',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  {
    id: 'appointment',
    title: 'Prendre rendez-vous',
    description: 'Planifiez un appel ou une visio',
    icon: Calendar,
    badge: 'Créneaux disponibles',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
];

export function SupportHub({ onNavigate, activeTab }: SupportHubProps) {
  return (
    <div className="space-y-6">
      {/* CM Profile Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-background shadow-lg">
                <AvatarImage src={MOCK_CM.avatarUrl} alt={MOCK_CM.name} />
                <AvatarFallback>{MOCK_CM.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-background ${
                MOCK_CM.isOnline ? 'bg-emerald-500' : 'bg-muted-foreground'
              }`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold">{MOCK_CM.name}</h2>
                <Badge variant={MOCK_CM.isOnline ? "default" : "secondary"}>
                  {MOCK_CM.isOnline ? 'En ligne' : 'Hors ligne'}
                </Badge>
              </div>
              <p className="text-muted-foreground">{MOCK_CM.role}</p>
              <p className="text-sm text-muted-foreground mt-1">{MOCK_CM.responseTime}</p>
            </div>
            <div className="hidden sm:block">
              <Users className="h-20 w-20 text-primary/10" />
            </div>
          </div>
        </div>
        <CardContent className="p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Sophie est votre community manager dédiée. Elle vous accompagne dans votre stratégie 
            de communication et répond à toutes vos questions.
          </p>
        </CardContent>
      </Card>

      {/* Support Options Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {SUPPORT_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${
                activeTab === option.id ? 'border-primary ring-1 ring-primary' : ''
              }`}
              onClick={() => onNavigate(option.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${option.bgColor}`}>
                    <Icon className={`h-6 w-6 ${option.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-medium">{option.title}</h3>
                      <Badge 
                        variant={(option as any).badgeVariant || "secondary"} 
                        className="flex-shrink-0 text-xs"
                      >
                        {option.badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick tips */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-primary" />
            Conseils pour obtenir une réponse rapide
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Consultez d'abord la FAQ pour les questions fréquentes</li>
            <li>• L'assistant IA répond instantanément, 24h/24</li>
            <li>• Pour les questions complexes, contactez directement Sophie</li>
            <li>• Précisez le contexte (publication concernée, date, réseau)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
