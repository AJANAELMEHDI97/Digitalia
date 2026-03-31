import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { apiRequest } from "@/lib/api-client";

export type SimpleRole = "admin" | "community_manager" | "lawyer";

interface SimpleAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, nextSession: Session | null) => {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setLoading(false);
      },
    );

    supabase.auth.getSession().then(({ data: { session: nextSession } }: { data: { session: Session | null } }) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const trimmedInput = email.trim().toLowerCase();
      if (!trimmedInput) {
        return { error: new Error("L'email est requis.") };
      }

      if (!trimmedInput.includes("@")) {
        return {
          error: new Error("Utilisez l'email de votre compte pour cette version locale."),
        };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedInput,
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("incorrect")) {
          return { error: new Error("Email ou mot de passe incorrect.") };
        }
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SimpleAuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </SimpleAuthContext.Provider>
  );
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error("useSimpleAuth must be used within a SimpleAuthProvider");
  }
  return context;
}

export async function createUserWithRole(
  email: string,
  password: string,
  fullName: string,
  role: SimpleRole,
): Promise<{ error: Error | null; userId?: string }> {
  try {
    const backendRole =
      role === "admin"
        ? "super_admin"
        : role === "community_manager"
          ? "community_manager"
          : "lawyer";

    const title =
      role === "admin"
        ? "Super Admin"
        : role === "community_manager"
          ? "Community Manager"
          : "Avocat";

    const user = await apiRequest<{ id: string }>("/organization/members", {
      method: "POST",
      body: JSON.stringify({
        fullName,
        email: email.trim().toLowerCase(),
        password,
        role: backendRole,
        title,
      }),
    });

    return { error: null, userId: user.id };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error("Impossible de creer le compte."),
    };
  }
}
