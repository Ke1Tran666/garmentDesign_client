import { Navigate, useLocation } from "react-router-dom";
import { authStorage } from "@/lib/authStorage";
import { getAccountPathByRole, normalizeRole } from "@/lib/authRole";

const RoleProtectedRoute = ({ allowedRoles = [], children }) => {
  const location = useLocation();

  const token = authStorage.getToken();

  const idUser = authStorage.getUserId();

  const role = normalizeRole(authStorage.getRole());

  const isAuthenticated = Boolean( token && idUser);

  // Chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }}/>
    );
  }

  // Có dữ liệu đăng nhập cũ nhưng chưa có role
  if (!role) {
    return (
      <Navigate to="/login" replace/>
    );
  }

  const normalizedAllowedRoles = allowedRoles.map(normalizeRole);

  const hasPermission = normalizedAllowedRoles.includes(role);

  // Đã đăng nhập nhưng vào sai khu vực
  if (!hasPermission) {
    return (
      <Navigate to={getAccountPathByRole(role)} replace/>
    );
  }

  return children;
};

export default RoleProtectedRoute;