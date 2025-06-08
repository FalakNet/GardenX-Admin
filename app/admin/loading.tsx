import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex-1 p-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[120px] w-full rounded-lg" />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-[400px] md:col-span-2 w-full rounded-lg" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    </div>
  );
}
