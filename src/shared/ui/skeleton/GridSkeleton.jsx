import Skeleton from "./Skeleton";

export const GridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
        >
          <div>
            {/* Top Header */}
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-5 w-20 rounded-md" />
              </div>
              <Skeleton className="h-5 w-22 rounded-full" />
            </div>

            {/* Identity / Content */}
            <div className="flex items-center gap-3.5">
              <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-3 w-44 rounded" />
              </div>
            </div>

            {/* Meta badges */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-slate-800">
            <div className="space-y-1">
              <Skeleton className="h-2.5 w-16 rounded" />
              <Skeleton className="h-3.5 w-24 rounded" />
            </div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GridSkeleton;
