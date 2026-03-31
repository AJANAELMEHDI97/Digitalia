import { useEffect, useRef } from "react";
import { differenceInHours, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Publication {
  id: string;
  status: string;
  title?: string | null;
  created_at: string;
  scheduled_date: string;
  scheduled_time?: string;
  law_firm_id?: string | null;
}

interface CMCriticalAlertsMonitorProps {
  publications: Publication[];
  firmNamesMap?: Map<string, string>;
}

type CriticalType = 'refuse' | 'blocked' | 'late';

/**
 * Helper to detect critical publications
 * - Refused
 * - Blocked (+48h waiting for validation)
 * - Late (scheduled date passed)
 */
function getCriticalType(pub: Publication): CriticalType | null {
  const now = new Date();
  
  // Refused
  if (pub.status === 'refuse') return 'refuse';
  
  // Blocked (+48h waiting for validation)
  if (pub.status === 'a_valider') {
    const hoursWaiting = differenceInHours(now, parseISO(pub.created_at));
    if (hoursWaiting > 48) return 'blocked';
  }
  
  // Late (scheduled but date passed)
  if (pub.status === 'programme') {
    const scheduledDateTime = parseISO(pub.scheduled_date);
    const [hours, minutes] = (pub.scheduled_time || "09:00").split(":").map(Number);
    scheduledDateTime.setHours(hours, minutes, 0, 0);
    if (scheduledDateTime < now) return 'late';
  }
  
  return null;
}

/**
 * Get notification title and message based on critical type
 */
function getNotificationContent(type: CriticalType, pubTitle: string, firmName?: string) {
  const titleText = pubTitle || 'Sans titre';
  const firmText = firmName ? ` (${firmName})` : '';
  
  switch (type) {
    case 'refuse':
      return {
        title: '❌ Publication refusée',
        message: `"${titleText}"${firmText} a été refusée par l'avocat. Action requise.`
      };
    case 'blocked':
      return {
        title: '⏳ Publication bloquée',
        message: `"${titleText}"${firmText} est en attente de validation depuis plus de 48h.`
      };
    case 'late':
      return {
        title: '🚨 Publication en retard',
        message: `"${titleText}"${firmText} a dépassé sa date de publication prévue.`
      };
  }
}

/**
 * Monitors publications for critical alerts and plays sound + creates notifications
 * Skips initial load to avoid sounds on page refresh
 */
export function CMCriticalAlertsMonitor({ publications, firmNamesMap }: CMCriticalAlertsMonitorProps) {
  const { user } = useAuth();
  const notifiedIds = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (!user) return;

    // Skip first load to avoid sound on initial page load
    if (initialLoadRef.current) {
      // Mark existing criticals as already notified
      publications.forEach(pub => {
        if (getCriticalType(pub)) {
          notifiedIds.current.add(pub.id);
        }
      });
      initialLoadRef.current = false;
      return;
    }

    const newCriticals: { pub: Publication; type: CriticalType }[] = [];

    publications.forEach(pub => {
      const criticalType = getCriticalType(pub);
      if (criticalType && !notifiedIds.current.has(pub.id)) {
        notifiedIds.current.add(pub.id);
        newCriticals.push({ pub, type: criticalType });
      }
    });

    if (newCriticals.length > 0) {
      // Create notifications in database
      newCriticals.forEach(async ({ pub, type }) => {
        const firmName = pub.law_firm_id && firmNamesMap 
          ? firmNamesMap.get(pub.law_firm_id) 
          : undefined;
        const { title, message } = getNotificationContent(type, pub.title || '', firmName);
        
        try {
          await supabase.from('notifications').insert({
            user_id: user.id,
            type: `critical_${type}`,
            title,
            message,
            action_url: `/editor?id=${pub.id}`,
            is_read: false
          });
        } catch (error) {
          console.error('Failed to create notification:', error);
        }
      });
    }

    // Cleanup: remove IDs that are no longer in publications
    const currentIds = new Set(publications.map(p => p.id));
    notifiedIds.current.forEach(id => {
      if (!currentIds.has(id)) {
        notifiedIds.current.delete(id);
      }
    });
  }, [publications, user, firmNamesMap]);

  return null;
}
