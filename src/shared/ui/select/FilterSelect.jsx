const FilterSelect = ({
  value,
  options = [],
  onValueChange,
  ariaLabel = "Chọn bộ lọc",
  className = "",
  disabled = false,
}) => {
  const handleChange = (event) => {
    onValueChange?.(event.target.value);
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        h-11 w-full rounded-xl
        border border-input bg-surface
        px-3 text-sm text-text-default
        outline-none transition
        focus:border-brand
        focus:ring-4 focus:ring-brand/10
        disabled:cursor-not-allowed
        disabled:bg-surface-muted
        disabled:opacity-60
        ${className}
      `}
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default FilterSelect;