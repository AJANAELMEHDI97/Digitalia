import React, { Suspense, lazy, ComponentType } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Lazy loaded components for "below the fold" dashboard sections
export const LazyTrendsBlock = lazy(() => 
  import("@/components/dashboard/TrendsBlock").then(m => ({ default: m.TrendsBlock }))
);

export const LazyLawyerCalendarCard = lazy(() => 
  import("@/components/dashboard/lawyer/LawyerCalendarCard").then(m => ({ default: m.LawyerCalendarCard }))
);

export const LazyLawyerSettingsCard = lazy(() => 
  import("@/components/dashboard/lawyer/LawyerSettingsCard").then(m => ({ default: m.LawyerSettingsCard }))
);

export const LazyLawyerGoogleBusinessCard = lazy(() => 
  import("@/components/dashboard/lawyer/LawyerGoogleBusinessCard").then(m => ({ default: m.LawyerGoogleBusinessCard }))
);

// Skeleton loaders for each lazy component
function CardSkeleton({ height = "h-48" }: { height?: string }) {
  return (
    <Card className="bg-card border">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-5 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className={height} />
      </CardContent>
    </Card>
  );
}

function TrendsSkeleton() {
  return (
    <Card className="bg-card border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CalendarSkeleton() {
  return (
    <Card className="bg-card border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SettingsSkeleton() {
  return (
    <Card className="bg-card border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-5 w-28" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function GoogleBusinessSkeleton() {
  return (
    <Card className="bg-card border">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-20 rounded-lg" />
      </CardContent>
    </Card>
  );
}

// Wrapper components with Suspense
interface TrendsBlockWrapperProps {
  limit?: number;
}

export function SuspenseTrendsBlock({ limit = 3 }: TrendsBlockWrapperProps) {
  return (
    <Suspense fallback={<TrendsSkeleton />}>
      <LazyTrendsBlock limit={limit} />
    </Suspense>
  );
}

interface CalendarCardWrapperProps {
  publications: any[];
  loading: boolean;
}

export function SuspenseCalendarCard({ publications, loading }: CalendarCardWrapperProps) {
  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <LazyLawyerCalendarCard publications={publications} loading={loading} />
    </Suspense>
  );
}

interface SettingsCardWrapperProps {
  validationDelay: string;
  notificationChannels: string[];
  activeNetworks: string[];
}

export function SuspenseSettingsCard(props: SettingsCardWrapperProps) {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <LazyLawyerSettingsCard {...props} />
    </Suspense>
  );
}

export function SuspenseGoogleBusinessCard() {
  return (
    <Suspense fallback={<GoogleBusinessSkeleton />}>
      <LazyLawyerGoogleBusinessCard />
    </Suspense>
  );
}
