import { createContext, useContext, useState } from 'react'

/* Contexte d'authentification global */
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  /* Lecture du token depuis le stockage local au démarrage */
  const [token, setToken] = useState(() => localStorage.getItem('adl_token'))

  /* Sauvegarde du token après connexion réussie */
  function login(newToken) {
    localStorage.setItem('adl_token', newToken)
    setToken(newToken)
  }

  /* Suppression du token lors de la déconnexion */
  function logout() {
    localStorage.removeItem('adl_token')
    setToken(null)
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

/* Hook personnalisé pour accéder au contexte */
export function useAuth() {
  return useContext(AuthContext)
}
