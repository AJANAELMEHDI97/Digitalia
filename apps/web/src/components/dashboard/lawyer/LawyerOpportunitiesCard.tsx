import { Link } from "react-router-dom";
import { Users, Calendar, Clock, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface LawyerOpportunitiesCardProps {
  contactRequests?: number;
  qualifiedMeetings?: number;
  pendingResponses?: number;
  loading?: boolean;
}

export function LawyerOpportunitiesCard({
  contactRequests = 8,
  qualifiedMeetings = 4,
  pendingResponses = 2,
  loading,
}: LawyerOpportunitiesCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Users className="h-4 w-4 text-muted-foreground" />
            Demandes et opportunités
          </CardTitle>
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link to="/metrics">
              Voir le détail
              <ChevronRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Contact requests */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{contactRequests}</p>
              <p className="text-xs text-muted-foreground">Demandes de contact</p>
            </div>
          </div>

          {/* Qualified meetings */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{qualifiedMeetings}</p>
              <p className="text-xs text-muted-foreground">Rendez-vous qualifiés</p>
            </div>
          </div>

          {/* Pending responses */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingResponses}</p>
              <p className="text-xs text-muted-foreground">En attente de réponse</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
