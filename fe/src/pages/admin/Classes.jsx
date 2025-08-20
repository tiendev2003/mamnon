import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchClasses, 
  createClass, 
  updateClass, 
  deleteClass,
  clearError
} from '../../store/classSlice'
import Table from '../../components/UI/Table'
import Modal from '../../components/UI/Modal'
import Button from '../../components/UI/Button'
import PermissionGuard, { usePermission } from '../../components/PermissionGuard'
import { 
  FiHome, 
  FiUsers, 
  FiMapPin, 
  FiCheckCircle,
  FiPlus,
  FiEdit,
  FiTrash2
} from 'react-icons/fi'
 
const Classes = () => {
  const dispatch = useDispatch()
  const { classes, isLoading, error } = useSelector((state) => state.classes)
  const { hasPermission, isAdmin } = usePermission()

  // Kiểm tra quyền truy cập
  if (!hasPermission('manage_classes')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <FiHome className="mx-auto h-24 w-24 text-gray-400" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Không có quyền truy cập
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Bạn không có quyền quản lý lớp học. Vui lòng liên hệ quản trị viên.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'regular',
    academicYear: new Date().getFullYear().toString(),
    semester: '1',
    maxCapacity: '',
    description: ''
  })

  // Fetch classes on component mount
  useEffect(() => {
    dispatch(fetchClasses())
  }, [dispatch])

  // Clear error when component mounts
  useEffect(() => {
    if (error) {
      dispatch(clearError())
    }
  }, [dispatch])

  const columns = [
    {
      key: 'name',
      title: 'Tên lớp',
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'code',
      title: 'Mã lớp'
    },
    {
      key: 'type',
      title: 'Loại lớp',
      render: (value) => {
        const typeLabels = {
          regular: 'Thường',
          therapy: 'Trị liệu',
          mixed: 'Hỗn hợp'
        }
        return typeLabels[value] || value
      }
    },
    {
      key: 'currentCapacity',
      title: 'Sĩ số',
      render: (value, row) => (
        <span className={`font-medium ${
          value >= row.maxCapacity * 0.9 ? 'text-red-600' : 
          value >= row.maxCapacity * 0.7 ? 'text-yellow-600' : 'text-green-600'
        }`}>
          {value}/{row.maxCapacity}
        </span>
      )
    },
    {
      key: 'academicYear',
      title: 'Năm học'
    },
    {
      key: 'semester',
      title: 'Học kỳ',
      render: (value) => {
        const semesterLabels = {
          '1': 'HK1',
          '2': 'HK2', 
          'summer': 'Hè'
        }
        return semesterLabels[value] || value
      }
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Hoạt động' : 'Tạm dừng'}
        </span>
      )
    }
  ]

  const handleAddClass = () => {
    setEditingClass(null)
    setFormData({
      name: '',
      code: '',
      type: 'regular',
      academicYear: new Date().getFullYear().toString(),
      semester: '1',
      maxCapacity: '',
      description: ''
    })
    setIsModalOpen(true)
  }

  const handleEditClass = (classItem) => {
    setEditingClass(classItem)
    setFormData({
      name: classItem.name,
      code: classItem.code,
      type: classItem.type,
      academicYear: classItem.academicYear,
      semester: classItem.semester,
      maxCapacity: classItem.maxCapacity.toString(),
      description: classItem.description || ''
    })
    setIsModalOpen(true)
  }

  const handleDeleteClass = async (classItem) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa lớp ${classItem.name}?`)) {
      try {
        await dispatch(deleteClass(classItem._id)).unwrap()
      } catch (error) {
        console.error('Error deleting class:', error)
        alert('Có lỗi xảy ra khi xóa lớp học')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const processedData = {
      ...formData,
      maxCapacity: parseInt(formData.maxCapacity)
    }
    
    try {
      if (editingClass) {
        await dispatch(updateClass({ 
          id: editingClass._id, 
          ...processedData 
        })).unwrap()
      } else {
        await dispatch(createClass(processedData)).unwrap()
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving class:', error)
      alert('Có lỗi xảy ra khi lưu thông tin lớp học')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Quản lý lớp học' : 'Lớp học của tôi'}
          </h1>
          <p className="text-gray-600">
            {isAdmin 
              ? 'Quản lý thông tin lớp học và phân công giáo viên'
              : 'Xem thông tin các lớp học bạn phụ trách'
            }
          </p>
        </div>
        {/* Chỉ admin mới có quyền tạo lớp học */}
        <PermissionGuard requireAdmin={true}>
          <Button
            onClick={handleAddClass}
            icon={FiPlus}
          >
            Tạo lớp học
          </Button>
        </PermissionGuard>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">
            Có lỗi xảy ra khi tải dữ liệu: {error.message || 'Lỗi không xác định'}
          </p>
        </div>
      )}

      {/* Stats */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <FiHome className="w-6 h-6 mr-3 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Tổng số lớp</p>
                <p className="text-xl font-bold">{classes.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <FiUsers className="w-6 h-6 mr-3 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Tổng học sinh</p>
                <p className="text-xl font-bold">
                  {classes.reduce((sum, c) => sum + (c.currentCapacity || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <FiMapPin className="w-6 h-6 mr-3 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Sĩ số trung bình</p>
                <p className="text-xl font-bold">
                  {classes.length > 0 ? Math.round(classes.reduce((sum, c) => sum + (c.currentCapacity || 0), 0) / classes.length) : 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <FiCheckCircle className="w-6 h-6 mr-3 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Lớp hoạt động</p>
                <p className="text-xl font-bold">
                  {classes.filter(c => c.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <Table
          columns={columns}
          data={classes}
          actions={(row) => (
            <div className="flex justify-end space-x-2 items-center">
              {/* Staff có thể xem và cập nhật thông tin lớp họ phụ trách */}
              <PermissionGuard permission="manage_classes">
                <button
                  onClick={() => handleEditClass(row)}
                  className="text-blue-600 hover:text-blue-900 p-1"
                  title="Chỉnh sửa"
                >
                  <FiEdit className="w-5 h-5" />
                </button>
              </PermissionGuard>
              {/* Chỉ admin mới có quyền xóa lớp */}
              <PermissionGuard requireAdmin={true}>
                <button
                  onClick={() => handleDeleteClass(row)}
                  className="text-red-600 hover:text-red-900 p-1"
                  title="Xóa"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </PermissionGuard>
            </div>
          )}
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClass ? 'Chỉnh sửa lớp học' : 'Tạo lớp học mới'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên lớp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã lớp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại lớp <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="regular">Lớp thường</option>
                <option value="therapy">Lớp trị liệu</option>
                <option value="mixed">Lớp hỗn hợp</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sĩ số tối đa <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="maxCapacity"
                value={formData.maxCapacity}
                onChange={handleInputChange}
                required
                min="1"
                max="30"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Năm học <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                required
                placeholder="2024-2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Học kỳ <span className="text-red-500">*</span>
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1">Học kỳ 1</option>
                <option value="2">Học kỳ 2</option>
                <option value="summer">Học kỳ hè</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mô tả về lớp học..."
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              type="button"
            >
              Hủy
            </Button>
            <Button type="submit">
              {editingClass ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Classes
