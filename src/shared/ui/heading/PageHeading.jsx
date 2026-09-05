const PageHeading = ({
  title,
  description,
  className = "",
}) => (
  <div className={className}>
    <h1 className="text-2xl font-bold text-text-strong">
      {title}
    </h1>

    {description && (
      <p className="mt-1 text-sm text-text-muted">
        {description}
      </p>
    )}
  </div>
);

export default PageHeading;