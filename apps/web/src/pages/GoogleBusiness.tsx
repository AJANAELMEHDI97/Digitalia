import { useState } from "react";
import { Eye, MessageSquare, Send, Shield, TrendingUp } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useGoogleBusiness } from "@/hooks/useGoogleBusiness";
import { GoogleConnectionCard } from "@/components/google-business/GoogleConnectionCard";
import { GoogleReviewsList } from "@/components/google-business/GoogleReviewsList";
import { GoogleReviewsStats } from "@/components/google-business/GoogleReviewsStats";
import { GooglePostEditor } from "@/components/google-business/GooglePostEditor";
import { GooglePostsList } from "@/components/google-business/GooglePostsList";
import { GoogleInsightsCharts } from "@/components/google-business/GoogleInsightsCharts";
import { NegativeReviewsAlert } from "@/components/google-business/NegativeReviewsAlert";
import { toast } from "sonner";

function CounterBadge({ count }: { count: number }) {
  return (
    <span className="ml-2 rounded-full bg-[#eef1fb] px-2.5 py-0.5 text-[12px] font-semibold text-[#70789a]">
      {count}
    </span>
  );
}

export default function GoogleBusiness() {
  const [activeTab, setActiveTab] = useState("reviews");

  const {
    connection,
    reviews,
    posts,
    loading,
    syncing,
    useDemoData,
    disconnect,
    replyToReview,
    createPost,
    publishPost,
    deletePost,
    syncReviews,
  } = useGoogleBusiness();

  const handleRespondToNegativeReview = (reviewId: string) => {
    setActiveTab("reviews");
    setTimeout(() => {
      const reviewElement = document.getElementById(`review-${reviewId}`);
      if (!reviewElement) {
        return;
      }

      reviewElement.scrollIntoView({ behavior: "smooth", block: "center" });
      const trigger = reviewElement.querySelector("[data-state]");
      if (trigger && trigger.getAttribute("data-state") === "closed") {
        (trigger as HTMLElement).click();
      }
    }, 120);
  };

  const handleConnect = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("google-business-api", {
        body: { action: "get_auth_url" },
      });

      if (error) {
        throw error;
      }

      if (data?.auth_url) {
        window.location.assign(data.auth_url);
        return;
      }

      toast.info("Configuration Google requise", {
        description:
          "Veuillez d'abord configurer les identifiants Google OAuth dans les parametres.",
      });
    } catch (error) {
      console.error("Error getting Google auth URL:", error);
      toast.error("Erreur lors de la connexion Google Business");
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto flex w-full max-w-[1340px] flex-col gap-7 pb-10">
        <div>
          <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.03em] text-[#1f2538]">
            Google Business Profile
          </h1>
          <p className="mt-2 text-[15px] leading-7 text-[#9aa1b8]">
            Gerez votre fiche Google Business, repondez aux avis et publiez des actualites
          </p>
        </div>

        <div className="flex items-center gap-5 rounded-[24px] border border-[#9ef2cb] bg-[#f2fffb] px-7 py-7 text-[#005b57]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ecfff6]">
            <Shield className="h-5 w-5 text-[#1a2735]" />
          </div>
          <p className="text-[16px] leading-8 text-[#005b57]">
            <strong>Reputation en ligne.</strong> La gestion des avis renforce la confiance des justiciables envers votre cabinet.
          </p>
        </div>

        {useDemoData && (
          <div className="flex items-start gap-5 rounded-[24px] border border-[#f4cf67] bg-[#fff9ea] px-7 py-7 text-[#a24d08]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fff4d2]">
              <Eye className="h-5 w-5 text-[#1f2538]" />
            </div>
            <p className="text-[16px] leading-8 text-[#a24d08]">
              <strong>Mode demonstration</strong> {"—"} Les donnees affichees sont des exemples. Connectez votre compte Google Business pour voir vos vrais avis et publications.
            </p>
          </div>
        )}

        <GoogleConnectionCard
          connection={connection}
          loading={loading}
          onConnect={handleConnect}
          onDisconnect={disconnect}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="rounded-[22px] border border-[#e9edf7] bg-white p-2 shadow-[0_14px_40px_rgba(110,122,167,0.05)]">
            <TabsList className="flex h-auto w-full flex-wrap gap-3 bg-transparent p-0">
              <TabsTrigger
                value="reviews"
                className="h-[52px] min-w-[160px] justify-start rounded-[16px] border border-transparent bg-[#f5f6fc] px-5 text-[15px] font-medium text-[#2b3145] data-[state=active]:border-[#dddafc] data-[state=active]:bg-white data-[state=active]:text-[#1f2538] data-[state=active]:shadow-none"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Avis
                <CounterBadge count={reviews.length} />
              </TabsTrigger>

              <TabsTrigger
                value="posts"
                className="h-[52px] min-w-[190px] justify-start rounded-[16px] border border-transparent bg-[#f5f6fc] px-5 text-[15px] font-medium text-[#2b3145] data-[state=active]:border-[#dddafc] data-[state=active]:bg-white data-[state=active]:text-[#1f2538] data-[state=active]:shadow-none"
              >
                <Send className="mr-2 h-4 w-4" />
                Publications
                <CounterBadge count={posts.length} />
              </TabsTrigger>

              <TabsTrigger
                value="insights"
                className="h-[52px] min-w-[180px] justify-start rounded-[16px] border border-transparent bg-[#f5f6fc] px-5 text-[15px] font-medium text-[#2b3145] data-[state=active]:border-[#dddafc] data-[state=active]:bg-white data-[state=active]:text-[#1f2538] data-[state=active]:shadow-none"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Statistiques
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="reviews" className="space-y-6">
            <NegativeReviewsAlert
              reviews={reviews}
              onRespondClick={handleRespondToNegativeReview}
            />
            <GoogleReviewsStats reviews={reviews} />
            <GoogleReviewsList
              reviews={reviews}
              syncing={syncing}
              onSync={syncReviews}
              onReply={replyToReview}
              businessName={connection?.location_name ?? undefined}
            />
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
              <GooglePostEditor onCreatePost={createPost} />
              <GooglePostsList posts={posts} onPublish={publishPost} onDelete={deletePost} />
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <GoogleInsightsCharts connected={!!connection || useDemoData} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
