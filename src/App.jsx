import './App.css'
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import { NotificationProvider } from './components/ui/Notification/NotificationContext';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';

const App = () => {

  return (
    <NotificationProvider>
      <Routes>
        <Route path="/" element={<Home />}/>

        {/* LOGIN */}
        <Route path="/login" element={<LoginPage />} />
        {/* REGISTER */}
        <Route path="/register" element={<RegisterPage/>} />
      </Routes>
    </NotificationProvider>
  )
}

export default App
