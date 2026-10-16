import Select from "./Select";

const FilterSelect = ({
  value,
  options = [],
  onValueChange,
  ariaLabel = "Chọn bộ lọc",
  className = "",
  disabled = false,
}) => {
  return (
    <Select
      value={value}
      options={options}
      onValueChange={onValueChange}
      ariaLabel={ariaLabel}
      disabled={disabled}
      className={className}
    />
  );
};

export default FilterSelect;
