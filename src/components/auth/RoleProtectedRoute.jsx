import { Navigate, useLocation } from "react-router-dom";

import { getAccountPathByRole, normalizeRole } from "@/lib/authRole";
import { useAuth } from "./useAuth";

const RoleProtectedRoute = ({ allowedRoles = [], children }) => {
  const location = useLocation();

  const {user,loading} = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  const role = normalizeRole(user.role);

  const normalizedAllowedRoles = allowedRoles.map(normalizeRole);

  if (!normalizedAllowedRoles.includes(role)) {
    return (
      <Navigate
        to={getAccountPathByRole(role)}
        replace
      />
    );
  }

  return children;
};

export default RoleProtectedRoute;