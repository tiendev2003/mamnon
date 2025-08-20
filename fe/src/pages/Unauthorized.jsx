import { useNavigate } from 'react-router-dom'
import { FiAlertTriangle, FiArrowLeft } from 'react-icons/fi'

const Unauthorized = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <FiAlertTriangle className="mx-auto h-24 w-24 text-red-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Không có quyền truy cập
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên để được cấp quyền.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </button>
          
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  )
}

export default Unauthorized
