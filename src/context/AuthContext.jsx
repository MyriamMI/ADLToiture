import { createContext, useContext, useState, useEffect } from 'react'
import { getToken, removeToken, logout as apiLogout, BASE_URL } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken())

  useEffect(() => {
    const token = getToken()
    if (!token) return
    fetch(`${BASE_URL}/auth/check`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('invalid')
        return res.json()
      })
      .then((data) => {
        if (!data.authenticated) throw new Error('invalid')
      })
      .catch(() => {
        removeToken()
        setIsAuthenticated(false)
      })
  }, [])

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
