import React from 'react'
import { Link } from 'react-router-dom'
import { 
  FiUsers, 
  FiUserCheck, 
  FiHome, 
  FiHeart,
  FiCalendar,
  FiBarChart2,
  FiStar,
  FiHeart as FiLove
} from 'react-icons/fi'

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FiStar className="w-8 h-8 text-indigo-600 mr-2" />
              <span className="text-2xl font-bold text-indigo-600">MamNon</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Hệ thống quản lý 
            <span className="text-indigo-600"> Mầm non</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Giải pháp toàn diện để quản lý học sinh, giáo viên, lớp học và theo dõi 
            quá trình phát triển của trẻ trong môi trường giáo dục mầm non
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/admin"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition duration-200 transform hover:scale-105"
            >
              Vào hệ thống quản lý
            </Link>
            <button className="bg-white hover:bg-gray-50 text-indigo-600 border-2 border-indigo-600 px-8 py-4 rounded-lg text-lg font-medium transition duration-200">
              Tìm hiểu thêm
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition duration-300">
            <FiUsers className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <h3 className="text-xl font-semibold mb-2">Quản lý học sinh</h3>
            <p className="text-gray-600">
              Theo dõi thông tin cá nhân, sức khỏe và quá trình phát triển của từng học sinh
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition duration-300">
            <FiUserCheck className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h3 className="text-xl font-semibold mb-2">Quản lý giáo viên</h3>
            <p className="text-gray-600">
              Quản lý thông tin, phân công và đánh giá hiệu quả làm việc của giáo viên
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition duration-300">
            <FiHome className="w-16 h-16 mx-auto mb-4 text-purple-600" />
            <h3 className="text-xl font-semibold mb-2">Quản lý lớp học</h3>
            <p className="text-gray-600">
              Tổ chức và quản lý thông tin các lớp học, danh sách học sinh theo từng lớp
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition duration-300">
            <FiHeart className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <h3 className="text-xl font-semibold mb-2">Ca trị liệu</h3>
            <p className="text-gray-600">
              Quản lý và theo dõi các buổi trị liệu, can thiệp sớm cho trẻ có nhu cầu đặc biệt
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition duration-300">
            <FiCalendar className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
            <h3 className="text-xl font-semibold mb-2">Lịch làm việc</h3>
            <p className="text-gray-600">
              Quản lý lịch học, lịch làm việc và các hoạt động giáo dục hàng ngày
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition duration-300">
            <FiBarChart2 className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
            <h3 className="text-xl font-semibold mb-2">Báo cáo thống kê</h3>
            <p className="text-gray-600">
              Tạo báo cáo chi tiết và thống kê toàn diện về hoạt động của trường
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
