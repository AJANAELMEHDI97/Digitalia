import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, differenceInDays } from "date-fns";

interface OverdueItem {
  firmName: string;
  amount: number;
  daysOverdue: number;
}

interface AccountsData {
  active: number;
  test: number;
  converted: number;
  churned: number;
  suspended: number;
  overdueList: OverdueItem[];
  statusDistribution: { status: string; count: number; fill: string }[];
  loading: boolean;
}

const DEMO: AccountsData = {
  active: 48, test: 8, converted: 5, churned: 3, suspended: 2,
  overdueList: [
    { firmName: "Cabinet Martin & Associés", amount: 890, daysOverdue: 32 },
    { firmName: "SCP Durand Avocats", amount: 450, daysOverdue: 18 },
    { firmName: "Cabinet Lefèvre", amount: 290, daysOverdue: 11 },
  ],
  statusDistribution: [
    { status: "Actifs", count: 48, fill: "hsl(142, 71%, 45%)" },
    { status: "Test", count: 8, fill: "hsl(210, 80%, 55%)" },
    { status: "Résiliés", count: 3, fill: "hsl(0, 84%, 60%)" },
    { status: "Suspendus", count: 2, fill: "hsl(38, 92%, 50%)" },
  ],
  loading: false,
};

export function useAdminAccounts(): AccountsData {
  const [data, setData] = useState<AccountsData>({ ...DEMO, loading: true });

  useEffect(() => {
    async function fetch() {
      try {
        const now = new Date();
        const monthStart = startOfMonth(now);

        const [firmsRes, overdueRes] = await Promise.all([
          supabase.from("law_firms").select("id, name, is_active, subscription_plan, created_at"),
          supabase.from("invoices").select("law_firm_id, amount, period_end").eq("status", "pending"),
        ]);

        const firms = firmsRes.data || [];
        const overdueInvoices = overdueRes.data || [];

        if (firms.length === 0) {
          setData({ ...DEMO, loading: false });
          return;
        }

        const active = firms.filter(f => f.is_active).length;
        const test = firms.filter(f => f.subscription_plan === "test").length;
        const converted = firms.filter(f => f.is_active && new Date(f.created_at!) >= monthStart).length;
        const churned = firms.filter(f => !f.is_active).length;

        // Suspended = firms with overdue invoices
        const overdueFirmIds = new Set(overdueInvoices.filter(i => {
          return i.period_end && new Date(i.period_end) < now;
        }).map(i => i.law_firm_id));
        const suspended = overdueFirmIds.size;

        // Overdue list
        const overdueList: OverdueItem[] = overdueInvoices
          .filter(i => i.period_end && new Date(i.period_end) < now && i.law_firm_id)
          .map(i => {
            const firm = firms.find(f => f.id === i.law_firm_id);
            return {
              firmName: firm?.name || "Cabinet inconnu",
              amount: Number(i.amount),
              daysOverdue: differenceInDays(now, new Date(i.period_end)),
            };
          })
          .sort((a, b) => b.daysOverdue - a.daysOverdue)
          .slice(0, 5);

        const statusDistribution = [
          { status: "Actifs", count: active, fill: "hsl(142, 71%, 45%)" },
          { status: "Test", count: test, fill: "hsl(210, 80%, 55%)" },
          { status: "Résiliés", count: churned, fill: "hsl(0, 84%, 60%)" },
          { status: "Suspendus", count: suspended, fill: "hsl(38, 92%, 50%)" },
        ];

        setData({
          active, test, converted, churned, suspended,
          overdueList: overdueList.length > 0 ? overdueList : DEMO.overdueList,
          statusDistribution,
          loading: false,
        });
      } catch {
        setData({ ...DEMO, loading: false });
      }
    }
    fetch();
  }, []);

  return data;
}
