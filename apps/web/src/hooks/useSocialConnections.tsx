import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { TOKEN_STORAGE_KEY } from "@/lib/local-auth";

export type SocialPlatformConnection =
  | "linkedin"
  | "facebook"
  | "instagram"
  | "youtube";

export interface SocialConnection {
  id: string;
  integration_id: string | null;
  platform: SocialPlatformConnection;
  account_id: string | null;
  account_name: string | null;
  account_email: string | null;
  account_handle: string | null;
  account_type: string | null;
  account_avatar_url: string | null;
  permissions: string[];
  is_active: boolean;
  connection_status: string;
  connected_at: string | null;
  last_used_at: string | null;
  token_expires_at: string | null;
}

export interface PlatformConfig {
  id: SocialPlatformConnection;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface SocialPlatformState {
  platform: SocialPlatformConnection;
  integrationId: string | null;
  configured: boolean;
  missingEnv: string[];
  capabilities: string[];
  syncFrequency: string;
  status: string;
  connection?: SocialConnection;
}

interface IntegrationConnectionPayload {
  id: string;
  integrationId: string | null;
  provider: SocialPlatformConnection;
  accountId: string | null;
  accountName: string | null;
  accountHandle: string | null;
  accountType: string | null;
  avatarUrl: string | null;
  scopes: string[];
  metadata: Record<string, unknown>;
  status: string;
  tokenExpiresAt: string | null;
  lastSyncAt: string | null;
  createdAt: string | null;
}

interface IntegrationPayload {
  id: string;
  name: string;
  kind: string;
  status: string;
  syncFrequency: string;
  provider?: SocialPlatformConnection;
  configured?: boolean;
  missingEnv?: string[];
  capabilities?: string[];
  connections?: IntegrationConnectionPayload[];
}

export const PLATFORM_CONFIGS: Record<SocialPlatformConnection, PlatformConfig> = {
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    description: "Connexion OAuth officielle pour publier du contenu professionnel.",
    icon: "linkedin",
    color: "#0A66C2",
    bgColor: "bg-[#0A66C2]/10",
  },
  facebook: {
    id: "facebook",
    name: "Facebook Pages",
    description: "Connexion Meta officielle pour publier sur vos pages Facebook.",
    icon: "facebook",
    color: "#1877F2",
    bgColor: "bg-[#1877F2]/10",
  },
  instagram: {
    id: "instagram",
    name: "Instagram Business",
    description: "Connexion Meta officielle pour vos publications Instagram Business.",
    icon: "instagram",
    color: "#E1306C",
    bgColor: "bg-[#E1306C]/10",
  },
  youtube: {
    id: "youtube",
    name: "YouTube",
    description: "Connexion Google officielle pour synchroniser votre chaine et publier des videos.",
    icon: "youtube",
    color: "#FF0000",
    bgColor: "bg-[#FF0000]/10",
  },
};

const PLATFORM_ORDER: SocialPlatformConnection[] = [
  "linkedin",
  "facebook",
  "instagram",
  "youtube",
];

const getAuthHeaders = (withJson = false) => {
  const token = typeof window !== "undefined"
    ? window.localStorage.getItem(TOKEN_STORAGE_KEY)
    : null;
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (withJson) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

const apiRequest = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(Boolean(init?.body)),
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      payload && typeof payload.message === "string"
        ? payload.message
        : `Erreur HTTP ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
};

const mapConnection = (payload: IntegrationConnectionPayload): SocialConnection => {
  const emailFromMetadata =
    typeof payload.metadata?.email === "string" ? payload.metadata.email : null;
  const emailFromHandle =
    typeof payload.accountHandle === "string" && payload.accountHandle.includes("@")
      ? payload.accountHandle
      : null;

  return {
    id: payload.id,
    integration_id: payload.integrationId,
    platform: payload.provider,
    account_id: payload.accountId,
    account_name: payload.accountName,
    account_email: emailFromMetadata ?? emailFromHandle,
    account_handle: payload.accountHandle,
    account_type: payload.accountType,
    account_avatar_url: payload.avatarUrl,
    permissions: Array.isArray(payload.scopes) ? payload.scopes : [],
    is_active: payload.status === "active",
    connection_status: payload.status,
    connected_at: payload.createdAt ?? payload.lastSyncAt ?? null,
    last_used_at: payload.lastSyncAt,
    token_expires_at: payload.tokenExpiresAt,
  };
};

export function useSocialConnections() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [connecting, setConnecting] = useState<SocialPlatformConnection | null>(null);
  const [syncing, setSyncing] = useState<SocialPlatformConnection | null>(null);

  const {
    data: integrations = [],
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["social-connections", user?.id],
    queryFn: async () => {
      if (!user) {
        return [] as IntegrationPayload[];
      }

      const data = await apiRequest<IntegrationPayload[]>("/integrations");
      return data.filter(
        (integration) =>
          integration.kind === "social" &&
          integration.provider !== undefined &&
          PLATFORM_ORDER.includes(integration.provider),
      );
    },
    enabled: Boolean(user),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const platformStates = useMemo(() => {
    const byPlatform = new Map<SocialPlatformConnection, SocialPlatformState>();

    integrations.forEach((integration) => {
      if (!integration.provider) {
        return;
      }

      const connection = (integration.connections ?? [])
        .map(mapConnection)
        .find((item) => item.is_active) ?? (integration.connections ?? []).map(mapConnection)[0];

      byPlatform.set(integration.provider, {
        platform: integration.provider,
        integrationId: integration.id,
        configured: integration.configured !== false,
        missingEnv: integration.missingEnv ?? [],
        capabilities: integration.capabilities ?? [],
        syncFrequency: integration.syncFrequency,
        status: integration.status,
        connection,
      });
    });

    PLATFORM_ORDER.forEach((platform) => {
      if (!byPlatform.has(platform)) {
        byPlatform.set(platform, {
          platform,
          integrationId: null,
          configured: false,
          missingEnv: ["Integration backend absente"],
          capabilities: [],
          syncFrequency: "Non configure",
          status: "draft",
        });
      }
    });

    return byPlatform;
  }, [integrations]);

  const connections = useMemo(
    () =>
      PLATFORM_ORDER.map((platform) => platformStates.get(platform)?.connection)
        .filter((connection): connection is SocialConnection => Boolean(connection)),
    [platformStates],
  );

  const getPlatformState = useCallback(
    (platform: SocialPlatformConnection): SocialPlatformState =>
      platformStates.get(platform) ?? {
        platform,
        integrationId: null,
        configured: false,
        missingEnv: ["Integration backend absente"],
        capabilities: [],
        syncFrequency: "Non configure",
        status: "draft",
      },
    [platformStates],
  );

  const getConnectionByPlatform = useCallback(
    (platform: SocialPlatformConnection): SocialConnection | undefined =>
      getPlatformState(platform).connection,
    [getPlatformState],
  );

  const isConnected = useCallback(
    (platform: SocialPlatformConnection): boolean => Boolean(getConnectionByPlatform(platform)?.is_active),
    [getConnectionByPlatform],
  );

  const refreshConnections = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["social-connections"] });
  }, [queryClient]);

  const connectWithOAuth = useCallback(
    async (platform: SocialPlatformConnection) => {
      const platformState = getPlatformState(platform);
      if (!platformState.configured) {
        toast.error(
          `Configuration manquante pour ${PLATFORM_CONFIGS[platform].name}: ${platformState.missingEnv.join(", ")}`,
        );
        return;
      }

      try {
        setConnecting(platform);
        const data = await apiRequest<{ authUrl: string }>(
          `/integrations/social/${platform}/connect-url`,
          { method: "POST" },
        );
        window.location.href = data.authUrl;
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : `Erreur lors de la connexion a ${PLATFORM_CONFIGS[platform].name}`,
        );
      } finally {
        setConnecting(null);
      }
    },
    [getPlatformState],
  );

  const disconnect = useCallback(
    async (platform: SocialPlatformConnection) => {
      const connection = getConnectionByPlatform(platform);
      if (!connection) {
        return;
      }

      try {
        await apiRequest(`/integrations/social/connections/${connection.id}`, {
          method: "DELETE",
        });
        toast.success(`${PLATFORM_CONFIGS[platform].name} deconnecte`);
        await refreshConnections();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : `Erreur lors de la deconnexion de ${PLATFORM_CONFIGS[platform].name}`,
        );
      }
    },
    [getConnectionByPlatform, refreshConnections],
  );

  const sync = useCallback(
    async (platform: SocialPlatformConnection) => {
      const connection = getConnectionByPlatform(platform);
      if (!connection) {
        return;
      }

      try {
        setSyncing(platform);
        await apiRequest(`/integrations/social/connections/${connection.id}/sync`, {
          method: "POST",
        });
        toast.success(`${PLATFORM_CONFIGS[platform].name} synchronise`);
        await refreshConnections();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : `Erreur lors de la synchronisation de ${PLATFORM_CONFIGS[platform].name}`,
        );
      } finally {
        setSyncing(null);
      }
    },
    [getConnectionByPlatform, refreshConnections],
  );

  return {
    connections,
    loading,
    connecting,
    syncing,
    isConnected,
    getConnectionByPlatform,
    getPlatformState,
    connectWithOAuth,
    disconnect,
    sync,
    refetch,
  };
}
