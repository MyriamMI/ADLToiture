import { createContext, useContext, useState } from 'react'
import { getToken, logout as apiLogout } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken())

  function login() {
    setIsAuthenticated(true)
  }

  async function logout() {
    await apiLogout().catch(() => {})
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
