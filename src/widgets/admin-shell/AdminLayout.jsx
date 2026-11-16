import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/model/useAuth";
import { PortalShellLayout } from "@/shared/ui/portal-shell";

import { AdminHeader, AdminMobileDrawer, AdminSidebar } from "./components";

const AdminLayout = () => {
  const navigate = useNavigate();
  const { user, logout, refreshSession } = useAuth();

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
    <PortalShellLayout
      sidebar={
        <AdminSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
          user={user}
          onLogout={handleLogout}
        />
      }
      mobileDrawer={
        <AdminMobileDrawer
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          user={user}
          onLogout={handleLogout}
        />
      }
      header={
        <AdminHeader
          user={user}
          onLogout={handleLogout}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          searchKeyword={searchKeyword}
          onSearchKeywordChange={setSearchKeyword}
        />
      }
    >
      <Outlet
        context={{
          searchKeyword,
          adminUser: user,
          refreshSession,
        }}
      />
    </PortalShellLayout>
  );
};

export default AdminLayout;
