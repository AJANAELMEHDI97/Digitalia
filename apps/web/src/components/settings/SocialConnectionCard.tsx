import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Check,
  ExternalLink,
  Facebook,
  Instagram,
  Linkedin,
  Loader2,
  RefreshCw,
  Shield,
  TriangleAlert,
  Unplug,
  Youtube,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  PLATFORM_CONFIGS,
  SocialPlatformConnection,
  SocialPlatformState,
} from "@/hooks/useSocialConnections";
import { cn } from "@/lib/utils";

interface SocialConnectionCardProps {
  platformState: SocialPlatformState;
  connecting: boolean;
  syncing: boolean;
  onConnectOAuth: () => void;
  onDisconnect: () => void;
  onSync: () => void;
}

const GoogleIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const PlatformIcon = ({
  platform,
  className,
  style,
}: {
  platform: SocialPlatformConnection;
  className?: string;
  style?: React.CSSProperties;
}) => {
  if (platform === "google") return <GoogleIcon className={className} style={style} />;
  const icons = {
    linkedin: Linkedin,
    facebook: Facebook,
    instagram: Instagram,
    youtube: Youtube,
  };
  const Icon = icons[platform as Exclude<SocialPlatformConnection, "google">];
  return <Icon className={className} style={style} />;
};

const formatDate = (value: string | null) =>
  value ? format(new Date(value), "dd MMM yyyy", { locale: fr }) : null;

export function SocialConnectionCard({
  platformState,
  connecting,
  syncing,
  onConnectOAuth,
  onDisconnect,
  onSync,
}: SocialConnectionCardProps) {
  const config = PLATFORM_CONFIGS[platformState.platform];
  const connection = platformState.connection;
  const isConnected = Boolean(connection?.is_active);
  const isConfigured = platformState.configured;

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        isConnected
          ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20"
          : isConfigured
            ? "border-dashed hover:border-muted-foreground/50"
            : "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-lg transition-colors",
                isConnected ? config.bgColor : "bg-muted",
              )}
              style={isConnected ? { backgroundColor: `${config.color}15` } : undefined}
            >
              <PlatformIcon
                platform={platformState.platform}
                className="h-6 w-6"
                style={isConnected ? { color: config.color } : undefined}
              />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg">{config.name}</CardTitle>
                {isConnected && (
                  <Badge className="gap-1 bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/50 dark:text-green-400">
                    <Check className="h-3 w-3" />
                    Connecte
                  </Badge>
                )}
                {!isConfigured && (
                  <Badge variant="outline" className="gap-1 border-amber-300 text-amber-700">
                    <TriangleAlert className="h-3 w-3" />
                    Configuration requise
                  </Badge>
                )}
              </div>

              <CardDescription>
                {connection?.account_name || config.description}
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isConnected && (
              <Button variant="outline" onClick={onSync} disabled={syncing} className="gap-2">
                {syncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Synchroniser
              </Button>
            )}

            {isConnected ? (
              <Button
                variant="outline"
                onClick={onDisconnect}
                className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Unplug className="h-4 w-4" />
                Deconnecter
              </Button>
            ) : (
              <Button
                onClick={onConnectOAuth}
                disabled={connecting || !isConfigured}
                className="gap-2"
                style={{ backgroundColor: config.color }}
              >
                {connecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                Connecter
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {!isConfigured && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            <p className="font-medium">Variables manquantes</p>
            <p className="mt-1">
              {platformState.missingEnv.join(", ")}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {platformState.capabilities.map((capability) => (
            <Badge key={capability} variant="secondary" className="text-xs">
              {capability.replace(/_/g, " ")}
            </Badge>
          ))}
        </div>

        <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          <div>
            <span className="font-medium text-foreground">Frequence:</span>{" "}
            {platformState.syncFrequency}
          </div>
          <div>
            <span className="font-medium text-foreground">Statut:</span>{" "}
            {platformState.status}
          </div>
          {connection?.account_handle && (
            <div>
              <span className="font-medium text-foreground">Compte:</span>{" "}
              {connection.account_handle}
            </div>
          )}
          {connection?.account_email && (
            <div>
              <span className="font-medium text-foreground">Email:</span>{" "}
              {connection.account_email}
            </div>
          )}
          {connection?.connected_at && (
            <div>
              <span className="font-medium text-foreground">Connecte le:</span>{" "}
              {formatDate(connection.connected_at)}
            </div>
          )}
          {connection?.last_used_at && (
            <div>
              <span className="font-medium text-foreground">Derniere synchro:</span>{" "}
              {formatDate(connection.last_used_at)}
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
          <Shield className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            Les connexions sont gerees via OAuth officiel, avec controle d'acces et journalisation cote serveur.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
