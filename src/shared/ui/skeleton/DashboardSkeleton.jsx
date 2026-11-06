import Skeleton from "./Skeleton";

export const DashboardSkeleton = () => {
  return (
    <div className="animate-in space-y-6 duration-200 fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200/60 pb-3 sm:flex-row sm:items-center dark:border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-60 rounded-xl" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-96 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-44 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>

      {/* 5 Stats Cards Skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-8.5 w-8.5 rounded-xl" />
            </div>
            <div className="mt-2.5 space-y-1.5">
              <Skeleton className="h-7 w-28 rounded-md" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Area Chart Skeleton */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-56 rounded" />
              <Skeleton className="h-3.5 w-72 rounded" />
            </div>
            <Skeleton className="h-4 w-36 rounded" />
          </div>
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>

        {/* Donut Chart Skeleton */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-3.5 w-52 rounded" />
          </div>
          <div className="my-auto flex justify-center py-6">
            <Skeleton className="h-52 w-52 rounded-full" />
          </div>
          <Skeleton className="h-4 w-48 mx-auto rounded" />
        </div>
      </div>

      {/* Quick Action Bar Skeleton */}
      <div className="rounded-2xl border border-slate-200/60 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="h-3 w-64 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8.5 w-32 rounded-xl" />
            <Skeleton className="h-8.5 w-32 rounded-xl" />
            <Skeleton className="h-8.5 w-32 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Bottom Section Skeleton: Table + Sidebar */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Recent Orders Skeleton */}
        <div className="h-fit rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-5 w-44 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-24 rounded" />
                    <Skeleton className="h-3 w-36 rounded" />
                  </div>
                </div>
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <Skeleton className="mb-4 h-5 w-44 rounded" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <Skeleton className="h-3.5 w-28 rounded" />
                    <Skeleton className="h-3.5 w-14 rounded" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
