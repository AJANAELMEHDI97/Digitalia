import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Share2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  PLATFORM_CONFIGS,
  SocialPlatformConnection,
  useSocialConnections,
} from "@/hooks/useSocialConnections";
import { SocialConnectionCard } from "./SocialConnectionCard";

const PLATFORMS_ORDER: SocialPlatformConnection[] = [
  "linkedin",
  "facebook",
  "instagram",
  "youtube",
];

export function SocialConnectionsTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    connections,
    loading,
    connecting,
    syncing,
    getPlatformState,
    connectWithOAuth,
    disconnect,
    sync,
  } = useSocialConnections();

  useEffect(() => {
    const status = searchParams.get("status");
    const provider = searchParams.get("provider") as SocialPlatformConnection | null;
    const message = searchParams.get("message");

    if (!status || !provider) {
      return;
    }

    if (status === "connected") {
      toast.success(message || `${PLATFORM_CONFIGS[provider].name} connecte avec succes.`);
    } else {
      toast.error(message || `La connexion ${PLATFORM_CONFIGS[provider].name} a echoue.`);
    }

    const next = new URLSearchParams(searchParams);
    next.delete("status");
    next.delete("provider");
    next.delete("message");
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const connectedCount = connections.filter((connection) => connection.is_active).length;
  const missingConfig = PLATFORMS_ORDER.filter(
    (platform) => !getPlatformState(platform).configured,
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-2 h-4 w-72" />
          </CardHeader>
        </Card>
        {PLATFORMS_ORDER.map((platform) => (
          <Card key={platform}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Share2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                Connexions des reseaux sociaux
                <span className="text-sm font-normal text-muted-foreground">
                  ({connectedCount}/{PLATFORMS_ORDER.length} connectes)
                </span>
              </CardTitle>
              <CardDescription>
                Raccordez LinkedIn, Facebook, Instagram et YouTube via les integrations OAuth du backend.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              Les connexions sociales passent maintenant par l'API locale SocialPulse, avec callback OAuth, sync serveur et publication reseau cote backend.
            </AlertDescription>
          </Alert>

          {missingConfig.length > 0 && (
            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
              <AlertDescription className="text-sm">
                Certaines integrations ne sont pas encore configurées coté environnement serveur:
                {" "}
                {missingConfig
                  .map((platform) => `${PLATFORM_CONFIGS[platform].name} (${getPlatformState(platform).missingEnv.join(", ")})`)
                  .join(" · ")}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {PLATFORMS_ORDER.map((platform) => (
          <SocialConnectionCard
            key={platform}
            platformState={getPlatformState(platform)}
            connecting={connecting === platform}
            syncing={syncing === platform}
            onConnectOAuth={() => connectWithOAuth(platform)}
            onDisconnect={() => disconnect(platform)}
            onSync={() => sync(platform)}
          />
        ))}
      </div>
    </div>
  );
}
