// SectionCard
export const SectionCard = ({ title, desc, active, highlight, children }) => {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
      <div>
        <div className="flex w-fit flex-col">
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-semibold text-gray-900">
              {title}
            </h4>

            {active && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  active === "active"
                    ? "bg-green-100 text-green-700"
                    : active === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : active === "banned"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {active}
              </span>
            )}
          </div>

          <span
            className={`mt-1 h-0.5 rounded-full bg-brand transition-all duration-300 ${
              highlight ? "w-full opacity-100" : "w-0 opacity-0"
            }`}
          />
        </div>

        <p className="mt-2 max-w-52 text-sm leading-5 text-gray-500">
          {desc}
        </p>
      </div>

      <div>{children}</div>
    </div>
  );
};