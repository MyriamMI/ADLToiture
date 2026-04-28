import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/* Garde de route — redirige vers /admin/login si non authentifié */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
