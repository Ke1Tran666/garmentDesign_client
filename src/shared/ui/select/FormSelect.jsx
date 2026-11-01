import Select from "./Select";

const FormSelect = ({
  id,
  name,
  label,
  error = "",
  hint = "",
  required = false,
  containerClassName = "",
  labelClassName = "",
  ...selectProps
}) => {
  const selectId = id || name;

  return (
    <div className={containerClassName}>
      {label && (
        <label
          htmlFor={selectId}
          className={`mb-2 block text-sm font-semibold text-text-default ${labelClassName}`}
        >
          {label}

          {required && (
            <span className="ml-1 text-danger" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <Select
        {...selectProps}
        id={selectId}
        name={name}
        required={required}
        error={Boolean(error)}
      />

      {error ? (
        <p className="mt-1.5 text-xs text-danger">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-text-muted">{hint}</p>
      )}
    </div>
  );
};

export default FormSelect;
