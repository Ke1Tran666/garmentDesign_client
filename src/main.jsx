import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google';

import './css/reset.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider  clientId="295478383027-o1ifgrosf98kqto9jd25bi6fu8coeshj.apps.googleusercontent.com">
      <BrowserRouter>
        <App /> 
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
)
