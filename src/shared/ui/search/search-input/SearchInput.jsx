import { Search } from "lucide-react";

const SearchInput = ({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  className = "",
  onSearch,
}) => {
  return (
    <label
      className={`
        relative block w-full
        ${className}
      `}
    >
      <Search
        size={18}
        className="
          pointer-events-none
          absolute left-4 top-1/2
          -translate-y-1/2
          text-text-subtle
        "
      />

      <input
        type="text"
        value={value}
        onChange={(event) => {
          onChange?.(event.target.value);
          onSearch?.(event.target.value);
        }}
        placeholder={placeholder}
        className="
          h-11 w-full rounded-lg
          border border-input
          bg-surface pl-11 pr-4
          text-sm text-text-default
          outline-none transition

          placeholder:text-text-subtle

          focus:border-brand
          focus:ring-4
          focus:ring-brand/10
        "
      />
    </label>
  );
};

export default SearchInput;