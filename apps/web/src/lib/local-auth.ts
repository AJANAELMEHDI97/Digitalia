import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

export const TOKEN_STORAGE_KEY = "socialpulse-token";

const SESSION_STORAGE_KEY = "socialpulse-session";
const PROFILE_STORAGE_KEY = "socialpulse-profile";
const USER_STORAGE_KEY = "socialpulse-user";

type AuthListener = (event: AuthChangeEvent, session: Session | null) => void;

export interface LocalProfile {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
  organizationId: string | null;
  organizationName: string | null;
  title: string | null;
  avatarUrl: string | null;
  bio: string | null;
  theme: string | null;
  onboardingSteps: string[];
  notificationPreferences: Record<string, unknown> | null;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

const listeners = new Set<AuthListener>();

const isBrowser = () => typeof window !== "undefined";

const readJson = <T>(key: string): T | null => {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const writeJson = (key: string, value: unknown) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

const removeItem = (key: string) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(key);
};

const splitName = (fullName: string) => {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const parts = trimmed.split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
};

const normalizeRole = (role: unknown): string => {
  if (role === "super_admin" || role === "ops_admin" || role === "admin") {
    return "admin";
  }

  if (role === "community_manager" || role === "editor") {
    return "community_manager";
  }

  if (role === "lawyer" || role === "reader") {
    return "lawyer";
  }

  return "admin";
};

const toSupabaseUser = (profile: LocalProfile): User => {
  const { firstName, lastName } = splitName(profile.fullName);

  return {
    id: profile.userId,
    aud: "authenticated",
    role: "authenticated",
    email: profile.email,
    phone: "",
    app_metadata: {
      provider: "email",
      providers: ["email"],
      role: profile.role,
      organization_id: profile.organizationId,
    },
    user_metadata: {
      full_name: profile.fullName,
      first_name: firstName,
      last_name: lastName,
      role: profile.role,
      organization_name: profile.organizationName,
      title: profile.title,
      avatar_url: profile.avatarUrl,
    },
    identities: [],
    created_at: profile.createdAt,
    updated_at: profile.updatedAt,
  } as User;
};

const buildSession = (token: string, user: User): Session =>
  ({
    access_token: token,
    refresh_token: token,
    token_type: "bearer",
    expires_in: 8 * 60 * 60,
    expires_at: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
    user,
  }) as Session;

const emitAuthChange = (event: AuthChangeEvent, session: Session | null) => {
  listeners.forEach((listener) => listener(event, session));
};

const persistAuth = (token: string, profile: LocalProfile): Session => {
  const user = toSupabaseUser(profile);
  const session = buildSession(token, user);

  if (isBrowser()) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
  writeJson(PROFILE_STORAGE_KEY, profile);
  writeJson(USER_STORAGE_KEY, user);
  writeJson(SESSION_STORAGE_KEY, session);

  return session;
};

const buildProfileFromMe = (
  payload: Record<string, unknown>,
  fallback: Partial<LocalProfile> = {},
): LocalProfile => ({
  id: String(payload.id ?? fallback.id ?? `profile-${payload.email ?? "user"}`),
  userId: String(payload.id ?? fallback.userId ?? ""),
  email: String(payload.email ?? fallback.email ?? ""),
  fullName: String(payload.fullName ?? fallback.fullName ?? payload.email ?? "Utilisateur"),
  role: normalizeRole(payload.role ?? fallback.role),
  organizationId:
    payload.organizationId === null || payload.organizationId === undefined
      ? fallback.organizationId ?? null
      : String(payload.organizationId),
  organizationName:
    payload.organizationName === null || payload.organizationName === undefined
      ? fallback.organizationName ?? null
      : String(payload.organizationName),
  title:
    payload.title === null || payload.title === undefined
      ? fallback.title ?? null
      : String(payload.title),
  avatarUrl:
    payload.avatarUrl === null || payload.avatarUrl === undefined
      ? fallback.avatarUrl ?? null
      : String(payload.avatarUrl),
  bio:
    payload.bio === null || payload.bio === undefined
      ? fallback.bio ?? null
      : String(payload.bio),
  theme:
    payload.theme === null || payload.theme === undefined
      ? fallback.theme ?? null
      : String(payload.theme),
  onboardingSteps: Array.isArray(payload.onboardingSteps)
    ? payload.onboardingSteps.map((step) => String(step))
    : fallback.onboardingSteps ?? [],
  notificationPreferences:
    typeof payload.notificationPreferences === "object" && payload.notificationPreferences !== null
      ? (payload.notificationPreferences as Record<string, unknown>)
      : fallback.notificationPreferences ?? null,
  twoFactorEnabled: Boolean(payload.twoFactorEnabled ?? fallback.twoFactorEnabled ?? false),
  createdAt: String(fallback.createdAt ?? new Date().toISOString()),
  updatedAt: new Date().toISOString(),
});

const parseJsonResponse = async (response: Response) =>
  ((await response.json().catch(() => ({}))) as Record<string, unknown>);

const toError = (payload: Record<string, unknown>, fallback: string) => {
  const message =
    typeof payload.message === "string" && payload.message.trim()
      ? payload.message
      : fallback;
  return new Error(message);
};

export const getStoredSession = (): Session | null =>
  readJson<Session>(SESSION_STORAGE_KEY);

export const getStoredUser = (): User | null => {
  const session = getStoredSession();
  if (session?.user) {
    return session.user;
  }
  return readJson<User>(USER_STORAGE_KEY);
};

export const getStoredProfile = (): LocalProfile | null =>
  readJson<LocalProfile>(PROFILE_STORAGE_KEY);

export const updateStoredProfile = (updates: Partial<LocalProfile>) => {
  const current = getStoredProfile();
  if (!current) {
    return null;
  }

  const nextProfile: LocalProfile = {
    ...current,
    ...updates,
    role: normalizeRole(updates.role ?? current.role),
    updatedAt: new Date().toISOString(),
  };

  const token = isBrowser() ? window.localStorage.getItem(TOKEN_STORAGE_KEY) : null;
  const session = token ? persistAuth(token, nextProfile) : null;

  if (!token) {
    writeJson(PROFILE_STORAGE_KEY, nextProfile);
    writeJson(USER_STORAGE_KEY, toSupabaseUser(nextProfile));
  }

  emitAuthChange("TOKEN_REFRESHED", session);
  return nextProfile;
};

export const subscribeToAuth = (listener: AuthListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const clearStoredAuth = () => {
  removeItem(TOKEN_STORAGE_KEY);
  removeItem(SESSION_STORAGE_KEY);
  removeItem(PROFILE_STORAGE_KEY);
  removeItem(USER_STORAGE_KEY);
};

export const refreshStoredSession = async (): Promise<Session | null> => {
  if (!isBrowser()) {
    return null;
  }

  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) {
    return null;
  }

  const fallback = getStoredProfile() ?? undefined;
  const response = await fetch("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    clearStoredAuth();
    emitAuthChange("SIGNED_OUT", null);
    return null;
  }

  const payload = await parseJsonResponse(response);
  const profile = buildProfileFromMe(payload, fallback);
  const session = persistAuth(token, profile);
  emitAuthChange("TOKEN_REFRESHED", session);
  return session;
};

export const signInWithBackend = async (email: string, password: string) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const payload = await parseJsonResponse(response);
  if (!response.ok) {
    return {
      data: { user: null, session: null },
      error: toError(payload, "Impossible de se connecter."),
    };
  }

  const rawUser = (payload.user ?? {}) as Record<string, unknown>;
  const profile = buildProfileFromMe(
    {
      id: rawUser.id,
      email: rawUser.email,
      role: rawUser.role,
      fullName: rawUser.fullName,
      organizationId: rawUser.organizationId,
    },
    {
      organizationName: getStoredProfile()?.organizationName ?? "Organisation",
    },
  );
  const token = String(payload.token ?? "");
  const session = persistAuth(token, profile);
  const freshSession = (await refreshStoredSession().catch(() => null)) ?? session;
  emitAuthChange("SIGNED_IN", freshSession);

  return {
    data: { user: freshSession.user, session: freshSession },
    error: null,
  };
};

export const signUpWithBackend = async (
  email: string,
  password: string,
  fullName: string,
  organizationName: string,
) => {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      fullName,
      organizationName,
    }),
  });

  const payload = await parseJsonResponse(response);
  if (!response.ok) {
    return {
      data: { user: null, session: null },
      error: toError(payload, "Impossible de creer le compte."),
    };
  }

  const rawUser = (payload.user ?? {}) as Record<string, unknown>;
  const profile = buildProfileFromMe({
    id: rawUser.id,
    email: rawUser.email,
    role: rawUser.role,
    fullName: rawUser.fullName ?? fullName,
    organizationId: rawUser.organizationId,
    organizationName,
  });
  const token = String(payload.token ?? "");
  const session = persistAuth(token, profile);
  const freshSession = (await refreshStoredSession().catch(() => null)) ?? session;
  emitAuthChange("SIGNED_IN", freshSession);

  return {
    data: { user: freshSession.user, session: freshSession },
    error: null,
  };
};

export const signOutFromBackend = async () => {
  clearStoredAuth();
  emitAuthChange("SIGNED_OUT", null);
};

export const unsupportedLocalAuth = (message: string) => ({
  data: { user: null, session: null },
  error: new Error(message),
});
