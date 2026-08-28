// Divider shows one line
export const Divider = ({
  className = "",
}) => {
  return (
    <div
      className={`my-7 h-px w-full bg-border ${className}`}
    />
  );
};