import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/model/useAuth";
import { PortalShellLayout } from "@/shared/ui/portal-shell";

import { UserHeader, UserMobileDrawer, UserSidebar } from "./components";

const UserLayout = () => {
  const navigate = useNavigate();
  const { user, logout, refreshSession } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("user-sidebar-collapsed") === "true";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    localStorage.setItem("user-sidebar-collapsed", String(isCollapsed));
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
        <UserSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
          user={user}
          onLogout={handleLogout}
        />
      }
      mobileDrawer={
        <UserMobileDrawer
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          user={user}
          onLogout={handleLogout}
        />
      }
      header={
        <UserHeader
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
          currentUser: user,
          refreshSession,
        }}
      />
    </PortalShellLayout>
  );
};

export default UserLayout;
