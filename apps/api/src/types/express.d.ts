declare global {
  namespace Express {
    interface AuthenticatedUser {
      id: string;
      organizationId: string;
      email: string;
      role: string;
      fullName?: string;
    }

    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
