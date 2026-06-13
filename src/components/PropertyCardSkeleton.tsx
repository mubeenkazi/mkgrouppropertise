import { Skeleton } from "@/components/ui/skeleton";

const PropertyCardSkeleton = () => (
  <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
    <div className="skeleton-shimmer aspect-[4/3] bg-muted" />
    <div className="space-y-4 p-5">
      <div className="space-y-2">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  </div>
);

export default PropertyCardSkeleton;
