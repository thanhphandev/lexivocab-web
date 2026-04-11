"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function VocabularyDetailSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border bg-card/50 p-8 md:p-12">
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-16 w-64 md:w-96 rounded-xl" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-32 rounded-lg" />
              <Skeleton className="h-6 w-32 rounded-lg" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-12 w-32 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Meaning & Context Card */}
          <div className="rounded-2xl border bg-card p-6 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-40 rounded-md" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </div>

          {/* AI Sections */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-6 w-48 rounded-md" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 space-y-6">
            <Skeleton className="h-6 w-40 rounded-md" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-md" />
              </div>
            ))}
          </div>
          
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
