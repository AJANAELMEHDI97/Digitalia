export const PLATFORM_ROLES = ["super_admin", "community_manager", "lawyer"] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];

const ROLE_ALIASES: Record<string, PlatformRole> = {
  super_admin: "super_admin",
  admin: "super_admin",
  community_manager: "community_manager",
  editor: "community_manager",
  lawyer: "lawyer",
  reader: "lawyer",
};

export const normalizePlatformRole = (role: unknown): PlatformRole => {
  if (typeof role !== "string") {
    return "lawyer";
  }

  return ROLE_ALIASES[role.trim().toLowerCase()] ?? "lawyer";
};

export const dbRoleFromPlatformRole = (role: unknown) => {
  const normalizedRole = normalizePlatformRole(role);

  if (normalizedRole === "super_admin") {
    return "admin";
  }

  if (normalizedRole === "community_manager") {
    return "editor";
  }

  return "reader";
};

export const isSuperAdminRole = (role: unknown) =>
  normalizePlatformRole(role) === "super_admin";
