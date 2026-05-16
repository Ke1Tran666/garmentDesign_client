import './App.css'
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import { NotificationProvider } from './components/ui/Notification/NotificationContext';

const App = () => {

  return (
    <NotificationProvider>
      <Routes>
        <Route path="/" element={<Home />}/>
      </Routes>
    </NotificationProvider>
  )
}

export default App
