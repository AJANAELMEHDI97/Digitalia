import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Calendar,
  Building2
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ModificationRequest {
  id: string;
  request_type: string;
  field_name: string;
  current_value: string | null;
  requested_value: string;
  justification: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  law_firm_id: string | null;
}

/**
 * Page des demandes de modification pour les Community Managers
 * Affiche l'historique des demandes avec leur statut
 */
export default function CMRequests() {
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['cm-modification-requests'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('modification_requests')
        .select('*')
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching requests:', error);
        return [];
      }

      return data as ModificationRequest[];
    }
  });

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />En attente</Badge>;
      case 'approved':
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle2 className="h-3 w-3" />Approuvée</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Refusée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const fieldLabels: Record<string, string> = {
    name: "Nom du cabinet",
    email: "Email",
    phone: "Téléphone",
    address: "Adresse",
    city: "Ville",
    postal_code: "Code postal",
    website_url: "Site web",
    bar_association: "Barreau",
  };

  const renderRequestCard = (request: ModificationRequest) => (
    <Card key={request.id} className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge(request.status)}
              <span className="text-sm text-muted-foreground">
                {fieldLabels[request.field_name] || request.field_name}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Valeur actuelle : </span>
                <span>{request.current_value || <em className="text-muted-foreground">Non définie</em>}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Valeur demandée : </span>
                <span className="font-medium">{request.requested_value}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Justification : </span>
                <span>{request.justification}</span>
              </div>
              
              {request.status === 'rejected' && request.rejection_reason && (
                <div className="mt-3 p-3 bg-destructive/10 rounded-md">
                  <span className="text-destructive font-medium">Motif du refus : </span>
                  <span className="text-destructive">{request.rejection_reason}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Demandée le {format(new Date(request.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
              </span>
              {request.reviewed_at && (
                <span>
                  Traitée le {format(new Date(request.reviewed_at), 'dd MMM yyyy', { locale: fr })}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Mes demandes</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-24" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mes demandes</h1>
        <p className="text-muted-foreground">
          Historique de vos demandes de modification
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approuvées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Refusées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedRequests.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des demandes */}
      {requests.length === 0 ? (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Aucune demande</h3>
            <p className="text-muted-foreground mt-2">
              Vous n'avez pas encore soumis de demande de modification.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingRequests.length > 0 && (
            <>
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                En attente ({pendingRequests.length})
              </h3>
              {pendingRequests.map(renderRequestCard)}
            </>
          )}
          
          {approvedRequests.length > 0 && (
            <>
              <h3 className="text-lg font-medium flex items-center gap-2 mt-6">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Approuvées ({approvedRequests.length})
              </h3>
              {approvedRequests.map(renderRequestCard)}
            </>
          )}
          
          {rejectedRequests.length > 0 && (
            <>
              <h3 className="text-lg font-medium flex items-center gap-2 mt-6">
                <XCircle className="h-5 w-5 text-red-600" />
                Refusées ({rejectedRequests.length})
              </h3>
              {rejectedRequests.map(renderRequestCard)}
            </>
          )}
        </div>
      )}
    </div>
  );
}
