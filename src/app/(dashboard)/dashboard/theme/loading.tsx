import { Skeleton } from "@/components/ui/skeleton";

export default function ThemeLoading() {
  return (
    <div className="-m-4 lg:-m-8 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-neutral-950 relative">
      {/* Full-screen preview skeleton */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Skeleton className="h-full w-full max-w-4xl rounded-2xl bg-white/5" />
      </div>

      {/* Floating toolbar skeleton */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-2xl border border-white/10 bg-neutral-900/90 px-4 py-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-8 rounded-xl bg-white/10" />
        ))}
        <Skeleton className="ml-2 h-8 w-20 rounded-xl bg-white/10" />
      </div>
    </div>
  );
}
