import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchStudents, 
  createStudent, 
  updateStudent, 
  deleteStudent,
  clearError,
  selectStudents,
  selectStudentsLoading,
  selectStudentsError
} from '../../store/studentSlice'
import { fetchClasses, selectClasses } from '../../store/classSlice'
import Table from '../../components/UI/Table'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import PermissionGuard, { usePermission } from '../../components/PermissionGuard'
import { 
  FiUsers, 
  FiUserPlus, 
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiPlus,
  FiBookOpen,
  FiPause
} from 'react-icons/fi'

const Students = () => {
  const dispatch = useDispatch()
  const students = useSelector(selectStudents)
  const { hasPermission, isAdmin } = usePermission()

  // Kiểm tra quyền truy cập
  if (!hasPermission('manage_students')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <FiUsers className="mx-auto h-24 w-24 text-gray-400" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Không có quyền truy cập
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Bạn không có quyền quản lý học sinh. Vui lòng liên hệ quản trị viên.
            </p>
          </div>
        </div>
      </div>
    )
  }
  const classes = useSelector(selectClasses)
  const isLoading = useSelector(selectStudentsLoading)
  const error = useSelector(selectStudentsError)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    code: '',
    dateOfBirth: '',
    contactInfo: {
      parentName: '',
      phoneNumber: '',
      email: ''
    },
    address: {
      street: '',
      city: '',
      district: '',
      province: ''
    },
    therapyStatus: {
      isInTherapy: false,
      condition: '',
      notes: ''
    },
    class: '',
    enrollmentInfo: {
      status: 'pending'
    }
  })

  useEffect(() => {
    dispatch(fetchStudents())
    dispatch(fetchClasses())
  }, [dispatch])

  const columns = [
    {
      key: 'fullName',
      title: 'Họ và tên',
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'code',
      title: 'Mã học sinh'
    },
    {
      key: 'dateOfBirth',
      title: 'Ngày sinh',
      render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A'
    },
    {
      key: 'contactInfo',
      title: 'SĐT phụ huynh',
      render: (value) => value?.phoneNumber || 'N/A'
    },
    {
      key: 'class',
      title: 'Lớp học',
      render: (value) => {
        if (!value) return 'Chưa phân lớp'
        const classInfo = classes.find(c => c._id === value)
        return classInfo?.name || 'N/A'
      }
    },
    {
      key: 'therapyStatus',
      title: 'Can thiệp',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
          value?.isInTherapy ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value?.isInTherapy ? 'Đang can thiệp' : 'Không cần'}
        </span>
      )
    },
    {
      key: 'enrollmentInfo',
      title: 'Trạng thái',
      render: (value) => {
        const statusMap = {
          active: { label: 'Đang học', class: 'bg-green-100 text-green-800' },
          inactive: { label: 'Tạm nghỉ', class: 'bg-red-100 text-red-800' },
          pending: { label: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-800' }
        }
        const status = statusMap[value?.status] || statusMap.pending
        return (
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${status.class}`}>
            {status.label}
          </span>
        )
      }
    }
  ]

  const handleAddStudent = () => {
    setEditingStudent(null)
    setFormData({
      fullName: '',
      code: '',
      dateOfBirth: '',
      contactInfo: {
        parentName: '',
        phoneNumber: '',
        email: ''
      },
      address: {
        street: '',
        city: '',
        district: '',
        province: ''
      },
      therapyStatus: {
        isInTherapy: false,
        condition: '',
        notes: ''
      },
      class: '',
      enrollmentInfo: {
        status: 'pending'
      }
    })
    setIsModalOpen(true)
  }

  const handleEditStudent = (student) => {
    setEditingStudent(student)
    setFormData({
      fullName: student.fullName || '',
      code: student.code || '',
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
      contactInfo: {
        parentName: student.contactInfo?.parentName || '',
        phoneNumber: student.contactInfo?.phoneNumber || '',
        email: student.contactInfo?.email || ''
      },
      address: {
        street: student.address?.street || '',
        city: student.address?.city || '',
        district: student.address?.district || '',
        province: student.address?.province || ''
      },
      therapyStatus: {
        isInTherapy: student.therapyStatus?.isInTherapy || false,
        condition: student.therapyStatus?.condition || '',
        notes: student.therapyStatus?.notes || ''
      },
      class: student.class || '',
      enrollmentInfo: {
        status: student.enrollmentInfo?.status || 'pending'
      }
    })
    setIsModalOpen(true)
  }

  const handleDeleteStudent = async (student) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa học sinh ${student.fullName}?`)) {
      try {
        await dispatch(deleteStudent(student._id)).unwrap()
      } catch (error) {
        console.error('Error deleting student:', error)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingStudent) {
        await dispatch(updateStudent({ 
          id: editingStudent._id, 
          ...formData 
        })).unwrap()
      } else {
        await dispatch(createStudent(formData)).unwrap()
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving student:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
         </div>
        <PermissionGuard permission="manage_students">
          <Button
            onClick={handleAddStudent}
            icon={FiPlus}
          >
            Thêm học sinh
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
          <div className="flex justify-between items-center">
            <p className="text-red-700">
              Có lỗi xảy ra: {error.message || 'Lỗi không xác định'}
            </p>
            <button
              onClick={() => dispatch(clearError())}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && students.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <FiUsers className="w-24 h-24 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isAdmin ? 'Chưa có học sinh nào' : 'Chưa có học sinh trong lớp bạn phụ trách'}
          </h3>
          <p className="text-gray-600 mb-4">
            {isAdmin 
              ? 'Hãy thêm học sinh đầu tiên để bắt đầu quản lý'
              : 'Hiện tại chưa có học sinh nào trong các lớp bạn được phân công'
            }
          </p>
          <PermissionGuard permission="manage_students">
            <Button onClick={handleAddStudent} icon={FiPlus}>
              {isAdmin ? 'Thêm học sinh đầu tiên' : 'Thêm học sinh vào lớp'}
            </Button>
          </PermissionGuard>
        </div>
      )}

      {/* Stats */}
      {!isLoading && !error && students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <FiUsers className="w-6 h-6 mr-3 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Tổng học sinh</p>
                <p className="text-xl font-bold">{students.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <FiCheckCircle className="w-6 h-6 mr-3 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Đang can thiệp</p>
                <p className="text-xl font-bold">
                  {students.filter(s => s.therapyStatus?.isInTherapy).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <FiBookOpen className="w-6 h-6 mr-3 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Đang học</p>
                <p className="text-xl font-bold">
                  {students.filter(s => s.enrollmentInfo?.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <FiPause className="w-6 h-6 mr-3 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Chờ duyệt</p>
                <p className="text-xl font-bold">
                  {students.filter(s => s.enrollmentInfo?.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && students.length > 0 && (
        <Table
          columns={columns}
          data={students}
          actions={(row) => (
            <div className="flex justify-end space-x-2 items-center">
              <PermissionGuard permission="manage_students">
                <button
                  onClick={() => handleEditStudent(row)}
                  className="text-blue-600 hover:text-blue-900 p-1"
                  title="Chỉnh sửa"
                >
                  <FiEdit className="w-5 h-5" />
                </button>
              </PermissionGuard>
              <PermissionGuard permission="manage_students">
                <button
                  onClick={() => handleDeleteStudent(row)}
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
        title={editingStudent ? 'Chỉnh sửa học sinh' : 'Thêm học sinh mới'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã học sinh <span className="text-red-500">*</span>
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
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên phụ huynh <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contactInfo.parentName"
                value={formData.contactInfo.parentName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SĐT phụ huynh <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="contactInfo.phoneNumber"
                value={formData.contactInfo.phoneNumber}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email phụ huynh
              </label>
              <input
                type="email"
                name="contactInfo.email"
                value={formData.contactInfo.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lớp học
              </label>
              <select
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn lớp học</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái học tập
              </label>
              <select
                name="enrollmentInfo.status"
                value={formData.enrollmentInfo.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Chờ duyệt</option>
                <option value="active">Đang học</option>
                <option value="inactive">Tạm nghỉ</option>
              </select>
            </div>
          </div>
          
          {/* Address */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Địa chỉ</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số nhà, đường
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quận/Huyện
                </label>
                <input
                  type="text"
                  name="address.district"
                  value={formData.address.district}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thành phố
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tỉnh/Thành phố
                </label>
                <input
                  type="text"
                  name="address.province"
                  value={formData.address.province}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Therapy Status */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Thông tin can thiệp</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="therapyStatus.isInTherapy"
                  checked={formData.therapyStatus.isInTherapy}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Đang cần can thiệp
                </label>
              </div>
              
              {formData.therapyStatus.isInTherapy && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tình trạng/Chẩn đoán
                    </label>
                    <input
                      type="text"
                      name="therapyStatus.condition"
                      value={formData.therapyStatus.condition}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      name="therapyStatus.notes"
                      value={formData.therapyStatus.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
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
              {editingStudent ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Students
