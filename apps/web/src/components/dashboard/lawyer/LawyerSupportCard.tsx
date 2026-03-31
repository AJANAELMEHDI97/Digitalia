import { Link } from "react-router-dom";
import { Headphones, Video, MessageCircle, ChevronRight, Clock, CheckCircle2, FileText, Zap, Shield, TrendingUp, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LawyerSupportCardProps {
  cmName?: string;
  cmAvatarUrl?: string;
  nextMeetingDate?: string;
  nextMeetingDuration?: string;
  subscriptionPlan?: string | null;
}

export function LawyerSupportCard({
  cmName = "Sophie Martin",
  cmAvatarUrl,
  nextMeetingDate = "15 février",
  nextMeetingDuration = "30 min",
  subscriptionPlan = "essentiel",
}: LawyerSupportCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Plan configuration
  const planConfig: Record<string, { label: string; icon: typeof Shield; className: string }> = {
    essentiel: { 
      label: "Essentiel", 
      icon: Shield, 
      className: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600" 
    },
    avance: { 
      label: "Avancé", 
      icon: TrendingUp, 
      className: "bg-primary/10 text-primary border-primary/30" 
    },
    expert: { 
      label: "Expert", 
      icon: Crown, 
      className: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-600" 
    },
  };

  const currentPlan = planConfig[subscriptionPlan || 'essentiel'] || planConfig.essentiel;
  const PlanIcon = currentPlan.icon;

  // Mock activity data
  const recentActivity = [
    { icon: FileText, label: "3 posts créés cette semaine", time: "Hier" },
    { icon: CheckCircle2, label: "Calendrier éditorial à jour", time: "il y a 2j" },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-base font-medium">
            <div className="p-2 rounded-xl bg-primary/10 dark:bg-primary/20">
              <Headphones className="h-4 w-4 text-primary" />
            </div>
            Votre accompagnement
          </CardTitle>
          <Badge variant="outline" className={cn("text-xs gap-1 flex items-center", currentPlan.className)}>
            <PlanIcon className="h-3 w-3" />
            {currentPlan.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        {/* CM Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage src={cmAvatarUrl} alt={cmName} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(cmName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs text-muted-foreground">Community Manager dédié</p>
            <p className="font-medium">{cmName}</p>
            <Badge variant="outline" className="mt-1 text-xs bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300">
              Assigné
            </Badge>
          </div>
        </div>

        {/* Next meeting */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50">
            <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Prochain point visio</p>
            <p className="font-medium">{nextMeetingDate} – {nextMeetingDuration}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
            <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">&lt; 2h</p>
              <p className="text-[10px] text-muted-foreground">Temps de réponse</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
            <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">98%</p>
              <p className="text-[10px] text-muted-foreground">Satisfaction</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Activité récente</p>
          <div className="space-y-1.5">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-2 text-xs p-2 rounded-md bg-muted/30">
                <activity.icon className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                <span className="flex-1 truncate">{activity.label}</span>
                <span className="text-muted-foreground text-[10px] shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Button variant="outline" size="sm" asChild className="w-full mt-auto">
          <Link to="/assistant">
            <MessageCircle className="mr-2 h-4 w-4" />
            Contacter mon Community Manager
            <ChevronRight className="ml-auto h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
