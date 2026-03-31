import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight, Clock3, Phone, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { differenceInHours, differenceInMinutes, format, isToday, isTomorrow } from "date-fns";
import { fr } from "date-fns/locale";

interface Appointment {
  id: string;
  type: "visio" | "phone";
  date: Date;
  duration: number;
  lawyerName: string;
  firmName: string;
  subject: string;
}

const MOCK_UPCOMING_APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    type: "visio",
    date: new Date(Date.now() + 2 * 60 * 60 * 1000),
    duration: 30,
    lawyerName: "Me Sophie Martin",
    firmName: "Cabinet Martin & Associes",
    subject: "Revue strategie editoriale Q1",
  },
  {
    id: "2",
    type: "phone",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000),
    duration: 20,
    lawyerName: "Me Jean Dupont",
    firmName: "Dupont Avocats",
    subject: "Point mensuel publications",
  },
  {
    id: "3",
    type: "visio",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 10.5 * 60 * 60 * 1000),
    duration: 45,
    lawyerName: "Me Claire Bernard",
    firmName: "Bernard & Partners",
    subject: "Nouvelle campagne LinkedIn",
  },
];

function getRelativeTime(date: Date) {
  const now = new Date();
  const hoursUntil = differenceInHours(date, now);
  const minutesUntil = differenceInMinutes(date, now);

  if (minutesUntil < 60) {
    return { text: `Dans ${minutesUntil} min`, urgent: true };
  }

  if (hoursUntil < 3) {
    return { text: `Dans ${hoursUntil}h`, urgent: true };
  }

  if (isToday(date)) {
    return { text: `Aujourd'hui ${format(date, "HH:mm")}`, urgent: false };
  }

  if (isTomorrow(date)) {
    return { text: `Demain ${format(date, "HH:mm")}`, urgent: false };
  }

  return {
    text: format(date, "EEE d MMM · HH:mm", { locale: fr }),
    urgent: false,
  };
}

export function CMUpcomingAppointments() {
  const appointments = MOCK_UPCOMING_APPOINTMENTS.slice(0, 3);

  return (
    <Card className="rounded-[32px] border border-[#e8ecf7] bg-white shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-3 text-[18px] font-semibold text-[#23293d]">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff4dc]">
              <CalendarDays className="h-5 w-5 text-[#ee9a1b]" />
            </span>
            Prochains RDV
          </CardTitle>
          <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-[13px] font-semibold text-[#6371df]">
            {appointments.length}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {appointments.map((appointment) => {
          const Icon = appointment.type === "visio" ? Video : Phone;
          const relativeTime = getRelativeTime(appointment.date);

          return (
            <div
              key={appointment.id}
              className={cn(
                "rounded-[24px] border px-5 py-4",
                relativeTime.urgent ? "border-[#f5d078] bg-[#fff9ea]" : "border-[#edf0f8] bg-[#fbfcff]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[12px] font-semibold",
                        relativeTime.urgent
                          ? "bg-[#fff0c9] text-[#dd8c12]"
                          : "bg-[#eef2ff] text-[#5f6cd9]",
                      )}
                    >
                      {relativeTime.text}
                    </span>
                    <span className="text-[12px] text-[#9aa1b8]">{appointment.duration} min</span>
                  </div>

                  <p className="mt-3 text-[16px] font-semibold text-[#23293d]">{appointment.lawyerName}</p>
                  <p className="mt-1 text-[13px] text-[#9aa1b8]">{appointment.firmName}</p>
                  <p className="mt-2 line-clamp-1 text-[13px] text-[#727b9c]">{appointment.subject}</p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#8d95af]">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}

        <Link
          to="/calendar"
          className="flex items-center justify-between pt-2 text-[14px] font-medium text-[#6e77a0] transition-colors hover:text-[#4f59d6]"
        >
          <span className="flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            Voir le calendrier
          </span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
