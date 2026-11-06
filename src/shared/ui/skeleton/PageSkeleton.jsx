import Skeleton from "./Skeleton";

export const PageSkeleton = () => {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Title & Actions Skeleton */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200/60 pb-4 sm:flex-row sm:items-center dark:border-slate-800">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded" />
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* 4 Metrics / Stats Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="space-y-2">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-7 w-28 rounded-md" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        ))}
      </div>

      {/* Content Area Skeleton */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-72 rounded-xl" />
            <Skeleton className="h-9 w-40 rounded-xl" />
          </div>
          <div className="space-y-3 pt-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageSkeleton;
