import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  amount: number;
  period_start: string;
  period_end: string;
  status: 'paid' | 'pending' | 'failed';
  pdf_url: string | null;
  plan_name: string;
  created_at: string;
}

export function useInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    if (!user) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setInvoices((data as Invoice[]) || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Impossible de charger les factures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  const downloadInvoice = (invoice: Invoice) => {
    if (invoice.pdf_url) {
      window.open(invoice.pdf_url, '_blank');
    }
  };

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    downloadInvoice,
  };
}
