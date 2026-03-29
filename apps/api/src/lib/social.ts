import jwt from "jsonwebtoken";
import { createCipheriv, createDecipheriv, createHash, randomBytes, } from "node:crypto";
import { env } from "../config/env.js";
export const socialProviders = [
    "linkedin",
    "facebook",
    "instagram",
    "youtube",
];
const providerDefinitions = {
    linkedin: {
        provider: "linkedin",
        name: "LinkedIn",
        description: "Connexion OAuth officielle et publication organique sur profil ou organisation selon vos droits.",
        scopes: ["openid", "profile", "email", "w_member_social"],
        capabilities: ["connect", "sync_profile", "publish_text"],
    },
    facebook: {
        provider: "facebook",
        name: "Facebook Pages",
        description: "Connexion Meta officielle pour synchroniser les Pages et publier des posts texte ou image.",
        scopes: [
            "pages_show_list",
            "pages_read_engagement",
            "pages_manage_posts",
            "business_management",
            "instagram_basic",
            "instagram_content_publish",
        ],
        capabilities: ["connect", "sync_page", "publish_text", "publish_image"],
    },
    instagram: {
        provider: "instagram",
        name: "Instagram Business",
        description: "Connexion Meta officielle avec publication image sur compte Business relie a une Page Facebook.",
        scopes: [
            "pages_show_list",
            "pages_read_engagement",
            "pages_manage_posts",
            "business_management",
            "instagram_basic",
            "instagram_content_publish",
        ],
        capabilities: ["connect", "sync_business", "publish_image"],
    },
    youtube: {
        provider: "youtube",
        name: "YouTube",
        description: "Connexion Google officielle avec synchronisation de chaine et upload video depuis la Media Library.",
        scopes: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/youtube.readonly",
            "https://www.googleapis.com/auth/youtube.upload",
        ],
        capabilities: ["connect", "sync_channel", "upload_video"],
    },
};
const baseApiUrl = env.API_PUBLIC_URL.trim() || `http://localhost:${env.PORT.toString()}`;
const providerRedirectUris = {
    linkedin: env.LINKEDIN_REDIRECT_URI.trim() ||
        `${baseApiUrl}/integrations/oauth/linkedin/callback`,
    facebook: env.META_FACEBOOK_REDIRECT_URI.trim() ||
        env.META_REDIRECT_URI.trim() ||
        `${baseApiUrl}/integrations/oauth/facebook/callback`,
    instagram: env.META_INSTAGRAM_REDIRECT_URI.trim() ||
        env.META_REDIRECT_URI.trim() ||
        `${baseApiUrl}/integrations/oauth/instagram/callback`,
    youtube: env.GOOGLE_REDIRECT_URI.trim() ||
        `${baseApiUrl}/integrations/oauth/youtube/callback`,
};
const getProviderSecrets = (provider) => {
    if (provider === "linkedin") {
        return {
            clientId: env.LINKEDIN_CLIENT_ID.trim(),
            clientSecret: env.LINKEDIN_CLIENT_SECRET.trim(),
        };
    }
    if (provider === "youtube") {
        return {
            clientId: env.GOOGLE_CLIENT_ID.trim(),
            clientSecret: env.GOOGLE_CLIENT_SECRET.trim(),
        };
    }
    return {
        clientId: env.META_CLIENT_ID.trim(),
        clientSecret: env.META_CLIENT_SECRET.trim(),
    };
};
export const getProviderCatalog = () => socialProviders.map((provider) => {
    const secrets = getProviderSecrets(provider);
    const missingEnv = [];
    if (!secrets.clientId) {
        missingEnv.push(provider === "linkedin"
            ? "LINKEDIN_CLIENT_ID"
            : provider === "youtube"
                ? "GOOGLE_CLIENT_ID"
                : "META_CLIENT_ID");
    }
    if (!secrets.clientSecret) {
        missingEnv.push(provider === "linkedin"
            ? "LINKEDIN_CLIENT_SECRET"
            : provider === "youtube"
                ? "GOOGLE_CLIENT_SECRET"
                : "META_CLIENT_SECRET");
    }
    return {
        ...providerDefinitions[provider],
        configured: missingEnv.length === 0,
        missingEnv,
    };
});
const getProviderCatalogItem = (provider) => getProviderCatalog().find((item) => item.provider === provider);
const getTokenKey = () => createHash("sha256").update(env.SOCIAL_TOKEN_SECRET).digest();
export const encryptSensitiveValue = (value) => {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", getTokenKey(), iv);
    const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
};
export const decryptSensitiveValue = (payload) => {
    if (!payload) {
        return null;
    }
    const [ivBase64, tagBase64, encryptedBase64] = payload.split(".");
    if (!ivBase64 || !tagBase64 || !encryptedBase64) {
        return payload;
    }
    const decipher = createDecipheriv("aes-256-gcm", getTokenKey(), Buffer.from(ivBase64, "base64"));
    decipher.setAuthTag(Buffer.from(tagBase64, "base64"));
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedBase64, "base64")),
        decipher.final(),
    ]);
    return decrypted.toString("utf8");
};
export const createSocialState = (payload) => jwt.sign(payload, env.JWT_SECRET, { expiresIn: "15m" });
export const verifySocialState = (state) => jwt.verify(state, env.JWT_SECRET);
const toQueryString = (payload) => new URLSearchParams(payload).toString();
const splitScopes = (scopeValue, fallback) => scopeValue?.split(/[ ,]+/).map((item) => item.trim()).filter(Boolean) ?? fallback;
const addSeconds = (seconds) => seconds ? new Date(Date.now() + seconds * 1000) : null;
const normalizeProviderError = async (response) => {
    const text = await response.text();
    try {
        const parsed = JSON.parse(text);
        if (typeof parsed.error === "object" && parsed.error?.message) {
            return parsed.error.message;
        }
        return parsed.error_description ?? parsed.error ?? text;
    }
    catch {
        return text;
    }
};
const requestJson = async (url, init, errorPrefix) => {
    const response = await fetch(url, init);
    if (!response.ok) {
        const errorMessage = await normalizeProviderError(response);
        throw new Error(`${errorPrefix}: ${errorMessage}`);
    }
    const text = await response.text();
    return (text ? JSON.parse(text) : {});
};
const buildMetaLongLivedTokenUrl = (shortLivedToken) => `https://graph.facebook.com/v20.0/oauth/access_token?${toQueryString({
    grant_type: "fb_exchange_token",
    client_id: env.META_CLIENT_ID,
    client_secret: env.META_CLIENT_SECRET,
    fb_exchange_token: shortLivedToken,
})}`;
export const buildProviderAuthorizationUrl = (provider, state) => {
    const catalog = getProviderCatalogItem(provider);
    const secrets = getProviderSecrets(provider);
    if (!catalog.configured) {
        throw new Error(`${catalog.name} n'est pas configure. Variables manquantes: ${catalog.missingEnv.join(", ")}.`);
    }
    if (provider === "linkedin") {
        return `https://www.linkedin.com/oauth/v2/authorization?${toQueryString({
            response_type: "code",
            client_id: secrets.clientId,
            redirect_uri: providerRedirectUris.linkedin,
            state,
            scope: catalog.scopes.join(" "),
        })}`;
    }
    if (provider === "youtube") {
        return `https://accounts.google.com/o/oauth2/v2/auth?${toQueryString({
            client_id: secrets.clientId,
            redirect_uri: providerRedirectUris.youtube,
            response_type: "code",
            access_type: "offline",
            prompt: "consent",
            include_granted_scopes: "true",
            scope: catalog.scopes.join(" "),
            state,
        })}`;
    }
    return `https://www.facebook.com/v20.0/dialog/oauth?${toQueryString({
        client_id: secrets.clientId,
        redirect_uri: providerRedirectUris[provider],
        response_type: "code",
        scope: catalog.scopes.join(","),
        state,
    })}`;
};
const exchangeLinkedInCode = async (code) => {
    const token = await requestJson("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: providerRedirectUris.linkedin,
            client_id: env.LINKEDIN_CLIENT_ID,
            client_secret: env.LINKEDIN_CLIENT_SECRET,
        }),
    }, "Connexion LinkedIn impossible");
    const profile = await requestJson("https://api.linkedin.com/v2/userinfo", {
        headers: {
            Authorization: `Bearer ${token.access_token}`,
        },
    }, "Lecture du profil LinkedIn impossible");
    return [
        {
            provider: "linkedin",
            accountId: profile.sub,
            accountName: profile.name ||
                `${profile.given_name ?? ""} ${profile.family_name ?? ""}`.trim() ||
                "LinkedIn Member",
            accountHandle: profile.email ?? `linkedin:${profile.sub}`,
            accountType: "member",
            avatarUrl: profile.picture ?? null,
            accessToken: token.access_token,
            refreshToken: token.refresh_token ?? null,
            tokenExpiresAt: addSeconds(token.expires_in),
            scopes: splitScopes(token.scope, providerDefinitions.linkedin.scopes),
            metadata: {
                authorUrn: `urn:li:person:${profile.sub}`,
                email: profile.email ?? null,
            },
        },
    ];
};
const exchangeMetaCode = async (provider, code) => {
    const shortToken = await requestJson(`https://graph.facebook.com/v20.0/oauth/access_token?${toQueryString({
        client_id: env.META_CLIENT_ID,
        client_secret: env.META_CLIENT_SECRET,
        redirect_uri: providerRedirectUris[provider],
        code,
    })}`, { method: "GET" }, "Connexion Meta impossible");
    const longLivedToken = await requestJson(buildMetaLongLivedTokenUrl(shortToken.access_token), { method: "GET" }, "Extension du token Meta impossible");
    const pages = await requestJson(`https://graph.facebook.com/v20.0/me/accounts?${toQueryString({
        fields: "id,name,access_token,picture{url},instagram_business_account{id,username,profile_picture_url}",
        limit: "50",
        access_token: longLivedToken.access_token,
    })}`, { method: "GET" }, "Lecture des Pages Facebook impossible");
    const discoveries = [];
    for (const page of pages.data) {
        discoveries.push({
            provider: "facebook",
            accountId: page.id,
            accountName: page.name,
            accountHandle: page.name,
            accountType: "page",
            avatarUrl: page.picture?.data?.url ?? null,
            accessToken: page.access_token,
            refreshToken: null,
            tokenExpiresAt: addSeconds(longLivedToken.expires_in),
            scopes: providerDefinitions.facebook.scopes,
            metadata: {
                pageId: page.id,
                pageName: page.name,
            },
        });
        if (page.instagram_business_account?.id) {
            discoveries.push({
                provider: "instagram",
                accountId: page.instagram_business_account.id,
                accountName: page.name,
                accountHandle: page.instagram_business_account.username ??
                    `instagram:${page.instagram_business_account.id}`,
                accountType: "business",
                avatarUrl: page.instagram_business_account.profile_picture_url ?? null,
                accessToken: page.access_token,
                refreshToken: null,
                tokenExpiresAt: addSeconds(longLivedToken.expires_in),
                scopes: providerDefinitions.instagram.scopes,
                metadata: {
                    pageId: page.id,
                    pageName: page.name,
                    instagramUserId: page.instagram_business_account.id,
                    instagramUsername: page.instagram_business_account.username ?? null,
                },
            });
        }
    }
    return discoveries;
};
const exchangeGoogleCode = async (code) => {
    const token = await requestJson("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            code,
            client_id: env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            redirect_uri: providerRedirectUris.youtube,
            grant_type: "authorization_code",
        }),
    }, "Connexion Google impossible");
    const channels = await requestJson("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", {
        headers: {
            Authorization: `Bearer ${token.access_token}`,
        },
    }, "Lecture de la chaine YouTube impossible");
    if (!channels.items.length) {
        throw new Error("Aucune chaine YouTube n'est associee a ce compte Google. Creez une chaine avant de connecter YouTube.");
    }
    return channels.items.map((channel) => ({
        provider: "youtube",
        accountId: channel.id,
        accountName: channel.snippet?.title ?? "YouTube Channel",
        accountHandle: channel.snippet?.customUrl ?? `youtube:${channel.id}`,
        accountType: "channel",
        avatarUrl: channel.snippet?.thumbnails?.high?.url ??
            channel.snippet?.thumbnails?.medium?.url ??
            channel.snippet?.thumbnails?.default?.url ??
            null,
        accessToken: token.access_token,
        refreshToken: token.refresh_token ?? null,
        tokenExpiresAt: addSeconds(token.expires_in),
        scopes: splitScopes(token.scope, providerDefinitions.youtube.scopes),
        metadata: {
            channelId: channel.id,
            customUrl: channel.snippet?.customUrl ?? null,
        },
    }));
};
export const exchangeCodeForConnections = async (provider, code) => {
    if (provider === "linkedin") {
        return exchangeLinkedInCode(code);
    }
    if (provider === "youtube") {
        return exchangeGoogleCode(code);
    }
    return exchangeMetaCode(provider, code);
};
const refreshGoogleToken = async (connection) => {
    if (!connection.refreshToken) {
        return null;
    }
    const expiresAt = connection.tokenExpiresAt
        ? new Date(connection.tokenExpiresAt).getTime()
        : 0;
    if (expiresAt > Date.now() + 5 * 60 * 1000) {
        return null;
    }
    const token = await requestJson("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            refresh_token: connection.refreshToken,
            grant_type: "refresh_token",
        }),
    }, "Rafraichissement Google impossible");
    return {
        accessToken: token.access_token,
        refreshToken: connection.refreshToken,
        tokenExpiresAt: addSeconds(token.expires_in),
    };
};
export const refreshConnectionIfNeeded = async (connection) => {
    if (connection.provider !== "youtube") {
        return null;
    }
    return refreshGoogleToken(connection);
};
export const syncProviderConnection = async (connection) => {
    const refreshedCredentials = await refreshConnectionIfNeeded(connection);
    const accessToken = refreshedCredentials?.accessToken ?? connection.accessToken;
    if (connection.provider === "linkedin") {
        const profile = await requestJson("https://api.linkedin.com/v2/userinfo", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }, "Synchronisation LinkedIn impossible");
        return {
            discovery: {
                provider: "linkedin",
                accountId: profile.sub,
                accountName: profile.name ?? connection.accountName,
                accountHandle: profile.email ?? connection.accountHandle,
                accountType: "member",
                avatarUrl: profile.picture ?? connection.avatarUrl,
                accessToken,
                refreshToken: refreshedCredentials?.refreshToken ?? connection.refreshToken,
                tokenExpiresAt: refreshedCredentials?.tokenExpiresAt ??
                    (connection.tokenExpiresAt ? new Date(connection.tokenExpiresAt) : null),
                scopes: connection.scopes,
                metadata: {
                    ...connection.metadata,
                    authorUrn: `urn:li:person:${profile.sub}`,
                    email: profile.email ?? null,
                },
            },
            refreshedCredentials,
        };
    }
    if (connection.provider === "facebook") {
        const page = await requestJson(`https://graph.facebook.com/v20.0/${connection.accountId}?${toQueryString({
            fields: "id,name,picture{url}",
        })}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }, "Synchronisation Facebook impossible");
        return {
            discovery: {
                provider: "facebook",
                accountId: page.id,
                accountName: page.name,
                accountHandle: page.name,
                accountType: "page",
                avatarUrl: page.picture?.data?.url ?? connection.avatarUrl,
                accessToken,
                refreshToken: null,
                tokenExpiresAt: refreshedCredentials?.tokenExpiresAt ??
                    (connection.tokenExpiresAt ? new Date(connection.tokenExpiresAt) : null),
                scopes: connection.scopes,
                metadata: {
                    ...connection.metadata,
                    pageId: page.id,
                    pageName: page.name,
                },
            },
            refreshedCredentials,
        };
    }
    if (connection.provider === "instagram") {
        const account = await requestJson(`https://graph.facebook.com/v20.0/${connection.accountId}?${toQueryString({
            fields: "id,username,profile_picture_url",
        })}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }, "Synchronisation Instagram impossible");
        return {
            discovery: {
                provider: "instagram",
                accountId: account.id,
                accountName: connection.accountName,
                accountHandle: account.username ?? connection.accountHandle,
                accountType: "business",
                avatarUrl: account.profile_picture_url ?? connection.avatarUrl,
                accessToken,
                refreshToken: null,
                tokenExpiresAt: refreshedCredentials?.tokenExpiresAt ??
                    (connection.tokenExpiresAt ? new Date(connection.tokenExpiresAt) : null),
                scopes: connection.scopes,
                metadata: {
                    ...connection.metadata,
                    instagramUserId: account.id,
                    instagramUsername: account.username ?? null,
                },
            },
            refreshedCredentials,
        };
    }
    const channels = await requestJson("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    }, "Synchronisation YouTube impossible");
    const channel = channels.items.find((item) => item.id === connection.accountId) ??
        channels.items[0];
    return {
        discovery: {
            provider: "youtube",
            accountId: channel.id,
            accountName: channel.snippet?.title ?? connection.accountName,
            accountHandle: channel.snippet?.customUrl ?? connection.accountHandle,
            accountType: "channel",
            avatarUrl: channel.snippet?.thumbnails?.high?.url ??
                channel.snippet?.thumbnails?.medium?.url ??
                channel.snippet?.thumbnails?.default?.url ??
                connection.avatarUrl,
            accessToken,
            refreshToken: refreshedCredentials?.refreshToken ?? connection.refreshToken,
            tokenExpiresAt: refreshedCredentials?.tokenExpiresAt ??
                (connection.tokenExpiresAt ? new Date(connection.tokenExpiresAt) : null),
            scopes: connection.scopes,
            metadata: {
                ...connection.metadata,
                channelId: channel.id,
                customUrl: channel.snippet?.customUrl ?? null,
            },
        },
        refreshedCredentials: refreshedCredentials ?? undefined,
    };
};
const isPublicMediaUrl = (value) => {
    try {
        const parsed = new URL(value);
        if (!["http:", "https:"].includes(parsed.protocol)) {
            return false;
        }
        if (["localhost", "127.0.0.1", "0.0.0.0"].includes(parsed.hostname) ||
            parsed.hostname.endsWith(".local")) {
            return false;
        }
        if (/^10\./.test(parsed.hostname) ||
            /^192\.168\./.test(parsed.hostname) ||
            /^172\.(1[6-9]|2\d|3[0-1])\./.test(parsed.hostname)) {
            return false;
        }
        return true;
    }
    catch {
        return false;
    }
};
const withHashtags = (content, hashtags) => {
    const suffix = hashtags.length ? `\n\n${hashtags.join(" ")}` : "";
    return `${content.trim()}${suffix}`.trim();
};
const pickFirstAsset = (mediaItems, type) => mediaItems.find((item) => item.type === type) ?? null;
const publishToLinkedIn = async (connection, post) => {
    if (!env.ENABLE_LINKEDIN_PUBLISHING) {
        throw new Error("Publication LinkedIn desactivee en mode securise. La connexion OAuth reste disponible, mais aucun contenu ne sera publie tant que ce verrou n'est pas retire.");
    }
    const refreshedCredentials = await refreshConnectionIfNeeded(connection);
    const accessToken = refreshedCredentials?.accessToken ?? connection.accessToken;
    const authorUrn = typeof connection.metadata.authorUrn === "string"
        ? connection.metadata.authorUrn
        : `urn:li:person:${connection.accountId}`;
    const commentary = `${post.title}\n\n${withHashtags(post.content, post.hashtags)}`.trim();
    const response = await fetch("https://api.linkedin.com/rest/posts", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
            "Linkedin-Version": "202504",
        },
        body: JSON.stringify({
            author: authorUrn,
            commentary,
            visibility: "PUBLIC",
            distribution: {
                feedDistribution: "MAIN_FEED",
                targetEntities: [],
                thirdPartyDistributionChannels: [],
            },
            lifecycleState: "PUBLISHED",
            isReshareDisabledByAuthor: false,
        }),
    });
    if (!response.ok) {
        const errorMessage = await normalizeProviderError(response);
        throw new Error(`Publication LinkedIn impossible: ${errorMessage}`);
    }
    const postId = response.headers.get("x-restli-id") ?? "";
    return {
        provider: "linkedin",
        externalPostId: postId,
        publishedUrl: null,
        responseData: {
            restliId: postId,
        },
        refreshedCredentials: refreshedCredentials ?? undefined,
    };
};
const deleteLinkedInPublication = async (connection, externalPostId) => {
    const refreshedCredentials = await refreshConnectionIfNeeded(connection);
    const accessToken = refreshedCredentials?.accessToken ?? connection.accessToken;
    const encodedPostUrn = encodeURIComponent(externalPostId);
    const response = await fetch(`https://api.linkedin.com/rest/posts/${encodedPostUrn}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0",
            "Linkedin-Version": "202504",
            "X-RestLi-Method": "DELETE",
        },
    });
    if (response.status === 404) {
        return {
            provider: "linkedin",
            externalPostId,
            responseData: {
                deleted: true,
                alreadyMissing: true,
            },
            refreshedCredentials: refreshedCredentials ?? undefined,
        };
    }
    if (!response.ok) {
        const errorMessage = await normalizeProviderError(response);
        throw new Error(`Suppression LinkedIn impossible: ${errorMessage}`);
    }
    return {
        provider: "linkedin",
        externalPostId,
        responseData: {
            deleted: true,
        },
        refreshedCredentials: refreshedCredentials ?? undefined,
    };
};
const publishToFacebook = async (connection, post, mediaItems) => {
    const image = pickFirstAsset(mediaItems, "image");
    const accessToken = connection.accessToken;
    if (image && isPublicMediaUrl(image.url)) {
        const payload = await requestJson(`https://graph.facebook.com/v20.0/${connection.accountId}/photos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url: image.url,
                caption: `${post.title}\n\n${withHashtags(post.content, post.hashtags)}`.trim(),
                access_token: accessToken,
            }),
        }, "Publication Facebook impossible");
        return {
            provider: "facebook",
            externalPostId: payload.post_id ?? payload.id,
            publishedUrl: null,
            responseData: payload,
        };
    }
    const payload = await requestJson(`https://graph.facebook.com/v20.0/${connection.accountId}/feed`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            message: `${post.title}\n\n${withHashtags(post.content, post.hashtags)}`.trim(),
            access_token: accessToken,
        }),
    }, "Publication Facebook impossible");
    return {
        provider: "facebook",
        externalPostId: payload.id,
        publishedUrl: null,
        responseData: payload,
    };
};
const publishToInstagram = async (connection, post, mediaItems) => {
    const image = pickFirstAsset(mediaItems, "image");
    if (!image) {
        throw new Error("Instagram exige un media image. Ajoutez une image a la publication.");
    }
    if (!isPublicMediaUrl(image.url)) {
        throw new Error("Instagram exige une URL d'image publiquement accessible. Les assets locaux non exposes publiquement ne peuvent pas etre publies sur Meta.");
    }
    const caption = `${post.title}\n\n${withHashtags(post.content, post.hashtags)}`.trim();
    const creation = await requestJson(`https://graph.facebook.com/v20.0/${connection.accountId}/media`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            image_url: image.url,
            caption,
            access_token: connection.accessToken,
        }),
    }, "Preparation Instagram impossible");
    const publication = await requestJson(`https://graph.facebook.com/v20.0/${connection.accountId}/media_publish`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            creation_id: creation.id,
            access_token: connection.accessToken,
        }),
    }, "Publication Instagram impossible");
    return {
        provider: "instagram",
        externalPostId: publication.id,
        publishedUrl: null,
        responseData: {
            creationId: creation.id,
            publishedMediaId: publication.id,
        },
    };
};
const publishToYouTube = async (connection, post, mediaItems) => {
    const video = pickFirstAsset(mediaItems, "video");
    if (!video) {
        throw new Error("YouTube exige un asset video. Ajoutez une video depuis la Media Library avant publication.");
    }
    const refreshedCredentials = await refreshConnectionIfNeeded(connection);
    const accessToken = refreshedCredentials?.accessToken ?? connection.accessToken;
    const videoResponse = await fetch(video.url);
    if (!videoResponse.ok) {
        throw new Error("Impossible de recuperer le media video pour YouTube.");
    }
    const buffer = Buffer.from(await videoResponse.arrayBuffer());
    const contentType = videoResponse.headers.get("content-type") ??
        (video.format === "WEBM" ? "video/webm" : "video/mp4");
    const metadata = {
        snippet: {
            title: post.title,
            description: withHashtags(post.content, post.hashtags),
            tags: post.hashtags.map((tag) => tag.replace(/^#/, "")),
            categoryId: "22",
        },
        status: {
            privacyStatus: "public",
        },
    };
    const sessionStart = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json; charset=UTF-8",
            "X-Upload-Content-Length": buffer.length.toString(),
            "X-Upload-Content-Type": contentType,
        },
        body: JSON.stringify(metadata),
    });
    if (!sessionStart.ok) {
        const errorMessage = await normalizeProviderError(sessionStart);
        throw new Error(`Preparation YouTube impossible: ${errorMessage}`);
    }
    const uploadUrl = sessionStart.headers.get("location");
    if (!uploadUrl) {
        throw new Error("Google n'a pas retourne d'URL de session resumable.");
    }
    const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Length": buffer.length.toString(),
            "Content-Type": contentType,
        },
        body: buffer,
    });
    if (!uploadResponse.ok) {
        const errorMessage = await normalizeProviderError(uploadResponse);
        throw new Error(`Upload YouTube impossible: ${errorMessage}`);
    }
    const published = (await uploadResponse.json());
    return {
        provider: "youtube",
        externalPostId: published.id,
        publishedUrl: `https://www.youtube.com/watch?v=${published.id}`,
        responseData: published,
        refreshedCredentials: refreshedCredentials ?? undefined,
    };
};
export const publishViaProvider = async ({ connection, post, mediaItems, }) => {
    if (connection.provider === "linkedin") {
        return publishToLinkedIn(connection, post);
    }
    if (connection.provider === "facebook") {
        return publishToFacebook(connection, post, mediaItems);
    }
    if (connection.provider === "instagram") {
        return publishToInstagram(connection, post, mediaItems);
    }
    return publishToYouTube(connection, post, mediaItems);
};
export const deleteViaProvider = async ({ connection, externalPostId, }) => {
    if (connection.provider === "linkedin") {
        return deleteLinkedInPublication(connection, externalPostId);
    }
    throw new Error("La suppression rapide n'est pas encore disponible pour ce reseau dans l'application.");
};
