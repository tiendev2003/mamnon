import React from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

function AdminLayout({ children }) {
  const location = useLocation()
  
  // Get current section from URL
  const getCurrentSection = () => {
    const path = location.pathname.split('/admin/')[1] || 'dashboard'
    return path === '' ? 'dashboard' : path
  }

  const getSectionTitle = () => {
    const section = getCurrentSection()
    const titles = {
      dashboard: 'Tổng quan',
      students: 'Quản lý học sinh',
      teachers: 'Quản lý giáo viên',
      classes: 'Quản lý lớp học',
      therapy: 'Quản lý ca trị liệu',
      schedules: 'Quản lý lịch làm việc',
      users: 'Quản lý tài khoản',
      reports: 'Báo cáo thống kê'
    }
    return titles[section] || 'Tổng quan'
  }

  const getSectionSubtitle = () => {
    const section = getCurrentSection()
    const subtitles = {
      dashboard: 'Tổng quan hệ thống quản lý mầm non',
      students: 'Quản lý thông tin học sinh và theo dõi quá trình phát triển',
      teachers: 'Quản lý thông tin giáo viên và phân công công việc',
      classes: 'Quản lý thông tin lớp học và danh sách học sinh',
      therapy: 'Quản lý và theo dõi các ca trị liệu cho học sinh',
      schedules: 'Quản lý lịch làm việc của giáo viên và lịch học của học sinh',
      users: 'Quản lý tài khoản người dùng và phân quyền',
      reports: 'Xem báo cáo và thống kê tổng quan'
    }
    return subtitles[section] || ''
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeSection={getCurrentSection()} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          title={getSectionTitle()}
          subtitle={getSectionSubtitle()}
        />
        
        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
