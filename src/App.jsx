import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";

import UserLayout from "./layouts/UserLayout/UserLayout";
import AuthLayout from "./layouts/AuthLayout/AuthLayout";

import DashboardPage from "./pages/User/Main/DashboardPage";
import ServiceOrderPage from "./pages/User/Services/ServiceOrderPage";
import ServiceReviewPage from "./pages/User/Services/ServiceReviewPage";
import ProfilePage from "./pages/User/Account/ProfilePage";
import AddressPage from "./pages/User/Account/AddressPage";
import SecurityPage from "./pages/User/Account/SecurityPage";
import PrivacyPage from "./pages/User/Account/PrivacyPage";

import { NotificationProvider } from "./components/ui/Notification/NotificationContext";
import NotFoundPage from "./pages/NotFoundPage";
import AdminLayout from "./layouts/AdminLayout/AdminLayout";
import AdminDashboardPage from "./pages/Admin/Dashboard/AdminDashboardPage";
import RoleProtectedRoute from "./components/auth/RoleProtectedRoute";

const App = () => {
  return (
    <NotificationProvider>
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
          <Route index element={<Navigate to="dashboard" replace/>}/>

          <Route path="dashboard" element={<AdminDashboardPage />}/>
        </Route>

        <Route path="/not-found" element={<NotFoundPage />}/>

        <Route path="*" element={<NotFoundPage />}/>
      </Routes>
    </NotificationProvider>
  );
};

export default App;