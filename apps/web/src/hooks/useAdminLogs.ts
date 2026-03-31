import { useQuery } from "@tanstack/react-query";
import { TOKEN_STORAGE_KEY } from "@/lib/local-auth";

interface AdminLogEntry {
  id: string;
  eventKey: string;
  organizationId: string;
  actorUserId?: string;
  context?: Record<string, unknown>;
  created_at: string;
}

export function useAdminLogs() {
  return useQuery<AdminLogEntry[]>({
    queryKey: ["admin-logs"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_STORAGE_KEY) : null;
      return await fetchAdminLogs(token || undefined);
    },
    staleTime: 30_000,
  });
}

export async function fetchAdminLogs(token?: string): Promise<AdminLogEntry[]> {
  const headers: Record<string, string> = {} as any;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch("/api/admin/logs", { headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Impossible de recuperer le journal d'activite");
  }
  return (await res.json()) as AdminLogEntry[];
}
