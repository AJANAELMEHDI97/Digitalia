import { Link } from "react-router-dom";
import { AlertTriangle, CalendarDays, Library, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLawFirmContextSafe } from "@/contexts/LawFirmContext";

export function CMQuickActions() {
  const { selectedFirm } = useLawFirmContextSafe();

  return (
    <Card className="rounded-[32px] border border-[#e8ecf7] bg-white shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-[18px] font-semibold text-[#23293d]">Actions rapides</CardTitle>
        {selectedFirm && <p className="text-[13px] text-[#9aa1b8]">Pour {selectedFirm.name}</p>}
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <Button
          asChild
          size="sm"
          className="h-11 w-full justify-start rounded-2xl bg-[#5546d7] text-white shadow-none hover:bg-[#4a3aca]"
        >
          <Link to="/editor">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle publication
          </Link>
        </Button>

        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-11 w-full justify-start rounded-2xl border-[#e6e9f4] bg-white shadow-none hover:bg-[#f7f8fd]"
        >
          <Link to="/calendar">
            <CalendarDays className="mr-2 h-4 w-4" />
            Calendrier editorial
          </Link>
        </Button>

        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-11 w-full justify-start rounded-2xl border-[#e6e9f4] bg-white shadow-none hover:bg-[#f7f8fd]"
        >
          <Link to="/validation">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Publications a corriger
          </Link>
        </Button>

        <Button
          asChild
          size="sm"
          variant="ghost"
          className="h-11 w-full justify-start rounded-2xl text-[#5a6280] hover:bg-[#f7f8fd]"
        >
          <Link to="/cm/content">
            <Library className="mr-2 h-4 w-4" />
            Bibliotheque de contenus
          </Link>
        </Button>

        <Button
          asChild
          size="sm"
          variant="ghost"
          className="h-11 w-full justify-start rounded-2xl text-[#5a6280] hover:bg-[#f7f8fd]"
        >
          <Link to="/assistant">
            <MessageSquare className="mr-2 h-4 w-4" />
            Messagerie avocat
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
