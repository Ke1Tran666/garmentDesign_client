import "@/app/App.css";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import RoleProtectedRoute from "@/app/router/RoleProtectedRoute";
import { PageSkeleton } from "@/shared/ui/skeleton";
import AdminLayout from "@/widgets/admin-shell/AdminLayout";
import AuthLayout from "@/widgets/auth-shell/AuthLayout";
import UserLayout from "@/widgets/user-shell/UserLayout";

// Home & Auth Pages (Lazy-loaded)
const Home = lazy(() => import("@/pages/home/HomePage"));
const LoginPage = lazy(() => import("@/pages/Auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/Auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/Auth/ForgotPasswordPage"));

// User Pages (Lazy-loaded)
const DashboardPage = lazy(() => import("@/pages/User/dashboard/DashboardPage"));
const ServiceOrderPage = lazy(
  () => import("@/pages/User/Services/ServiceOrderPage"),
);
const ServiceReviewPage = lazy(
  () => import("@/pages/User/Services/ServiceReviewPage"),
);
const ProfilePage = lazy(() => import("@/pages/User/Account/ProfilePage"));
const AddressPage = lazy(() => import("@/pages/User/Account/AddressPage"));
const SecurityPage = lazy(() => import("@/pages/User/Account/SecurityPage"));
const PrivacyPage = lazy(() => import("@/pages/User/Account/PrivacyPage"));

// Admin Pages (Lazy-loaded)
const AdminDashboardPage = lazy(
  () => import("@/pages/Admin/Dashboard/AdminDashboardPage"),
);
const UserManagementPage = lazy(
  () => import("@/pages/Admin/Users/UserManagementPage"),
);
const UserDetailPage = lazy(() => import("@/pages/Admin/Users/UserDetailPage"));
const UserCreatePage = lazy(() => import("@/pages/Admin/Users/UserCreatePage"));
const ServiceManagementPage = lazy(
  () => import("@/pages/Admin/Services/ServiceManagementPage"),
);
const ServiceDetailPage = lazy(
  () => import("@/pages/Admin/Services/ServiceDetailPage"),
);
const ServiceOrderManagementPage = lazy(
  () => import("@/pages/Admin/ServiceOrders/ServiceOrderManagementPage"),
);
const ServiceOrderDetailPage = lazy(
  () => import("@/pages/Admin/ServiceOrders/ServiceOrderDetailPage"),
);

// Fallback Page (Lazy-loaded)
const NotFoundPage = lazy(() => import("@/pages/not-found/NotFoundPage"));

const AppRouter = () => {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route
          path="/user"
          element={
            <RoleProtectedRoute allowedRoles={["user"]}>
              <UserLayout />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<Navigate to="profile" replace />} />

          <Route path="dashboard" element={<DashboardPage />} />

          <Route path="service-order" element={<ServiceOrderPage />} />
          <Route path="service-reviews" element={<ServiceReviewPage />} />

          <Route path="profile" element={<ProfilePage />} />
          <Route path="address" element={<AddressPage />} />
          <Route path="security" element={<SecurityPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <RoleProtectedRoute allowedRoles={["admin", "staff"]}>
              <AdminLayout />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route
            path="users/create"
            element={
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <UserCreatePage />
              </RoleProtectedRoute>
            }
          />
          <Route path="users/:userId" element={<UserDetailPage />} />
          <Route path="services" element={<ServiceManagementPage />} />
          <Route path="services/:serviceId" element={<ServiceDetailPage />} />
          <Route path="service-orders" element={<ServiceOrderManagementPage />} />
          <Route
            path="service-orders/:orderId"
            element={<ServiceOrderDetailPage />}
          />
        </Route>

        <Route path="/not-found" element={<NotFoundPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
