import Skeleton from "./Skeleton";

export const DetailPageSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Buttons Skeleton */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-3 sm:flex-row sm:items-center dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-24 rounded-xl" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 w-28 rounded-xl" />
          <Skeleton className="h-8 w-24 rounded-xl" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-7 w-48 rounded-lg" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
              <Skeleton className="h-4 w-72 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Details + Right Sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Service & Product Info Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/40">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-5 w-36 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
              <div className="space-y-2 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/40">
                <Skeleton className="h-3 w-28 rounded" />
                <Skeleton className="h-5 w-40 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
            </div>
          </div>

          {/* Technical Specs Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <Skeleton className="mb-4 h-5 w-40 rounded" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>

          {/* Delivery & Files Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <Skeleton className="mb-4 h-5 w-36 rounded" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
          </div>
        </div>

        {/* Right Sidebar Column (1 Col) */}
        <div className="space-y-6">
          {/* Status Progression Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-3.5 w-full rounded" />
              <Skeleton className="h-3.5 w-4/5 rounded" />
            </div>
          </div>

          {/* Customer Info Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <Skeleton className="mb-4 h-5 w-36 rounded" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            </div>
          </div>

          {/* Price Summary Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <Skeleton className="mb-4 h-5 w-28 rounded" />
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-20 rounded" />
                <Skeleton className="h-3.5 w-20 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-16 rounded" />
                <Skeleton className="h-3.5 w-16 rounded" />
              </div>
              <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-24 rounded" />
                  <Skeleton className="h-5 w-28 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPageSkeleton;
