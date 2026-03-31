import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import {
  getStoredProfile,
  getStoredSession,
  getStoredUser,
  refreshStoredSession,
  signInWithBackend,
  signOutFromBackend,
  signUpWithBackend,
  subscribeToAuth,
  unsupportedLocalAuth,
  updateStoredProfile,
} from "@/lib/local-auth";

type QueryResult<T = unknown> = {
  data: T | null;
  error: Error | null;
  count?: number | null;
};

type QueryMode = "select" | "insert" | "update" | "upsert" | "delete";
type SelectOptions = {
  count?: "exact" | "planned" | "estimated";
  head?: boolean;
};

const TABLE_PREFIX = "sp_local_table:";
const UPLOAD_PREFIX = "sp_local_upload:";

const isBrowser = () => typeof window !== "undefined";
const nowIso = () => new Date().toISOString();

const readJson = <T>(key: string, fallback: T): T => {
  if (!isBrowser()) {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

const createId = (prefix: string) => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeSimpleRole = (role: unknown) => {
  if (role === "community_manager" || role === "lawyer") {
    return role;
  }
  return "admin";
};

const toLegacyV2Role = (role: string) => {
  if (role === "community_manager") {
    return "community_manager";
  }
  if (role === "lawyer") {
    return "lawyer";
  }
  return "super_admin";
};

const toLegacyRole = (role: string) => {
  if (role === "community_manager") {
    return "moderator";
  }
  if (role === "lawyer") {
    return "user";
  }
  return "admin";
};

const buildProfileRow = () => {
  const profile = getStoredProfile();
  if (!profile) {
    return null;
  }

  const names = profile.fullName.trim().split(/\s+/);
  const firstName = names[0] ?? "";
  const lastName = names.slice(1).join(" ");

  return {
    id: profile.id,
    user_id: profile.userId,
    email: profile.email,
    full_name: profile.fullName,
    first_name: firstName || null,
    last_name: lastName || null,
    avatar_url: profile.avatarUrl,
    logo_url: null,
    role: profile.role,
    auto_validation_delay: "24h",
    onboarding_complete: profile.onboardingSteps.length > 0,
    notification_new_proposals: true,
    notification_reminders: true,
    website_url: null,
    cabinet_name: profile.organizationName,
    phone: null,
    address: null,
    city: null,
    postal_code: null,
    bar_association: null,
    bio: profile.bio,
    created_at: profile.createdAt,
    updated_at: profile.updatedAt,
  };
};

const buildLawFirmRow = () => {
  const profile = getStoredProfile();
  if (!profile?.organizationId) {
    return null;
  }

  return {
    id: profile.organizationId,
    name: profile.organizationName ?? "Organisation",
    city: null,
    bar_association: null,
    email: profile.email,
    phone: null,
    address: null,
    postal_code: null,
    logo_url: null,
    website_url: null,
    is_active: true,
    specialization_areas: [],
    editorial_tone: null,
    publication_frequency: "weekly",
    social_networks: [],
    subscription_plan: "starter",
    created_at: profile.createdAt,
  };
};

const buildSystemRows = (table: string): Record<string, unknown>[] => {
  const profile = getStoredProfile();
  const profileRow = buildProfileRow();
  const lawFirmRow = buildLawFirmRow();

  if (!profile) {
    return [];
  }

  switch (table) {
    case "profiles":
      return profileRow ? [profileRow] : [];
    case "user_roles_simple":
      return [
        {
          id: `simple-role-${profile.userId}`,
          user_id: profile.userId,
          role: normalizeSimpleRole(profile.role),
        },
      ];
    case "user_roles_v2":
      return [
        {
          id: `v2-role-${profile.userId}`,
          user_id: profile.userId,
          role: toLegacyV2Role(profile.role),
        },
      ];
    case "user_roles":
      return [
        {
          id: `legacy-role-${profile.userId}`,
          user_id: profile.userId,
          role: toLegacyRole(profile.role),
        },
      ];
    case "law_firms":
      return lawFirmRow ? [lawFirmRow] : [];
    case "law_firm_members":
      if (!lawFirmRow || profile.role === "community_manager") {
        return [];
      }
      return [
        {
          id: `member-${profile.userId}`,
          law_firm_id: lawFirmRow.id,
          user_id: profile.userId,
          role: profile.role === "admin" ? "lawyer" : profile.role,
          is_primary: true,
          can_validate: true,
        },
      ];
    case "cm_assignments":
      if (!lawFirmRow || profile.role !== "community_manager") {
        return [];
      }
      return [
        {
          id: `cm-${profile.userId}`,
          cm_user_id: profile.userId,
          lawyer_user_id: null,
          law_firm_id: lawFirmRow.id,
          is_active: true,
          created_at: profile.createdAt,
        },
      ];
    default:
      return [];
  }
};

const getTableKey = (table: string) => `${TABLE_PREFIX}${table}`;
const rowKey = (row: Record<string, unknown>, index: number) =>
  String(row.id ?? row.user_id ?? row.email ?? `row-${index}`);

const mergeRows = (
  systemRows: Record<string, unknown>[],
  storedRows: Record<string, unknown>[],
) => {
  const byKey = new Map<string, Record<string, unknown>>();

  systemRows.forEach((row, index) => {
    byKey.set(rowKey(row, index), row);
  });
  storedRows.forEach((row, index) => {
    byKey.set(rowKey(row, index), row);
  });

  return Array.from(byKey.values());
};

const readTable = (table: string) =>
  mergeRows(buildSystemRows(table), readJson<Record<string, unknown>[]>(getTableKey(table), []));

const syncProfileMutation = (table: string, rows: Record<string, unknown>[]) => {
  const profile = getStoredProfile();
  if (!profile) {
    return;
  }

  if (table === "profiles") {
    const currentRow = rows.find((row) => row.user_id === profile.userId);
    if (!currentRow) {
      return;
    }

    updateStoredProfile({
      fullName: String(currentRow.full_name ?? profile.fullName),
      email: String(currentRow.email ?? profile.email),
      role: String(currentRow.role ?? profile.role),
      organizationName:
        currentRow.cabinet_name === null || currentRow.cabinet_name === undefined
          ? profile.organizationName
          : String(currentRow.cabinet_name),
      avatarUrl:
        currentRow.avatar_url === null || currentRow.avatar_url === undefined
          ? profile.avatarUrl
          : String(currentRow.avatar_url),
      bio:
        currentRow.bio === null || currentRow.bio === undefined
          ? profile.bio
          : String(currentRow.bio),
    });
  }

  if (table === "user_roles_simple") {
    const currentRow = rows.find((row) => row.user_id === profile.userId);
    if (currentRow?.role) {
      updateStoredProfile({ role: String(currentRow.role) });
    }
  }

  if (table === "user_roles_v2") {
    const currentRow = rows.find((row) => row.user_id === profile.userId);
    if (currentRow?.role) {
      const nextRole =
        currentRow.role === "community_manager"
          ? "community_manager"
          : currentRow.role === "lawyer"
            ? "lawyer"
            : "admin";
      updateStoredProfile({ role: nextRole });
    }
  }

  if (table === "law_firms" && profile.organizationId) {
    const currentFirm = rows.find((row) => row.id === profile.organizationId);
    if (currentFirm?.name) {
      updateStoredProfile({ organizationName: String(currentFirm.name) });
    }
  }
};

const writeTable = (table: string, rows: Record<string, unknown>[]) => {
  writeJson(getTableKey(table), rows);
  syncProfileMutation(table, rows);
};

const getFieldValue = (row: Record<string, unknown>, field: string): unknown =>
  field.split(".").reduce<unknown>((value, key) => {
    if (value && typeof value === "object" && key in (value as Record<string, unknown>)) {
      return (value as Record<string, unknown>)[key];
    }
    return undefined;
  }, row);

const compareValues = (left: unknown, right: unknown) => {
  if (left === right) {
    return 0;
  }
  if (left === null || left === undefined) {
    return -1;
  }
  if (right === null || right === undefined) {
    return 1;
  }

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left).localeCompare(String(right));
};

const placeholderImage = (label: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="100%" height="100%" fill="#f4f4f5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#18181b" font-size="42" font-family="Arial">${label}</text></svg>`,
  )}`;

class LocalQueryBuilder {
  private table: string;
  private mode: QueryMode = "select";
  private payload: unknown = null;
  private selectColumns = "*";
  private selectOptions: SelectOptions = {};
  private returningColumns: string | null = null;
  private filters: Array<(row: Record<string, unknown>) => boolean> = [];
  private orderRules: Array<{ column: string; ascending: boolean }> = [];
  private singleMode: "single" | "maybeSingle" | null = null;
  private limitValue: number | null = null;
  private rangeValue: { from: number; to: number } | null = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns = "*", options: SelectOptions = {}) {
    if (this.mode === "select") {
      this.selectColumns = columns;
      this.selectOptions = options;
    } else {
      this.returningColumns = columns;
    }
    return this.proxy();
  }

  insert(payload: unknown) {
    this.mode = "insert";
    this.payload = payload;
    return this.proxy();
  }

  update(payload: unknown) {
    this.mode = "update";
    this.payload = payload;
    return this.proxy();
  }

  upsert(payload: unknown) {
    this.mode = "upsert";
    this.payload = payload;
    return this.proxy();
  }

  delete() {
    this.mode = "delete";
    return this.proxy();
  }

  eq(column: string, value: unknown) {
    this.filters.push((row) => getFieldValue(row, column) === value);
    return this.proxy();
  }

  neq(column: string, value: unknown) {
    this.filters.push((row) => getFieldValue(row, column) !== value);
    return this.proxy();
  }

  in(column: string, values: unknown[]) {
    this.filters.push((row) => values.includes(getFieldValue(row, column)));
    return this.proxy();
  }

  gt(column: string, value: unknown) {
    this.filters.push((row) => compareValues(getFieldValue(row, column), value) > 0);
    return this.proxy();
  }

  gte(column: string, value: unknown) {
    this.filters.push((row) => compareValues(getFieldValue(row, column), value) >= 0);
    return this.proxy();
  }

  lt(column: string, value: unknown) {
    this.filters.push((row) => compareValues(getFieldValue(row, column), value) < 0);
    return this.proxy();
  }

  lte(column: string, value: unknown) {
    this.filters.push((row) => compareValues(getFieldValue(row, column), value) <= 0);
    return this.proxy();
  }

  is(column: string, value: unknown) {
    if (value === null) {
      this.filters.push(
        (row) => getFieldValue(row, column) === null || getFieldValue(row, column) === undefined,
      );
    } else {
      this.filters.push((row) => getFieldValue(row, column) === value);
    }
    return this.proxy();
  }

  not(column: string, operator: string, value: unknown) {
    if (operator === "is") {
      this.filters.push((row) => getFieldValue(row, column) !== value);
      return this.proxy();
    }

    if (operator === "in" && Array.isArray(value)) {
      this.filters.push((row) => !value.includes(getFieldValue(row, column)));
      return this.proxy();
    }

    this.filters.push((row) => getFieldValue(row, column) !== value);
    return this.proxy();
  }

  match(criteria: Record<string, unknown>) {
    Object.entries(criteria).forEach(([column, value]) => {
      this.eq(column, value);
    });
    return this.proxy();
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderRules.push({
      column,
      ascending: options?.ascending !== false,
    });
    return this.proxy();
  }

  limit(value: number) {
    this.limitValue = value;
    return this.proxy();
  }

  range(from: number, to: number) {
    this.rangeValue = { from, to };
    return this.proxy();
  }

  single() {
    this.singleMode = "single";
    return this.proxy();
  }

  maybeSingle() {
    this.singleMode = "maybeSingle";
    return this.proxy();
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private proxy() {
    const builder = this;
    return new Proxy(this, {
      get(target, prop, receiver) {
        if (prop in target) {
          const value = Reflect.get(target, prop, receiver);
          return typeof value === "function" ? value.bind(builder) : value;
        }

        if (typeof prop === "string") {
          return () => builder.proxy();
        }

        return undefined;
      },
    });
  }

  private applyFilters(rows: Record<string, unknown>[]) {
    let nextRows = rows.filter((row) => this.filters.every((filter) => filter(row)));

    this.orderRules.forEach(({ column, ascending }) => {
      nextRows = [...nextRows].sort((left, right) => {
        const diff = compareValues(getFieldValue(left, column), getFieldValue(right, column));
        return ascending ? diff : -diff;
      });
    });

    if (this.rangeValue) {
      nextRows = nextRows.slice(this.rangeValue.from, this.rangeValue.to + 1);
    }

    if (typeof this.limitValue === "number") {
      nextRows = nextRows.slice(0, this.limitValue);
    }

    return nextRows;
  }

  private projectRows(rows: Record<string, unknown>[]) {
    if (
      this.selectColumns === "*" ||
      this.selectColumns.includes("(") ||
      this.selectColumns.includes(":")
    ) {
      return rows;
    }

    const columns = this.selectColumns
      .split(",")
      .map((column) => column.trim())
      .filter(Boolean);

    if (!columns.length) {
      return rows;
    }

    return rows.map((row) => {
      const projected: Record<string, unknown> = {};
      columns.forEach((column) => {
        projected[column] = row[column];
      });
      return projected;
    });
  }

  private finalize(rows: Record<string, unknown>[]): QueryResult {
    const count = this.selectOptions.count ? rows.length : null;

    if (this.singleMode === "single") {
      if (rows.length !== 1) {
        return {
          data: null,
          error: new Error(`Expected 1 row for ${this.table}, received ${rows.length}.`),
          count,
        };
      }
      return { data: rows[0], error: null, count };
    }

    if (this.singleMode === "maybeSingle") {
      if (rows.length > 1) {
        return {
          data: null,
          error: new Error(`Expected 0 or 1 row for ${this.table}, received ${rows.length}.`),
          count,
        };
      }
      return { data: rows[0] ?? null, error: null, count };
    }

    if (this.selectOptions.head) {
      return { data: null, error: null, count };
    }

    return { data: rows, error: null, count };
  }

  private normalizePayloadRows(payload: unknown) {
    const rows = Array.isArray(payload) ? payload : [payload];
    return rows.map((row) => {
      const value =
        typeof row === "object" && row !== null ? { ...(row as Record<string, unknown>) } : {};
      if (!value.id) {
        value.id = createId(this.table);
      }
      if (!value.created_at) {
        value.created_at = nowIso();
      }
      value.updated_at = nowIso();
      return value;
    });
  }

  private async execute(): Promise<QueryResult> {
    const currentRows = readTable(this.table);
    const matchedRows = this.applyFilters(currentRows);

    if (this.mode === "select") {
      return this.finalize(this.projectRows(matchedRows));
    }

    if (this.mode === "insert") {
      const insertedRows = this.normalizePayloadRows(this.payload);
      const nextRows = [...currentRows, ...insertedRows];
      writeTable(this.table, nextRows);
      const resultRows =
        this.returningColumns === null ? insertedRows : this.projectRows(insertedRows);
      return { data: resultRows, error: null };
    }

    if (this.mode === "upsert") {
      const upsertRows = this.normalizePayloadRows(this.payload);
      const byId = new Map<string, Record<string, unknown>>();
      currentRows.forEach((row, index) => {
        byId.set(rowKey(row, index), row);
      });
      upsertRows.forEach((row, index) => {
        byId.set(rowKey(row, index), row);
      });
      const nextRows = Array.from(byId.values());
      writeTable(this.table, nextRows);
      const resultRows =
        this.returningColumns === null ? upsertRows : this.projectRows(upsertRows);
      return { data: resultRows, error: null };
    }

    if (this.mode === "update") {
      const updates =
        typeof this.payload === "object" && this.payload !== null
          ? (this.payload as Record<string, unknown>)
          : {};
      const matchedKeys = new Set(matchedRows.map((row, index) => rowKey(row, index)));
      const nextRows = currentRows.map((row, index) =>
        matchedKeys.has(rowKey(row, index))
          ? { ...row, ...updates, updated_at: nowIso() }
          : row,
      );
      writeTable(this.table, nextRows);
      const updatedRows = nextRows.filter((row, index) => matchedKeys.has(rowKey(row, index)));
      const resultRows =
        this.returningColumns === null ? updatedRows : this.projectRows(updatedRows);
      return { data: resultRows, error: null };
    }

    const matchedKeys = new Set(matchedRows.map((row, index) => rowKey(row, index)));
    const nextRows = currentRows.filter((row, index) => !matchedKeys.has(rowKey(row, index)));
    writeTable(this.table, nextRows);
    return { data: matchedRows, error: null };
  }
}

const auth = {
  getSession: async () => {
    const session = getStoredSession();
    if (session) {
      refreshStoredSession().catch(() => undefined);
    }
    return { data: { session }, error: null };
  },
  getUser: async () => ({
    data: { user: getStoredUser() },
    error: null,
  }),
  signInWithPassword: async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => signInWithBackend(email, password),
  signUp: async ({
    email,
    password,
    options,
  }: {
    email: string;
    password: string;
    options?: { data?: Record<string, unknown> };
  }) => {
    const fullName = String(options?.data?.full_name ?? email.split("@")[0] ?? "Utilisateur");
    const organizationName = String(options?.data?.organization_name ?? "Organisation");
    return signUpWithBackend(email, password, fullName, organizationName);
  },
  signOut: async () => {
    await signOutFromBackend();
    return { error: null };
  },
  onAuthStateChange: (callback: (event: AuthChangeEvent, session: Session | null) => void) => ({
    data: {
      subscription: {
        unsubscribe: subscribeToAuth(callback),
      },
    },
  }),
  setSession: async () =>
    unsupportedLocalAuth("Le changement manuel de session n'est pas disponible sur la version locale."),
  signInWithOtp: async () =>
    unsupportedLocalAuth("La connexion par telephone n'est pas branchee sur la version locale."),
  verifyOtp: async () =>
    unsupportedLocalAuth("La verification OTP n'est pas branchee sur la version locale."),
  resetPasswordForEmail: async () =>
    unsupportedLocalAuth("La reinitialisation email n'est pas branchee sur la version locale."),
  updateUser: async () =>
    unsupportedLocalAuth("La mise a jour du compte via Supabase n'est pas branchee sur la version locale."),
};

const functions = {
  invoke: async (name: string) => ({
    data: null,
    error: new Error(`La fonction "${name}" n'est pas disponible sur la version locale.`),
  }),
};

const storage = {
  from: (bucket: string) => ({
    upload: async (path: string) => {
      const key = `${UPLOAD_PREFIX}${bucket}:${path}`;
      writeJson(key, {
        publicUrl: placeholderImage(path.split("/").pop() || bucket),
        updatedAt: nowIso(),
      });
      return {
        data: {
          path,
          fullPath: path,
        },
        error: null,
      };
    },
    getPublicUrl: (path: string) => {
      const key = `${UPLOAD_PREFIX}${bucket}:${path}`;
      const upload = readJson<{ publicUrl?: string }>(key, {});
      return {
        data: {
          publicUrl: upload.publicUrl ?? placeholderImage(path.split("/").pop() || bucket),
        },
      };
    },
    remove: async (paths: string[]) => {
      if (isBrowser()) {
        paths.forEach((path) => {
          window.localStorage.removeItem(`${UPLOAD_PREFIX}${bucket}:${path}`);
        });
      }
      return { data: null, error: null };
    },
    list: async () => ({ data: [], error: null }),
    download: async (path: string) => ({
      data: new Blob([path], { type: "text/plain" }),
      error: null,
    }),
  }),
};

const buildRpcResponse = (fn: string) => {
  const profile = getStoredProfile();
  const profileRow = buildProfileRow();
  const lawFirmRow = buildLawFirmRow();

  if (fn !== "get_user_session_data" || !profile || !profileRow) {
    return { data: null, error: null };
  }

  const roleV2 = toLegacyV2Role(profile.role);
  return {
    data: {
      profile: profileRow,
      roles: [roleV2],
      firms:
        lawFirmRow && profile.role !== "community_manager"
          ? [
              {
                law_firm_id: lawFirmRow.id,
                role: "lawyer",
                is_primary: true,
                can_validate: true,
                law_firms: lawFirmRow,
              },
            ]
          : [],
      cm_assignments:
        lawFirmRow && profile.role === "community_manager"
          ? [
              {
                id: `cm-${profile.userId}`,
                cm_user_id: profile.userId,
                lawyer_user_id: null,
                law_firm_id: lawFirmRow.id,
                is_active: true,
              },
            ]
          : [],
    },
    error: null,
  };
};

const channel = (name: string) => ({
  name,
  on: () => channel(name),
  subscribe: (callback?: (status: string) => void) => {
    callback?.("SUBSCRIBED");
    return channel(name);
  },
  unsubscribe: () => undefined,
});

export const supabase: any = {
  auth,
  functions,
  storage,
  from: (table: string) => new LocalQueryBuilder(table),
  rpc: async (fn: string) => buildRpcResponse(fn),
  channel,
  removeChannel: () => undefined,
  removeAllChannels: () => undefined,
};
