import { createContext, useContext, useEffect, useState } from 'react'
import { checkAuth, logout as apiLogout } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)

  /* Vérifie la session PHP au chargement de l'app */
  useEffect(() => {
    checkAuth()
      .then((data) => setIsAuthenticated(data.authenticated === true))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setChecking(false))
  }, [])

  function login() {
    setIsAuthenticated(true)
  }

  /* Appelle l'endpoint de déconnexion pour détruire la session PHP */
  async function logout() {
    await apiLogout().catch(() => {})
    setIsAuthenticated(false)
  }

  if (checking) return null

  return (
    <AuthContext.Provider value={{ login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
