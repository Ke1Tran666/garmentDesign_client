import { useEffect, useRef, useState } from "react";
import { EllipsisVertical } from "lucide-react";

const ITEM_VARIANTS = {
  default: "text-text-default hover:bg-surface-muted",
  danger: "text-danger hover:bg-danger-soft",
};

const AdminActionMenu = ({
  items = [],
  ariaLabel = "Mở thao tác",
  menuClassName = "",
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (items.length === 0) return null;

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-9 w-10 items-center justify-center rounded-lg border border-border bg-surface-subtle text-text-muted transition hover:bg-surface-muted hover:text-text-default"
      >
        <EllipsisVertical size={17} />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute top-full right-0 z-30 mt-2 w-52 rounded-xl border border-border bg-surface p-1.5 shadow-xl ${menuClassName}`}
        >
          {items.map((item, index) => {
            const Icon = item.icon;
            const variantClass =
              ITEM_VARIANTS[item.variant] || ITEM_VARIANTS.default;

            return (
              <div key={item.id || item.label}>
                {item.separatorBefore && index > 0 && (
                  <div className="my-1 border-t border-border-subtle" />
                )}

                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    setOpen(false);
                    item.onClick?.();
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${variantClass}`}
                >
                  {Icon && <Icon size={17} />}
                  {item.label}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminActionMenu;
