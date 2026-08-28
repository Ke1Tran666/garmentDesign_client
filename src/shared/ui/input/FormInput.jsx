const FormInput = ({
  id,
  name,
  label,
  type = "text",
  value = "",
  onChange,
  placeholder = "",
  disabled = false,
  error = "",
  hint = "",
  containerClassName = "",
  inputClassName = "",
  ...inputProps
}) => {
  const inputId = id || name;
  const descriptionId = error
    ? `${inputId}-error` 
    : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={containerClassName}>
      <label
        htmlFor={inputId}
        className="mb-2 block text-sm font-semibold text-text-default"
      >
        {label}
      </label>

      <input
        {...inputProps}
        id={inputId}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={descriptionId}
        className={`
          h-11 w-full rounded-xl border bg-surface px-4
          text-sm text-text-default outline-none transition
          disabled:cursor-not-allowed disabled:bg-surface-muted
          ${
            error
              ? `
                border-danger focus:border-danger focus:ring-4 focus:ring-danger/10
              `
              : `
                border-input focus:border-brand focus:ring-4 focus:ring-brand/10
              `
          }
          ${inputClassName}
        `}
      />

      {error ? (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 text-xs text-danger"
        >
          {error}
        </p>
      ) : (
        hint && (
          <p
            id={`${inputId}-hint`}
            className="mt-1.5 text-xs text-text-muted"
          >
            {hint}
          </p>
        )
      )}
    </div>
  );
};

export default FormInput;