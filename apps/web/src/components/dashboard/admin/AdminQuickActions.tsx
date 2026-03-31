import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertTriangle, BarChart3, Users, FileWarning, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const actions = [
  { label: "Cabinets à risque", url: "/admin/firms", icon: AlertTriangle, borderColor: "border-l-amber-500", hoverBg: "hover:bg-amber-50/50 dark:hover:bg-amber-950/20" },
  { label: "Pipeline acquisition", url: "/admin/acquisition/leads", icon: BarChart3, borderColor: "border-l-blue-500", hoverBg: "hover:bg-blue-50/50 dark:hover:bg-blue-950/20" },
  { label: "Performance équipe", url: "/admin/team/performance", icon: Users, borderColor: "border-l-violet-500", hoverBg: "hover:bg-violet-50/50 dark:hover:bg-violet-950/20" },
  { label: "Factures en retard", url: "/admin/billing/delays", icon: FileWarning, borderColor: "border-l-red-500", hoverBg: "hover:bg-red-50/50 dark:hover:bg-red-950/20" },
];

export function AdminQuickActions() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.3 }}
    >
      <Card>
        <CardHeader className="pb-3 pt-4 px-5">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Accès rapides</h3>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          <div className="space-y-2">
            {actions.map(({ label, url, icon: Icon, borderColor, hoverBg }) => (
              <button
                key={url}
                onClick={() => navigate(url)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border-l-4 text-left transition-all duration-200 cursor-pointer",
                  "bg-background border border-border",
                  borderColor,
                  hoverBg,
                )}
              >
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
