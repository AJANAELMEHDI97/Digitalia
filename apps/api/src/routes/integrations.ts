import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { pool } from "../db/pool.js";
import { logEvent } from "../lib/logs.js";
import { buildProviderAuthorizationUrl, createSocialState, decryptSensitiveValue, encryptSensitiveValue, exchangeCodeForConnections, getProviderCatalog, refreshConnectionIfNeeded, socialProviders, syncProviderConnection, verifySocialState, } from "../lib/social.js";
import { parseOrRespond } from "../lib/validation.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
const integrationSchema = z.object({
    status: z.enum(["connected", "draft", "attention", "disconnected"]),
    syncFrequency: z.string().min(2),
});
const providerSchema = z.enum(["linkedin", "facebook", "instagram", "youtube"]);
const asyncHandler = (handler: RequestHandler): RequestHandler => (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
};
const getIntegrationProvider = (integration) => {
    const provider = typeof integration.details.provider === "string"
        ? integration.details.provider
        : null;
    return typeof provider === "string" &&
        socialProviders.includes(provider)
        ? provider
        : null;
};
const getFrontendIntegrationUrl = (query: Record<string, string>) => {
    const url = new URL("/settings", env.FRONTEND_URL);
    url.searchParams.set("tab", "connections");
    Object.entries(query).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });
    return url.toString();
};
const loadStoredConnections = async (organizationId) => {
    const result = await pool.query(`
      SELECT
        id,
        organization_id AS "organizationId",
        integration_id AS "integrationId",
        provider,
        account_id AS "accountId",
        account_name AS "accountName",
        account_handle AS "accountHandle",
        account_type AS "accountType",
        avatar_url AS "avatarUrl",
        access_token AS "accessTokenEncrypted",
        refresh_token AS "refreshTokenEncrypted",
        token_expires_at AS "tokenExpiresAt",
        scopes,
        metadata,
        status,
        last_sync_at AS "lastSyncAt",
        created_at AS "createdAt"
      FROM social_connections
      WHERE organization_id = $1
      ORDER BY provider ASC, account_name ASC
    `, [organizationId]);
    return result.rows.map((row) => ({
        id: row.id,
        organizationId: row.organizationId,
        integrationId: row.integrationId,
        provider: row.provider,
        accountId: row.accountId,
        accountName: row.accountName,
        accountHandle: row.accountHandle,
        accountType: row.accountType,
        avatarUrl: row.avatarUrl,
        accessToken: decryptSensitiveValue(row.accessTokenEncrypted) ?? "",
        refreshToken: decryptSensitiveValue(row.refreshTokenEncrypted),
        tokenExpiresAt: row.tokenExpiresAt,
        scopes: row.scopes,
        metadata: row.metadata,
        status: row.status,
        lastSyncAt: row.lastSyncAt,
        createdAt: row.createdAt,
    }));
};
const toPublicConnection = (connection) => ({
    id: connection.id,
    integrationId: connection.integrationId,
    provider: connection.provider,
    accountId: connection.accountId,
    accountName: connection.accountName,
    accountHandle: connection.accountHandle,
    accountType: connection.accountType,
    avatarUrl: connection.avatarUrl,
    scopes: connection.scopes,
    metadata: connection.metadata,
    status: connection.status,
    tokenExpiresAt: connection.tokenExpiresAt,
    lastSyncAt: connection.lastSyncAt,
    createdAt: connection.createdAt,
});
const updateIntegrationStatusForProvider = async (organizationId, provider) => {
    const result = await pool.query(`
      SELECT COUNT(*)::text AS count
      FROM social_connections
      WHERE organization_id = $1
        AND provider = $2
        AND status = 'active'
    `, [organizationId, provider]);
    const activeCount = Number(result.rows[0]?.count ?? "0");
    await pool.query(`
      UPDATE integrations
      SET
        status = CASE WHEN $3 > 0 THEN 'connected' ELSE 'draft' END,
        last_sync_at = CASE WHEN $3 > 0 THEN NOW() ELSE last_sync_at END,
        details = jsonb_set(
          jsonb_set(details, '{provider}', to_jsonb($2::text), true),
          '{connectedAccounts}',
          to_jsonb($3::int),
          true
        ),
        updated_at = NOW()
      WHERE organization_id = $1
        AND kind = 'social'
        AND details->>'provider' = $2
    `, [organizationId, provider, activeCount]);
};
const upsertConnection = async ({ organizationId, integrationId, createdBy, connection, }) => {
    await pool.query(`
      INSERT INTO social_connections (
        organization_id,
        integration_id,
        provider,
        account_id,
        account_name,
        account_handle,
        account_type,
        avatar_url,
        access_token,
        refresh_token,
        token_expires_at,
        scopes,
        metadata,
        status,
        last_sync_at,
        created_by
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12::jsonb,
        $13::jsonb,
        'active',
        NOW(),
        $14
      )
      ON CONFLICT (organization_id, provider, account_id)
      DO UPDATE SET
        integration_id = EXCLUDED.integration_id,
        account_name = EXCLUDED.account_name,
        account_handle = EXCLUDED.account_handle,
        account_type = EXCLUDED.account_type,
        avatar_url = EXCLUDED.avatar_url,
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        token_expires_at = EXCLUDED.token_expires_at,
        scopes = EXCLUDED.scopes,
        metadata = EXCLUDED.metadata,
        status = 'active',
        last_sync_at = NOW(),
        updated_at = NOW()
    `, [
        organizationId,
        integrationId,
        connection.provider,
        connection.accountId,
        connection.accountName,
        connection.accountHandle,
        connection.accountType,
        connection.avatarUrl,
        encryptSensitiveValue(connection.accessToken),
        connection.refreshToken ? encryptSensitiveValue(connection.refreshToken) : null,
        connection.tokenExpiresAt?.toISOString() ?? null,
        JSON.stringify(connection.scopes),
        JSON.stringify(connection.metadata),
        createdBy,
    ]);
};
export const integrationsRouter = Router();
integrationsRouter.get("/oauth/:provider/callback", asyncHandler(async (request, response) => {
    const provider = parseOrRespond(providerSchema, request.params.provider, response);
    if (!provider)
        return;
    const stateToken = request.query.state?.toString();
    const code = request.query.code?.toString();
    const remoteError = request.query.error?.toString();
    if (remoteError) {
        return response.redirect(getFrontendIntegrationUrl({
            status: "error",
            provider,
            message: remoteError,
        }));
    }
    if (!stateToken || !code) {
        return response.redirect(getFrontendIntegrationUrl({
            status: "error",
            provider,
            message: "Callback OAuth incomplet.",
        }));
    }
    try {
        const verified = verifySocialState(stateToken) as {
            provider: string;
            organizationId: string;
            userId: string;
        };
        if (verified.provider !== provider) {
            throw new Error("Le provider du callback ne correspond pas a l'etat OAuth.");
        }
        const integrationResult = await pool.query(`
          SELECT id
          FROM integrations
          WHERE organization_id = $1
            AND kind = 'social'
            AND details->>'provider' = $2
          LIMIT 1
        `, [verified.organizationId, provider]);
        const connections = await exchangeCodeForConnections(provider, code);
        for (const connection of connections) {
            const providerIntegrationResult = await pool.query(`
            SELECT id
            FROM integrations
            WHERE organization_id = $1
              AND kind = 'social'
              AND details->>'provider' = $2
            LIMIT 1
          `, [verified.organizationId, connection.provider]);
            await upsertConnection({
                organizationId: verified.organizationId,
                integrationId: providerIntegrationResult.rows[0]?.id ?? integrationResult.rows[0]?.id ?? null,
                createdBy: verified.userId,
                connection,
            });
            await updateIntegrationStatusForProvider(verified.organizationId, connection.provider);
        }
        await logEvent({
            organizationId: verified.organizationId,
            actorUserId: verified.userId,
            eventKey: "integration_connected",
            context: { provider, discoveredAccounts: connections.length },
        });
        return response.redirect(getFrontendIntegrationUrl({
            status: "connected",
            provider,
            message: `${connections.length.toString()} compte(s) connecte(s).`,
        }));
    }
    catch (error) {
        return response.redirect(getFrontendIntegrationUrl({
            status: "error",
            provider,
            message: error instanceof Error
                ? error.message
                : "Connexion OAuth impossible.",
        }));
    }
}));
integrationsRouter.use(requireAuth);
integrationsRouter.get("/", asyncHandler(async (request, response) => {
    const [integrationsResult, storedConnections] = await Promise.all([
        pool.query(`
        SELECT
          id,
          name,
          kind,
          status,
          sync_frequency AS "syncFrequency",
          details,
          last_sync_at AS "lastSyncAt"
        FROM integrations
        WHERE organization_id = $1
        ORDER BY
          CASE WHEN kind = 'social' THEN 0 ELSE 1 END,
          created_at ASC
      `, [request.user.organizationId]),
        loadStoredConnections(request.user.organizationId),
    ]);
    const catalog = Object.fromEntries(getProviderCatalog().map((item) => [item.provider, item]));
    const groupedConnections = storedConnections.reduce((accumulator, connection) => {
        const current = accumulator[connection.provider] ?? [];
        accumulator[connection.provider] = [...current, toPublicConnection(connection)];
        return accumulator;
    }, {});
    return response.json(integrationsResult.rows.map((integration) => {
        const provider = getIntegrationProvider(integration);
        if (!provider) {
            return {
                ...integration,
                connections: [],
            };
        }
        return {
            ...integration,
            provider,
            configured: catalog[provider].configured,
            missingEnv: catalog[provider].missingEnv,
            capabilities: catalog[provider].capabilities,
            connections: groupedConnections[provider] ?? [],
        };
    }));
}));
integrationsRouter.get("/social/connections", asyncHandler(async (request, response) => {
    const connections = await loadStoredConnections(request.user.organizationId);
    return response.json(connections.map(toPublicConnection));
}));
integrationsRouter.post("/social/:provider/connect-url", requireRole(["admin"]), asyncHandler(async (request, response) => {
    const provider = parseOrRespond(providerSchema, request.params.provider, response);
    if (!provider)
        return;
    const catalog = getProviderCatalog().find((item) => item.provider === provider);
    if (!catalog) {
        return response.status(404).json({ message: "Provider social introuvable." });
    }
    if (!catalog.configured) {
        return response.status(400).json({
            message: `${catalog.name} n'est pas configure. Variables manquantes: ${catalog.missingEnv.join(", ")}.`,
        });
    }
    const authUrl = buildProviderAuthorizationUrl(provider, createSocialState({
        userId: request.user.id,
        organizationId: request.user.organizationId,
        provider,
    }));
    return response.json({ provider, authUrl });
}));
integrationsRouter.post("/social/connections/:id/sync", requireRole(["admin"]), asyncHandler(async (request, response) => {
    const connections = await loadStoredConnections(request.user.organizationId);
    const connection = connections.find((item) => item.id === request.params.id);
    if (!connection) {
        return response.status(404).json({ message: "Compte social introuvable." });
    }
    const syncResult = await syncProviderConnection(connection);
    await pool.query(`
        UPDATE social_connections
        SET
          account_name = $2,
          account_handle = $3,
          avatar_url = $4,
          access_token = $5,
          refresh_token = $6,
          token_expires_at = $7,
          scopes = $8::jsonb,
          metadata = $9::jsonb,
          status = 'active',
          last_sync_at = NOW(),
          updated_at = NOW()
        WHERE id = $1
      `, [
        connection.id,
        syncResult.discovery.accountName,
        syncResult.discovery.accountHandle,
        syncResult.discovery.avatarUrl,
        encryptSensitiveValue(syncResult.discovery.accessToken),
        syncResult.discovery.refreshToken
            ? encryptSensitiveValue(syncResult.discovery.refreshToken)
            : null,
        syncResult.discovery.tokenExpiresAt?.toISOString() ?? null,
        JSON.stringify(syncResult.discovery.scopes),
        JSON.stringify(syncResult.discovery.metadata),
    ]);
    await updateIntegrationStatusForProvider(request.user.organizationId, connection.provider);
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "integration_synced",
        context: { provider: connection.provider, connectionId: connection.id },
    });
    return response.json({
        connection: toPublicConnection({
            ...connection,
            accountName: syncResult.discovery.accountName,
            accountHandle: syncResult.discovery.accountHandle,
            avatarUrl: syncResult.discovery.avatarUrl,
            accessToken: syncResult.discovery.accessToken,
            refreshToken: syncResult.discovery.refreshToken,
            tokenExpiresAt: syncResult.discovery.tokenExpiresAt?.toISOString() ?? null,
            scopes: syncResult.discovery.scopes,
            metadata: syncResult.discovery.metadata,
            lastSyncAt: new Date().toISOString(),
        }),
    });
}));
integrationsRouter.delete("/social/connections/:id", requireRole(["admin"]), asyncHandler(async (request, response) => {
    const result = await pool.query(`
        DELETE FROM social_connections
        WHERE id = $1 AND organization_id = $2
        RETURNING provider, account_name AS "accountName"
      `, [request.params.id, request.user.organizationId]);
    if (!result.rowCount) {
        return response.status(404).json({ message: "Compte social introuvable." });
    }
    await updateIntegrationStatusForProvider(request.user.organizationId, result.rows[0].provider);
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "integration_disconnected",
        context: {
            provider: result.rows[0].provider,
            accountName: result.rows[0].accountName,
        },
    });
    return response.json({ success: true });
}));
integrationsRouter.put("/:id", requireRole(["admin"]), asyncHandler(async (request, response) => {
    const input = parseOrRespond(integrationSchema, request.body, response);
    if (!input)
        return;
    const result = await pool.query(`
        UPDATE integrations
        SET status = $2,
            sync_frequency = $3,
            last_sync_at = CASE WHEN $2 = 'connected' THEN NOW() ELSE last_sync_at END,
            updated_at = NOW()
        WHERE id = $1 AND organization_id = $4
        RETURNING
          id,
          name,
          kind,
          status,
          sync_frequency AS "syncFrequency",
          details,
          last_sync_at AS "lastSyncAt"
      `, [
        request.params.id,
        input.status,
        input.syncFrequency,
        request.user.organizationId,
    ]);
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "integration_updated",
        context: { integrationId: request.params.id, status: input.status },
    });
    return response.json(result.rows[0]);
}));
integrationsRouter.post("/:id/sync", requireRole(["admin"]), asyncHandler(async (request, response) => {
    const integrationResult = await pool.query(`
        SELECT
          id,
          name,
          kind,
          status,
          sync_frequency AS "syncFrequency",
          details,
          last_sync_at AS "lastSyncAt"
        FROM integrations
        WHERE id = $1 AND organization_id = $2
      `, [request.params.id, request.user.organizationId]);
    if (!integrationResult.rowCount) {
        return response.status(404).json({ message: "Integration introuvable." });
    }
    const integration = integrationResult.rows[0];
    const provider = getIntegrationProvider(integration);
    if (provider) {
        const connections = await loadStoredConnections(request.user.organizationId);
        const providerConnections = connections.filter((connection) => connection.provider === provider);
        for (const connection of providerConnections) {
            const refreshed = await refreshConnectionIfNeeded(connection);
            if (refreshed) {
                await pool.query(`
              UPDATE social_connections
              SET access_token = $2,
                  refresh_token = $3,
                  token_expires_at = $4,
                  updated_at = NOW()
              WHERE id = $1
            `, [
                    connection.id,
                    encryptSensitiveValue(refreshed.accessToken),
                    refreshed.refreshToken
                        ? encryptSensitiveValue(refreshed.refreshToken)
                        : null,
                    refreshed.tokenExpiresAt?.toISOString() ?? null,
                ]);
            }
        }
        await pool.query(`
          UPDATE integrations
          SET status = CASE
                WHEN EXISTS (
                  SELECT 1
                  FROM social_connections
                  WHERE organization_id = $2
                    AND provider = $3
                    AND status = 'active'
                )
                THEN 'connected'
                ELSE 'attention'
              END,
              last_sync_at = NOW(),
              details = jsonb_set(
                jsonb_set(details, '{lastSyncStatus}', '"success"', true),
                '{lastSyncMessage}',
                to_jsonb($4::text),
                true
              ),
              updated_at = NOW()
          WHERE id = $1
        `, [
            request.params.id,
            request.user.organizationId,
            provider,
            "Synchronisation des connexions sociales executee avec succes.",
        ]);
    }
    else {
        await pool.query(`
          UPDATE integrations
          SET status = 'connected',
              last_sync_at = NOW(),
              details = jsonb_set(
                jsonb_set(details, '{lastSyncStatus}', '"success"', true),
                '{lastSyncMessage}',
                to_jsonb($2::text),
                true
              ),
              updated_at = NOW()
          WHERE id = $1 AND organization_id = $3
        `, [
            request.params.id,
            "Synchronisation manuelle executee avec succes.",
            request.user.organizationId,
        ]);
    }
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "integration_synced",
        context: { integrationId: request.params.id, provider },
    });
    const refreshed = await pool.query(`
        SELECT
          id,
          name,
          kind,
          status,
          sync_frequency AS "syncFrequency",
          details,
          last_sync_at AS "lastSyncAt"
        FROM integrations
        WHERE id = $1
      `, [request.params.id]);
    return response.json(refreshed.rows[0]);
}));
