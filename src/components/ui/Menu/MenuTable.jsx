import { useEffect, useRef } from "react";

const MenuTable = ({
  open,
  position,
  items = [],
  onClose,
  width = 176,
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        onClose?.();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    const handleScroll = () => {
      onClose?.();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      role="menu"
      className="
        fixed z-50 overflow-hidden rounded-xl
        border border-border bg-surface
        py-1 shadow-xl
      "
      style={{
        top: position?.y ?? 0,
        left: position?.x ?? 0,
        width,
      }}
      onClick={(event) => event.stopPropagation()}
    >
      {items.map((item, index) => {
        const Icon = item.icon;

        if (item.hidden) return null;

        if (item.type === "divider") {
          return (
            <div
              key={item.id || `divider-${index}`}
              className="my-1 border-t border-border-subtle"
            />
          );
        }

        return (
          <button
            key={item.id || item.label}
            type="button"
            role="menuitem"
            disabled={item.disabled}
            onClick={() => {
              if (item.disabled) return;

              item.onClick?.();
              onClose?.();
            }}
            className={`
              flex w-full items-center gap-3
              px-4 py-2.5 text-left text-sm
              transition
              disabled:cursor-not-allowed
              disabled:opacity-50
              ${
                item.danger
                  ? "text-red-600 hover:bg-red-50"
                  : "text-text-default hover:bg-surface-subtle"
              }
            `}
          >
            {Icon && <Icon size={17} className="shrink-0" />}

            <span className="flex-1">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MenuTable;