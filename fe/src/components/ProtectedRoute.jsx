import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { selectIsAuthenticated, selectUserRole, selectCurrentUser, selectAuthLoading } from '../store/authSlice'

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredPermission = null,
  requireAdmin = false 
}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const userRole = useSelector(selectUserRole)
  const user = useSelector(selectCurrentUser)
  const isLoading = useSelector(selectAuthLoading)
  const location = useLocation()

  // Nếu chưa authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Nếu đã authenticated nhưng chưa có thông tin user và đang loading, hiển thị loading
  if (isAuthenticated && !user && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    )
  }

  // Nếu đã authenticated nhưng vẫn chưa có user info (có thể do lỗi), redirect to login
  if (isAuthenticated && !user && !isLoading) {
    return <Navigate to="/login" replace />
  }

  // Kiểm tra quyền admin
  if (requireAdmin && userRole !== 'admin') {
    return <Navigate to="/unauthorized" replace />
  }

  // Kiểm tra role cụ thể
  if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default ProtectedRoute
