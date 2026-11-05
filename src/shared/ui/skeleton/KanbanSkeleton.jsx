import Skeleton from "./Skeleton";

export const KanbanSkeleton = ({ columns = 4 }) => {
  return (
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: columns }).map((_, colIndex) => (
        <div
          key={colIndex}
          className="flex min-h-120 flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-900/60"
        >
          {/* Column Header Skeleton */}
          <div className="flex items-center justify-between border-b border-slate-200/60 px-1 pb-2 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Skeleton className="h-2.5 w-2.5 rounded-full" />
              <Skeleton className="h-4 w-24 rounded" />
            </div>
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>

          {/* Cards List Skeleton */}
          <div className="flex-1 space-y-3">
            {[1, 2].map((cardIndex) => (
              <div
                key={cardIndex}
                className="space-y-3 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs dark:border-slate-700/80 dark:bg-slate-800"
              >
                {/* Card Top: Code & Service Tag */}
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-4 w-16 rounded" />
                  <Skeleton className="h-5 w-20 rounded-md" />
                </div>

                {/* Card Product Name */}
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-3 w-3/4 rounded" />
                </div>

                {/* Customer Info */}
                <div className="flex items-center gap-2 pt-1">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100 pt-2.5 dark:border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-7 w-20 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanSkeleton;
