import { supabase } from "@/integrations/supabase/client";

export async function seedAdminDemoData(): Promise<{ success: boolean; message: string; stats?: any; seed_id?: string; seeded_at?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("seed-admin-demo", {
      body: { action: "seed" },
    });
    if (error) return { success: false, message: error.message };
    return data;
  } catch (e: any) {
    return { success: false, message: e.message || "Erreur inattendue" };
  }
}

export async function clearAdminDemoData(): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("seed-admin-demo", {
      body: { action: "clear" },
    });
    if (error) return { success: false, message: error.message };
    return data;
  } catch (e: any) {
    return { success: false, message: e.message || "Erreur inattendue" };
  }
}

export async function checkDemoState(): Promise<{ seeded: boolean; count: number }> {
  try {
    const { data, error } = await supabase.functions.invoke("seed-admin-demo", {
      body: { action: "check" },
    });
    if (error) return { seeded: false, count: 0 };
    return data;
  } catch {
    return { seeded: false, count: 0 };
  }
}
