import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformBadge } from "@/components/ui/platform-badge";
import { TrendingUp, Eye } from "lucide-react";

// Thématiques juridiques qui génèrent le plus d'intérêt
const MOCK_TOP_TOPICS = [
  { title: "Divorce : faut-il forcément passer par un juge ?", platform: "linkedin", views: 2890, engagement: 27.18 },
  { title: "3 clauses à vérifier dans tout contrat de travail", platform: "linkedin", views: 2008, engagement: 18.88 },
  { title: "Vos droits lors d'un contrôle de police", platform: "facebook", views: 1679, engagement: 15.78 },
  { title: "Licenciement économique : procédure et recours", platform: "linkedin", views: 1173, engagement: 11.03 },
  { title: "Garde alternée : critères et mise en place", platform: "facebook", views: 957, engagement: 9.00 },
  { title: "Harcèlement moral au travail : comment réagir ?", platform: "linkedin", views: 834, engagement: 7.85 },
];

const ENGAGEMENT_CONFIG = {
  high: { color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  medium: { color: "text-amber-500", bgColor: "bg-amber-500/10" },
  low: { color: "text-rose-500", bgColor: "bg-rose-500/10" },
};

export function TopTopicsCard() {
  return (
    <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-white/20 dark:border-white/10 transition-all duration-200 hover:shadow-md h-full">
      <CardHeader className="pb-1 pt-3 px-4">
        <CardTitle className="text-sm font-semibold text-foreground">Thématiques juridiques</CardTitle>
        <p className="text-[10px] text-muted-foreground">Sujets qui suscitent le plus d'intérêt auprès de vos prospects</p>
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-2">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-3 top-1 bottom-4 w-0.5 bg-gradient-to-b from-emerald-500/60 via-amber-500/30 to-transparent" />
          
          <div className="space-y-3">
            {MOCK_TOP_TOPICS.map((topic, index) => {
              const engagementLevel = topic.engagement > 15 
                ? "high" 
                : topic.engagement > 8 
                  ? "medium" 
                  : "low";
              const config = ENGAGEMENT_CONFIG[engagementLevel];
              const isFirst = index === 0;
              
              return (
                <Link 
                  key={index} 
                  to="/metrics"
                  className="group flex gap-3 items-start relative"
                >
                  {/* Timeline node */}
                  <div className={`
                    relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                    ${config.bgColor} ${config.color}
                    ring-2 ring-background
                    transition-all duration-200
                    group-hover:scale-110 group-hover:shadow-md
                    ${isFirst ? "animate-pulse" : ""}
                  `}>
                    <TrendingUp className="w-3 h-3" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <PlatformBadge platform={topic.platform as any} className="scale-[0.65] origin-left" />
                      <span className={`text-[10px] font-medium ${config.color}`}>{topic.engagement.toFixed(1)}%</span>
                    </div>
                    <p className="text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                      {topic.title}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Eye className="w-2.5 h-2.5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{topic.views.toLocaleString()} vues</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        
        <Link 
          to="/metrics" 
          className="block text-center text-xs text-primary hover:underline pt-2 mt-1 border-t border-border/30"
        >
          Voir tout →
        </Link>
      </CardContent>
    </Card>
  );
}
