import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import { NotificationProvider } from './components/ui/Notification/NotificationContext';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import UserLayout from './layouts/UserLayout/UserLayout';
import ProfilePage from './pages/User/Profile/ProfilePage';
import AuthLayout from './layouts/AuthLayout/AuthLayout';

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

        {/* USER */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </NotificationProvider>
  )
}

export default App
