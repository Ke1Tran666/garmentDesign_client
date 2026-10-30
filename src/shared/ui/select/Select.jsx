import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Select as RadixSelect } from "radix-ui";

const SIZE_CLASSES = {
  sm: "h-9 rounded-lg px-3 text-sm",
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
        className={`group flex w-full items-center justify-between gap-3 border bg-surface text-left text-text-default transition outline-none ${
          SIZE_CLASSES[size] || SIZE_CLASSES.md
        } ${
          error
            ? "border-danger focus:ring-4 focus:ring-danger/10"
            : "hover:border-border-strong border-input focus:border-brand focus:ring-4 focus:ring-brand/10"
        } disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted disabled:opacity-60 ${className}`}
      >
        <RadixSelect.Value
          placeholder={<span className="text-text-muted">{placeholder}</span>}
        />

        <RadixSelect.Icon asChild>
          <ChevronDown
            size={17}
            className="shrink-0 text-text-muted transition-transform duration-200 group-data-[state=open]:rotate-180"
          />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={6}
          collisionPadding={12}
          className={`z-100 max-h-72 min-w-(--radix-select-trigger-width) overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-xl ${contentClassName}`}
        >
          <RadixSelect.ScrollUpButton className="flex h-8 items-center justify-center bg-surface text-text-muted">
            <ChevronUp size={16} />
          </RadixSelect.ScrollUpButton>

          <RadixSelect.Viewport className="p-1">
            {options.map((option) => (
              <RadixSelect.Item
                key={String(option.value)}
                value={String(option.value)}
                disabled={option.disabled}
                className="relative flex min-h-10 cursor-pointer items-center rounded-lg py-2 pr-9 pl-3 text-sm text-text-default outline-none select-none data-highlighted:bg-brand-soft data-highlighted:text-brand data-disabled:pointer-events-none data-disabled:opacity-40"
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>

                <RadixSelect.ItemIndicator className="absolute right-3 inline-flex items-center text-brand">
                  <Check size={16} strokeWidth={2.5} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>

          <RadixSelect.ScrollDownButton className="flex h-8 items-center justify-center bg-surface text-text-muted">
            <ChevronDown size={16} />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
};

export default Select;
