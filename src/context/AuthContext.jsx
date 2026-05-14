import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)

  /* Vérifie la session PHP au chargement de l'app */
  useEffect(() => {
    fetch('http://localhost/ADLToiture/php/api/auth/check', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setIsAuthenticated(data.authenticated === true))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setChecking(false))
  }, [])

  function login() {
    setIsAuthenticated(true)
  }

  /* Appelle l'endpoint de déconnexion pour détruire la session PHP */
  async function logout() {
    await fetch('http://localhost/ADLToiture/php/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {})
    setIsAuthenticated(false)
  }

  if (checking) return null

  return (
    <AuthContext.Provider value={{ login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

/* Hook personnalisé pour accéder au contexte */
export function useAuth() {
  return useContext(AuthContext)
}
