import './App.css'
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import { NotificationProvider } from './components/ui/Notification/NotificationContext';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ProfilePage from './pages/Profile/ProfilePage';

const App = () => {

  return (
    <NotificationProvider>
      <Routes>
        <Route path="/" element={<Home />}/>

        {/* LOGIN */}
        <Route path="/login" element={<LoginPage />} />
        {/* REGISTER */}
        <Route path="/register" element={<RegisterPage/>} />
        {/* FORGOT PASSWORD */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* PROFILE */}
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </NotificationProvider>
  )
}

export default App
