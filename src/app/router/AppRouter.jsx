import "@/app/App.css";
import { Navigate, Route, Routes } from "react-router-dom";

import Home from "@/pages/home/HomePage";
import LoginPage from "@/pages/Auth/LoginPage";
import RegisterPage from "@/pages/Auth/RegisterPage";
import ForgotPasswordPage from "@/pages/Auth/ForgotPasswordPage";

import UserLayout from "@/widgets/user-shell/UserLayout";
import AuthLayout from "@/widgets/auth-shell/AuthLayout";

import DashboardPage from "@/pages/User/dashboard/DashboardPage";
import ServiceOrderPage from "@/pages/User/Services/ServiceOrderPage";
import ServiceReviewPage from "@/pages/User/Services/ServiceReviewPage";
import ProfilePage from "@/pages/User/Account/ProfilePage";
import AddressPage from "@/pages/User/Account/AddressPage";
import SecurityPage from "@/pages/User/Account/SecurityPage";
import PrivacyPage from "@/pages/User/Account/PrivacyPage";

import NotFoundPage from "@/pages/not-found/NotFoundPage";
import AdminLayout from "@/widgets/admin-shell/AdminLayout";
import AdminDashboardPage from "@/pages/Admin/Dashboard/AdminDashboardPage";
import RoleProtectedRoute from "@/app/router/RoleProtectedRoute";
import UserManagementPage from "@/pages/Admin/Users/UserManagementPage";
import UserDetailPage from "@/pages/Admin/Users/UserDetailPage";

const AppRouter = () => {
  return (
    <Routes>
        <Route path="/" element={<Home />}/>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />}/>
          <Route path="/register" element={<RegisterPage />}/>
          <Route path="/forgot-password" element={<ForgotPasswordPage />}/>
        </Route>

        <Route 
          path="/user" 
          element={
            <RoleProtectedRoute allowedRoles={["user"]}>
              <UserLayout />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<Navigate to="profile" replace/>}/>

          <Route path="dashboard" element={<DashboardPage />}/>

          <Route path="service-order" element={<ServiceOrderPage />}/>
          <Route path="service-reviews" element={<ServiceReviewPage />}/>

          <Route path="profile" element={<ProfilePage />}/>
          <Route path="address" element={<AddressPage />}/>
          <Route path="security" element={<SecurityPage />}/>
          <Route path="privacy" element={<PrivacyPage />}/>
        </Route>

        <Route 
          path="/admin" 
          element={
            <RoleProtectedRoute allowedRoles={[ "admin", "staff"]}>
              <AdminLayout />
            </RoleProtectedRoute>
          }
        >
          <Route index element={ <Navigate to="dashboard" replace/>}/>

          <Route path="dashboard" element={<AdminDashboardPage />}/>
          <Route path="users" element={<UserManagementPage />} />
          <Route path="users/:userId" element={<UserDetailPage />} />
        </Route>

        <Route path="/not-found" element={<NotFoundPage />}/>

        <Route path="*" element={<NotFoundPage />}/>
    </Routes>
  );
};

export default AppRouter;
