import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { user, initializing } = useAuth()
  const location = useLocation()

  if (initializing) return null // could swap for a splash/loading screen
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  return children
}
