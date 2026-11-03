import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Select as RadixSelect } from "radix-ui";

import { cn } from "@/shared/lib/utils";

const SIZE_CLASSES = {
  sm: "h-9 rounded-lg px-3 text-sm",
  filter: "h-10 rounded-xl px-3 text-xs font-semibold",
  md: "h-11 rounded-xl px-4 text-sm",
  lg: "h-12 rounded-xl px-4 text-sm",
};

const Select = ({
  id,
  name,
  value,
  defaultValue,
  options = [],
  placeholder = "Chọn một giá trị",
  onValueChange,
  onChange,
  disabled = false,
  required = false,
  error = false,
  ariaLabel,
  size = "md",
  className = "",
  contentClassName = "",
}) => {
  const handleValueChange = (nextValue) => {
    onValueChange?.(nextValue);

    if (onChange) {
      const target = {
        name,
        value: nextValue,
      };

      onChange({
        target,
        currentTarget: target,
      });
    }
  };

  const controlledProps =
    value !== undefined
      ? {
          value: value === null ? "" : String(value),
        }
      : {
          defaultValue:
            defaultValue === null || defaultValue === undefined
              ? undefined
              : String(defaultValue),
        };

  return (
    <RadixSelect.Root
      {...controlledProps}
      name={name}
      disabled={disabled}
      required={required}
      onValueChange={handleValueChange}
    >
      <RadixSelect.Trigger
        id={id || name}
        aria-label={ariaLabel}
        aria-invalid={error || undefined}
        className={cn(
          "group flex w-full items-center justify-between gap-2.5 rounded-xl border border-slate-200 bg-white text-left font-semibold text-slate-700 shadow-2xs transition-all outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
          SIZE_CLASSES[size] || SIZE_CLASSES.md,
          error
            ? "border-danger! focus:border-danger! focus:ring-4 focus:ring-danger/10 data-[state=open]:border-danger! data-[state=open]:ring-4 data-[state=open]:ring-danger/10"
            : "hover:border-slate-300 focus:border-brand! focus:ring-2 focus:ring-brand/10 data-[state=open]:border-brand! data-[state=open]:ring-2 data-[state=open]:ring-brand/10 dark:hover:border-slate-600",
          "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-60 dark:disabled:bg-slate-800/50",
          className,
        )}
      >
        <RadixSelect.Value
          placeholder={<span className="text-slate-400 dark:text-slate-500">{placeholder}</span>}
        />

        <RadixSelect.Icon asChild>
          <ChevronDown
            size={16}
            className="shrink-0 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180 dark:text-slate-500"
          />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={6}
          collisionPadding={12}
          className={cn(
            "z-100 max-h-72 min-w-(--radix-select-trigger-width) overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-1 shadow-xl animate-in fade-in-0 zoom-in-95 dark:border-slate-800 dark:bg-slate-900",
            contentClassName,
          )}
        >
          <RadixSelect.ScrollUpButton className="flex h-7 items-center justify-center bg-white text-slate-400 hover:text-slate-600 dark:bg-slate-900 dark:text-slate-500">
            <ChevronUp size={15} />
          </RadixSelect.ScrollUpButton>

          <RadixSelect.Viewport className="p-1">
            {options.map((option) => (
              <RadixSelect.Item
                key={String(option.value)}
                value={String(option.value)}
                disabled={option.disabled}
                className={cn(
                  "relative flex cursor-pointer items-center rounded-xl py-2 pr-8 pl-3 outline-none select-none transition-colors",
                  "data-highlighted:bg-brand/10 data-highlighted:text-brand",
                  "data-[state=checked]:font-bold data-[state=checked]:text-brand",
                  "data-disabled:pointer-events-none data-disabled:opacity-40",
                  "dark:text-slate-200 dark:data-highlighted:bg-brand/20 dark:data-highlighted:text-brand-light dark:data-[state=checked]:text-brand-light",
                  size === "md" || size === "lg" ? "min-h-10 text-sm font-medium" : "min-h-9 text-xs font-semibold",
                )}
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>

                <RadixSelect.ItemIndicator className="absolute right-2.5 inline-flex items-center text-brand dark:text-brand-light">
                  <Check size={15} strokeWidth={2.5} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>

          <RadixSelect.ScrollDownButton className="flex h-7 items-center justify-center bg-white text-slate-400 hover:text-slate-600 dark:bg-slate-900 dark:text-slate-500">
            <ChevronDown size={15} />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
};

export default Select;
