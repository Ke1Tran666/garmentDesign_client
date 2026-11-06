import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/model/useAuth";

import {
  AdminHeader,
  AdminMobileDrawer,
  AdminSidebar,
} from "./components";

const AdminLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("admin-sidebar-collapsed") === "true";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", String(isCollapsed));
  }, [isCollapsed]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50/70 font-sans text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-100">
      {/* Collapsible Desktop Sidebar */}
      <AdminSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Slide-over Mobile Drawer */}
      <AdminMobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Wrapper */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Sticky Header Topbar */}
        <AdminHeader
          user={user}
          onLogout={handleLogout}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          searchKeyword={searchKeyword}
          onSearchKeywordChange={setSearchKeyword}
        />

        {/* Page Content Body */}
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8">
          <Outlet
            context={{
              searchKeyword,
              adminUser: user,
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
