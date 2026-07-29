const RadioGroup = ({
  label,
  name,
  value,
  options = [],
  onChange,
}) => {
  return (
    <div>
      {label && (
        <p className="mb-3 text-sm font-semibold text-text-default">
          {label}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-surface px-4 py-2.5 text-sm font-medium text-text-default transition hover:border-brand hover:bg-surface-subtle"
          >
            <input
              type="radio"
              name={name}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4"
              style={{ accentColor: "var(--color-brand)" }}
            />

            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default RadioGroup;