const Switch = ({
  checked = false,
  disabled = false,
  onChange,
  onCheckedChange,
  className = "",
  id,
  name,
  "aria-label": ariaLabel = "Bật hoặc tắt",
}) => {
  const handleChange = (event) => {
    const nextChecked = event.target.checked;

    onChange?.(nextChecked,event);

    onCheckedChange?.(nextChecked);
  };

  return (
    <label
      className={`
        relative inline-flex shrink-0
        items-center
        ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer"
        }
        ${className}
      `}
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={Boolean(checked)}
        disabled={disabled}
        onChange={handleChange}
        aria-label={ariaLabel}
        className="peer sr-only"
      />

      <span
        className="
          relative h-6 w-11 rounded-full
          bg-gray-300 transition-all
          duration-200

          after:absolute
          after:left-0.5
          after:top-0.5
          after:h-5
          after:w-5
          after:rounded-full
          after:bg-surface
          after:shadow-sm
          after:transition-transform
          after:duration-200
          after:content-['']

          peer-checked:bg-brand
          peer-checked:after:translate-x-5

          peer-focus-visible:ring-2
          peer-focus-visible:ring-brand/30
          peer-focus-visible:ring-offset-2

          peer-disabled:pointer-events-none
        "
      />
    </label>
  );
};

export default Switch;