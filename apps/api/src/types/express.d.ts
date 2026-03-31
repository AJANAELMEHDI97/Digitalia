import type { PlatformRole } from "../lib/roles.js";

declare global {
  namespace Express {
    interface AuthenticatedUser {
      id: string;
      organizationId: string;
      email: string;
      role: PlatformRole;
      fullName?: string;
    }

    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
