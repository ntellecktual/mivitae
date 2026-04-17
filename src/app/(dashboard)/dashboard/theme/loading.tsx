import { Skeleton } from "@/components/ui/skeleton";

export default function ThemeLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Preset Strip */}
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-28" />
        <div className="flex gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Skeleton className="h-12 w-20 rounded-xl" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Editor layout */}
      <div className="flex gap-6">
        <Skeleton className="h-[480px] w-[380px] shrink-0 rounded-xl" />
        <Skeleton className="h-[620px] flex-1 rounded-xl" />
      </div>
    </div>
  );
}
