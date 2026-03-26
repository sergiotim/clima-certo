import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#030712]">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-6 w-32 hidden sm:block" />
          </div>
          <Skeleton className="h-10 w-full max-w-md rounded-xl" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">
        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-6 w-40 rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            <Skeleton className="lg:col-span-8 h-64 rounded-xl" />
            <Skeleton className="lg:col-span-4 h-64 rounded-xl" />
            <Skeleton className="lg:col-span-6 h-48 rounded-xl" />
            <Skeleton className="lg:col-span-6 h-48 rounded-xl" />
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <aside className="w-full lg:w-80 flex flex-col gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </aside>
      </main>
    </div>
  );
}
