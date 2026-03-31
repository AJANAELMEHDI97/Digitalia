import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, HelpCircle, BarChart3, Calendar, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SupportHub } from "@/components/support/SupportHub";
import { FAQSection } from "@/components/support/FAQSection";
import { CMStats } from "@/components/support/CMStats";
import { CMMessaging } from "@/components/support/CMMessaging";
import { CMAppointments } from "@/components/support/CMAppointments";

export default function Assistant() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "hub";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Mon CM</h1>
            <p className="text-sm text-muted-foreground">
              Votre espace d'accompagnement et de conseil personnalisé
            </p>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-4">
            {activeTab !== "hub" && (
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("hub")}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour
              </Button>
            )}
            <TabsList className={activeTab === "hub" ? "hidden" : ""}>
              <TabsTrigger value="faq" className="flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">FAQ</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Statistiques</span>
              </TabsTrigger>
              <TabsTrigger value="messaging" className="flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Messagerie</span>
              </TabsTrigger>
              <TabsTrigger value="appointment" className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Rendez-vous</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="hub" className="mt-0">
            <SupportHub onNavigate={handleNavigate} activeTab={activeTab} />
          </TabsContent>

          <TabsContent value="faq" className="mt-0">
            <FAQSection />
          </TabsContent>

          <TabsContent value="stats" className="mt-0">
            <CMStats />
          </TabsContent>

          <TabsContent value="messaging" className="mt-0">
            <CMMessaging />
          </TabsContent>

          <TabsContent value="appointment" className="mt-0 flex-1 min-h-0">
            <CMAppointments />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
