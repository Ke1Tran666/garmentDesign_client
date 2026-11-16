export const PortalShellLayout = ({
  sidebar,
  mobileDrawer,
  header,
  children,
}) => {
  return (
    <div className="flex min-h-screen bg-slate-50/70 font-sans text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-100">
      {sidebar}
      {mobileDrawer}

      <div className="flex min-w-0 flex-1 flex-col">
        {header}
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PortalShellLayout;
