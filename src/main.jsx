import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AOS from 'aos'
import 'aos/dist/aos.css'
import './styles/index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'

AOS.init({
  duration: 800,
  once: true,
  offset: 100,
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* Fournisseur d'authentification — disponible dans toute l'application */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
