import { Link } from "react-router-dom";
import { Settings, Clock, Bell, Share2, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LawyerSettingsCardProps {
  validationDelay?: string;
  notificationChannels?: string[];
  activeNetworks?: string[];
}

const NETWORK_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  google_business: "Google Business",
};

export function LawyerSettingsCard({
  validationDelay = "72h",
  notificationChannels = ["Email", "App"],
  activeNetworks = ["linkedin"],
}: LawyerSettingsCardProps) {
  return (
    <Card className="h-[340px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Settings className="h-4 w-4 text-muted-foreground" />
          Vos parametres cles
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Delai de validation</span>
            </div>
            <Badge variant="secondary" className="font-medium">
              {validationDelay}
            </Badge>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <div className="flex items-center gap-2 text-sm">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Notifications</span>
            </div>
            <div className="flex items-center gap-1">
              {notificationChannels.map((channel) => (
                <Badge key={channel} variant="outline" className="text-xs">
                  {channel}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-sm">
              <Share2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Reseaux sociaux</span>
            </div>
            <div className="flex items-center gap-1">
              {activeNetworks.length > 0 ? (
                activeNetworks.map((network) => (
                  <Badge key={network} variant="outline" className="text-xs">
                    {NETWORK_LABELS[network] || network}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">Aucun</span>
              )}
            </div>
          </div>
        </div>

        <Button variant="ghost" size="sm" asChild className="w-full mt-4">
          <Link to="/settings?tab=connections">
            Modifier mes parametres
            <ChevronRight className="ml-auto h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
