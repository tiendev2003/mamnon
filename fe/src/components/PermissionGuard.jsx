import { useSelector } from 'react-redux'
import { selectUserRole, selectUserPermissions, selectIsAdmin } from '../store/authSlice'

const PermissionGuard = ({ 
  children, 
  permission = null, 
  role = null, 
  requireAdmin = false,
  fallback = null 
}) => {
  const userRole = useSelector(selectUserRole)
  console.log('userRole:', userRole)
  const userPermissions = useSelector(selectUserPermissions)
  const isAdmin = useSelector(selectIsAdmin)

  // Admin có toàn quyền
  if (isAdmin || requireAdmin && isAdmin) {
    return children
  }

  // Kiểm tra role cụ thể
  if (role && userRole !== role) {
    return fallback
  }

  // Kiểm tra permission cụ thể
  if (permission && !userPermissions.includes(permission)) {
    return fallback
  }

  // Nếu yêu cầu admin mà không phải admin
  if (requireAdmin && !isAdmin) {
    return fallback
  }

  return children
}

// Hook để kiểm tra quyền
export const usePermission = () => {
  const userRole = useSelector(selectUserRole)
  const userPermissions = useSelector(selectUserPermissions)
    const isAdmin = useSelector(selectIsAdmin)

  const hasPermission = (permission) => {
    if (isAdmin) return true
    return userPermissions.includes(permission)
  }

  const hasRole = (role) => {
    return userRole === role
  }

  const canAccess = (permission = null, role = null, requireAdmin = false) => {
    if (requireAdmin) return isAdmin
    if (isAdmin) return true
    if (role && userRole !== role) return false
    if (permission && !userPermissions.includes(permission)) return false
    return true
  }

  return {
    hasPermission,
    hasRole,
    canAccess,
    isAdmin,
    userRole,
    userPermissions
  }
}

export default PermissionGuard
