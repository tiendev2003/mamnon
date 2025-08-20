import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  FiBarChart2, 
  FiUsers, 
  FiBookOpen, 
  FiHome, 
  FiHeart, 
  FiCalendar, 
  FiUserCheck, 
  FiFileText,
  FiChevronRight,
  FiChevronLeft
} from 'react-icons/fi'
import { usePermission } from '../PermissionGuard'

const Sidebar = ({ activeSection }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { hasPermission, isAdmin } = usePermission()
  console.log('isAdmin:', isAdmin)

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Tổng quan',
      icon: FiBarChart2,
      path: '/admin/dashboard',
      requirePermission: null, // Tất cả đều xem được
      show: true
    },
    {
      id: 'students',
      title: 'Quản lý học sinh',
      icon: FiUsers,
      path: '/admin/students',
      requirePermission: 'manage_students',
      show: hasPermission('manage_students')
    },
    {
      id: 'teachers',
      title: 'Quản lý giáo viên',
      icon: FiUserCheck,
      path: '/admin/teachers',
      requirePermission: 'manage_teachers',
      show: hasPermission('manage_teachers')
    },
    {
      id: 'classes',
      title: 'Quản lý lớp học',
      icon: FiHome,
      path: '/admin/classes',
      requirePermission: 'manage_classes',
      show: hasPermission('manage_classes')
    },
    {
      id: 'therapy',
      title: 'Ca trị liệu',
      icon: FiHeart,
      path: '/admin/therapy',
      requirePermission: 'manage_therapy',
      show: hasPermission('manage_therapy')
    },
    {
      id: 'schedules',
      title: 'Lịch làm việc',
      icon: FiCalendar,
      path: '/admin/schedules',
      requirePermission: 'manage_therapy', // Lịch liên quan đến therapy và teachers
      show: hasPermission('manage_therapy') || hasPermission('manage_teachers')
    },
    {
      id: 'users',
      title: 'Quản lý tài khoản',
      icon: FiUsers,
      path: '/admin/users',
      requirePermission: 'manage_users',
      show: hasPermission('manage_users')
    },
    {
      id: 'reports',
      title: 'Báo cáo',
      icon: FiFileText,
      path: '/admin/reports',
      requirePermission: 'view_reports',
      show: hasPermission('view_reports')
    }
  ]

  // Lọc menu items dựa trên quyền
  const visibleMenuItems = menuItems.filter(item => item.show)

  return (
    <div className={`bg-blue-900 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} min-h-screen`}>
      {/* Header */}
      <div className="p-4 border-b border-blue-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold">Mầm Non Manager</h1>
              <p className="text-sm text-blue-200 mt-1">
                {isAdmin ? 'Quản trị viên' : 'Nhân viên'}
              </p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            {isCollapsed ? <FiChevronRight className="w-5 h-5" /> : <FiChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-2">
        {visibleMenuItems.map((item) => {
          const IconComponent = item.icon
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`w-full flex items-center p-3 mb-2 rounded-lg transition-colors ${
                activeSection === item.id
                  ? 'bg-blue-700 text-white'
                  : 'hover:bg-blue-800 text-blue-100'
              }`}
            >
              <IconComponent className="w-5 h-5 mr-3" />
              {!isCollapsed && (
                <span className="font-medium">{item.title}</span>
              )}
            </Link>
          )
        })}
      </nav>     
    </div>
  )
}

export default Sidebar
