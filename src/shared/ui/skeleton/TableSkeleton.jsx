import Skeleton from "./Skeleton";

export const TableSkeleton = ({ rows = 6, variant = "order" }) => {
  const isUserVariant = variant === "user";
  const isRoleVariant = variant === "role";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-220 text-left">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-800/40">
            {isUserVariant ? (
              <tr>
                <th className="w-10 px-4 py-3.5">
                  <Skeleton className="h-4 w-4 rounded" />
                </th>
                <th className="px-4 py-3.5">
                  <Skeleton className="h-3.5 w-28" />
                </th>
                <th className="px-4 py-3.5">
                  <Skeleton className="h-3.5 w-24" />
                </th>
                <th className="px-4 py-3.5">
                  <Skeleton className="h-3.5 w-16" />
                </th>
                <th className="px-4 py-3.5">
                  <Skeleton className="h-3.5 w-20" />
                </th>
                <th className="px-4 py-3.5">
                  <Skeleton className="h-3.5 w-24" />
                </th>
                <th className="px-4 py-3.5 text-right">
                  <div className="flex justify-end">
                    <Skeleton className="h-3.5 w-16" />
                  </div>
                </th>
              </tr>
            ) : isRoleVariant ? (
              <tr>
                <th className="w-10 px-4 py-3.5">
                  <Skeleton className="h-4 w-4 rounded" />
                </th>
                <th className="px-4 py-3.5">
                  <Skeleton className="h-3.5 w-14" />
                </th>
                <th className="px-4 py-3.5">
                  <Skeleton className="h-3.5 w-32" />
                </th>
                <th className="px-4 py-3.5">
                  <Skeleton className="h-3.5 w-20" />
                </th>
                <th className="px-4 py-3.5">
                  <Skeleton className="h-3.5 w-28" />
                </th>
                <th className="px-4 py-3.5">
                  <Skeleton className="h-3.5 w-24" />
                </th>
                <th className="px-4 py-3.5 text-right">
                  <div className="flex justify-end">
                    <Skeleton className="h-3.5 w-16" />
                  </div>
                </th>
              </tr>
            ) : (
              <tr>
                <th className="w-10 px-4 py-3.5">
                  <Skeleton className="h-4 w-4 rounded" />
                </th>
                <th className="px-5 py-3.5">
                  <Skeleton className="h-3.5 w-24" />
                </th>
                <th className="px-4 py-3.5">
                  <Skeleton className="h-3.5 w-28" />
                </th>
                <th className="px-4 py-3.5">
                  <Skeleton className="h-3.5 w-20" />
                </th>
                <th className="px-4 py-3.5">
                  <Skeleton className="h-3.5 w-20" />
                </th>
                <th className="px-4 py-3.5">
                  <Skeleton className="h-3.5 w-16" />
                </th>
                <th className="px-4 py-3.5">
                  <Skeleton className="h-3.5 w-20" />
                </th>
                <th className="px-4 py-3.5 text-right">
                  <div className="flex justify-end">
                    <Skeleton className="h-3.5 w-16" />
                  </div>
                </th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
            {Array.from({ length: rows }).map((_, index) =>
              isUserVariant ? (
                <tr key={index} className="transition-colors">
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-4 rounded" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-28 rounded" />
                        <Skeleton className="h-3 w-36 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-24 rounded-md" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-26 rounded-full" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-3.5 w-20 rounded" />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Skeleton className="h-8 w-8 rounded-xl" />
                      <Skeleton className="h-8 w-8 rounded-xl" />
                    </div>
                  </td>
                </tr>
              ) : isRoleVariant ? (
                <tr key={index} className="transition-colors">
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-4 rounded" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-12 rounded-md" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-28 rounded" />
                        <Skeleton className="h-3 w-44 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1.5">
                      <Skeleton className="h-5 w-20 rounded-md" />
                      <Skeleton className="h-5 w-20 rounded-md" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Skeleton className="h-8 w-8 rounded-xl" />
                      <Skeleton className="h-8 w-8 rounded-xl" />
                      <Skeleton className="h-8 w-8 rounded-xl" />
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={index} className="transition-colors">
                  {/* Checkbox */}
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-4 rounded" />
                  </td>

                  {/* Code & Product */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 shrink-0 rounded-xl" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-20 rounded" />
                        <Skeleton className="h-3 w-32 rounded" />
                      </div>
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-7 w-7 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-3.5 w-24 rounded" />
                        <Skeleton className="h-2.5 w-16 rounded" />
                      </div>
                    </div>
                  </td>

                  {/* Service */}
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <Skeleton className="h-3.5 w-20 rounded" />
                      <Skeleton className="h-2.5 w-12 rounded" />
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-20 rounded" />
                  </td>

                  {/* Date */}
                  <td className="px-4 py-4">
                    <Skeleton className="h-3 w-16 rounded" />
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Skeleton className="h-7 w-7 rounded-lg" />
                      <Skeleton className="h-7 w-7 rounded-lg" />
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3.5 dark:border-slate-800">
        <Skeleton className="h-3.5 w-36 rounded" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton;
