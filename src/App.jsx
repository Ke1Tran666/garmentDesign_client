import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import { NotificationProvider } from './components/ui/Notification/NotificationContext';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import UserLayout from './layouts/UserLayout/UserLayout';
import AuthLayout from './layouts/AuthLayout/AuthLayout';
import ProfilePage from './pages/User/Account/ProfilePage';
import AddressPage from './pages/User/Account/AddressPage';
import SecurityPage from './pages/User/Account/SecurityPage';
import DashboardPage from './pages/User/Main/DashboardPage';
import PrivacyPage from './pages/User/Account/PrivacyPage';

const App = () => {

  return (
    <NotificationProvider>
      <Routes>
        <Route path="/" element={<Home />}/>

        {/* AUTH */}
        <Route element={<AuthLayout />}>

          {/* LOGIN */}
          <Route path="/login" element={<LoginPage />} />

          {/* REGISTER */}
          <Route path="/register" element={<RegisterPage />} />
          
          {/* FORGOT PASSWORD */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* MAIN USER */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
        </Route>

        {/* USER */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="address" element={<AddressPage />} />
          <Route path="security" element={<SecurityPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
        </Route>
      </Routes>
    </NotificationProvider>
  )
}

export default App
