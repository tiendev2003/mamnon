import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchOverviewStats,
  fetchRecentActivities,
  fetchTopTeachers,
  clearError 
} from '../../store/dashboardSlice'
import StatsCard from '../../components/UI/StatsCard'
import PermissionGuard, { usePermission } from '../../components/PermissionGuard'
import { 
  FiUsers, 
  FiUserCheck, 
  FiHome, 
  FiHeart,
  FiLoader,
  FiUserPlus,
  FiPlus,
  FiFileText,
  FiWatch
} from 'react-icons/fi'

const Dashboard = () => {
  const dispatch = useDispatch()
  const { hasPermission, isAdmin, userRole } = usePermission()
  const { 
    overviewStats, 
    recentActivities, 
    topTeachers,
    isLoading,
    error 
  } = useSelector((state) => state.dashboard)

  // Fetch data on component mount
  useEffect(() => {
    // Admin thấy tất cả thống kê, Staff chỉ thấy thống kê của lớp mình
    dispatch(fetchOverviewStats())
    dispatch(fetchRecentActivities({ limit: 8 }))
    if (isAdmin) {
      dispatch(fetchTopTeachers({ limit: 5 }))
    }
  }, [dispatch, isAdmin])

  // Clear error when component mounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const upcomingSchedule = [
    {
      id: 1,
      title: 'Họp phụ huynh lớp Mầm Lớn 1',
      time: '14:00 - 15:30',
      date: 'Hôm nay',
      type: 'meeting'
    },
    {
      id: 2,
      title: 'Ca trị liệu - Nguyễn Văn D',
      time: '15:00 - 16:00',
      date: 'Hôm nay',
      type: 'therapy'
    },
    {
      id: 3,
      title: 'Kiểm tra sức khỏe định kỳ',
      time: '08:00 - 11:00',
      date: 'Ngày mai',
      type: 'health'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center">
          <FiWatch className="w-8 h-8 mr-3" />
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Chào mừng {isAdmin ? 'Quản trị viên' : 'Nhân viên'}!
            </h2>
            <p className="text-blue-100">Hôm nay là ngày {new Date().toLocaleDateString('vi-VN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {(error.overview || error.activities || error.topTeachers) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">
            Có lỗi xảy ra khi tải dữ liệu dashboard. Vui lòng thử lại.
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PermissionGuard permission="manage_students">
          <StatsCard
            title={isAdmin ? "Tổng số học sinh" : "Học sinh của tôi"}
            value={overviewStats.totalStudents}
            icon={FiUsers}
            color="blue"
            trend={{ 
              value: isAdmin 
                ? `${overviewStats.activeStudents} đang học` 
                : `${overviewStats.activeStudents} đang học trong lớp`, 
              isPositive: true 
            }}
            isLoading={isLoading.overview}
          />
        </PermissionGuard>
        
        {isAdmin && (
          <PermissionGuard permission="manage_teachers">
            <StatsCard
              title="Tổng số giáo viên"
              value={overviewStats.totalTeachers}
              icon={FiUserCheck}
              color="green"
              isLoading={isLoading.overview}
            />
          </PermissionGuard>
        )}
        
        <PermissionGuard permission="manage_classes">
          <StatsCard
            title={isAdmin ? "Số lớp học" : "Lớp tôi phụ trách"}
            value={overviewStats.totalClasses}
            icon={FiHome}
            color="purple"
            trend={{ 
              value: isAdmin 
                ? `${overviewStats.activeClasses} đang hoạt động`
                : `${overviewStats.activeClasses} lớp đang dạy`, 
              isPositive: true 
            }}
            isLoading={isLoading.overview}
          />
        </PermissionGuard>
        
        <PermissionGuard permission="manage_therapy">
          <StatsCard
            title={isAdmin ? "Ca trị liệu hôm nay" : "Ca trị liệu của tôi"}
            value={overviewStats.todayTherapySessions}
            icon={FiHeart}
            color="yellow"
            trend={{ 
              value: `${overviewStats.pendingTherapySessions} đang chờ`, 
              isPositive: false 
            }}
            isLoading={isLoading.overview}
          />
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h3>
          </div>
          <div className="p-6">
            {isLoading.activities ? (
              <div className="flex justify-center items-center py-8">
                <FiLoader className="animate-spin h-6 w-6 text-blue-600 mr-2" />
                <span className="text-gray-600">Đang tải...</span>
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="text-2xl">{activity.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.title}</p>
                      {activity.subtitle && (
                        <p className="text-xs text-gray-600">{activity.subtitle}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.time).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Chưa có hoạt động nào</p>
            )}
          </div>
        </div>

        {/* Top Teachers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Giáo viên xuất sắc</h3>
          </div>
          <div className="p-6">
            {isLoading.topTeachers ? (
              <div className="flex justify-center items-center py-8">
                <FiLoader className="animate-spin h-6 w-6 text-blue-600 mr-2" />
                <span className="text-gray-600">Đang tải...</span>
              </div>
            ) : topTeachers.length > 0 ? (
              <div className="space-y-4">
                {topTeachers.map((teacher, index) => (
                  <div key={teacher._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-800">
                          #{index + 1}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{teacher.fullName}</h4>
                        <p className="text-sm text-gray-600">{teacher.specialization}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {teacher.totalSessions} buổi
                      </p>
                      <p className="text-xs text-green-600">
                        {teacher.successRate?.toFixed(1)}% thành công
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Chưa có dữ liệu giáo viên</p>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Schedule */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Lịch sắp tới</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {upcomingSchedule.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.time}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    item.date === 'Hôm nay' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Thao tác nhanh</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors group">
              <FiUsers className="w-8 h-8 mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-blue-900">Thêm học sinh</span>
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors group">
              <FiUserPlus className="w-8 h-8 mx-auto mb-2 text-green-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-green-900">Thêm giáo viên</span>
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors group">
              <FiHome className="w-8 h-8 mx-auto mb-2 text-purple-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-purple-900">Tạo lớp học</span>
            </button>
            <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-center transition-colors group">
              <FiFileText className="w-8 h-8 mx-auto mb-2 text-yellow-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-yellow-900">Xem báo cáo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
