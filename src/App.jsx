import './App.css'
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import { NotificationProvider } from './components/ui/Notification/NotificationContext';
import LoginPage from './pages/Login/LoginPage';

const App = () => {

  return (
    <NotificationProvider>
      <Routes>
        <Route path="/" element={<Home />}/>

        {/* LOGIN */}
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </NotificationProvider>
  )
}

export default App
