import Select from "./Select";

const FilterSelect = ({
  value,
  options = [],
  onValueChange,
  ariaLabel = "Chọn bộ lọc",
  className = "",
  disabled = false,
  size = "filter",
  ...props
}) => {
  return (
    <Select
      value={value}
      options={options}
      onValueChange={onValueChange}
      ariaLabel={ariaLabel}
      disabled={disabled}
      size={size}
      className={className}
      {...props}
    />
  );
};

export default FilterSelect;
