import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchTeachers, 
  createTeacher, 
  updateTeacher, 
  deleteTeacher,
  selectTeachers,
  selectTeachersLoading,
  selectTeachersError,
  clearError
} from '../../store/teacherSlice'
import Table from '../../components/UI/Table'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import PermissionGuard, { usePermission } from '../../components/PermissionGuard'
import { 
  FiUserCheck, 
  FiUsers,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiHome,
  FiPause
} from 'react-icons/fi'

const Teachers = () => {
  const dispatch = useDispatch()
  const teachers = useSelector(selectTeachers)
  const isLoading = useSelector(selectTeachersLoading)
  const { hasPermission, isAdmin } = usePermission()

  // Kiểm tra quyền truy cập
  if (!hasPermission('manage_teachers')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <FiUserCheck className="mx-auto h-24 w-24 text-gray-400" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Không có quyền truy cập
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Bạn không có quyền quản lý giáo viên. Vui lòng liên hệ quản trị viên.
            </p>
          </div>
        </div>
      </div>
    )
  }
  const error = useSelector(selectTeachersError)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    specialization: '',
    contactInfo: {
      phoneNumber: '',
      email: '',
      address: ''
    },
    qualifications: [{ degree: '', institution: '', year: '' }],
    password: ''
  })

  // Fetch teachers on component mount
  useEffect(() => {
    dispatch(fetchTeachers())
  }, [dispatch])

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const columns = [
    {
      key: 'fullName',
      title: 'Họ và tên',
      render: (value, teacher) => (
        <div>
          <span className="font-medium">{value}</span>
          {teacher.userId && (
            <div className="text-xs text-gray-500">
              @{teacher.userId.username}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'contactInfo',
      title: 'Số điện thoại',
      render: (value) => value?.phoneNumber || 'Chưa có'
    },
    {
      key: 'contactInfoEmail',
      title: 'Email',
      render: (value, teacher) => teacher.contactInfo?.email || 'Chưa có'
    },
    {
      key: 'specialization',
      title: 'Chuyên môn'
    },
    {
      key: 'qualifications',
      title: 'Bằng cấp',
      render: (value) => {
        if (!value || value.length === 0) return 'Chưa có'
        return value.map(q => q.degree).join(', ')
      }
    },
    {
      key: 'assignedClasses',
      title: 'Lớp phụ trách',
      render: (value) => {
        if (!value || value.length === 0) {
          return (
            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Chưa có
            </span>
          )
        }
        return (
          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {value.length} lớp
          </span>
        )
      }
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      render: (value, teacher) => (
        <div>
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {value ? 'Đang làm việc' : 'Tạm nghỉ'}
          </span>
          {teacher.userId && (
            <div className="text-xs text-gray-500 mt-1">
              Tài khoản: {teacher.userId.isActive ? 'Hoạt động' : 'Khóa'}
            </div>
          )}
        </div>
      )
    }
  ]

  const handleAddTeacher = () => {
    setEditingTeacher(null)
    setFormData({
      fullName: '',
      specialization: '',
      contactInfo: {
        phoneNumber: '',
        email: '',
        address: ''
      },
      qualifications: [{ degree: '', institution: '', year: '' }],
      password: ''
    })
    setIsModalOpen(true)
  }

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher)
    setFormData({
      fullName: teacher.fullName || '',
      specialization: teacher.specialization || '',
      contactInfo: {
        phoneNumber: teacher.contactInfo?.phoneNumber || '',
        email: teacher.contactInfo?.email || '',
        address: teacher.contactInfo?.address || ''
      },
      qualifications: teacher.qualifications?.length > 0 
        ? teacher.qualifications 
        : [{ degree: '', institution: '', year: '' }],
      password: '' // Không hiển thị password cũ
    })
    setIsModalOpen(true)
  }

  const handleDeleteTeacher = async (teacher) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa giáo viên ${teacher.fullName}?`)) {
      try {
        await dispatch(deleteTeacher(teacher._id)).unwrap()
      } catch (error) {
        console.error('Error deleting teacher:', error)
        alert('Có lỗi xảy ra khi xóa giáo viên')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.fullName.trim()) {
      alert('Vui lòng nhập họ và tên')
      return
    }
    
    if (!formData.specialization) {
      alert('Vui lòng chọn chuyên môn')
      return
    }
    
    if (!formData.contactInfo.phoneNumber.trim()) {
      alert('Vui lòng nhập số điện thoại')
      return
    }
    
    if (!formData.contactInfo.email.trim()) {
      alert('Vui lòng nhập email')
      return
    }
    
    if (!editingTeacher && (!formData.password.trim() || formData.password.length < 6)) {
      alert('Vui lòng nhập mật khẩu (ít nhất 6 ký tự)')
      return
    }
    
    // Clean up qualifications - remove empty ones
    const cleanQualifications = formData.qualifications.filter(q => 
      q.degree.trim() !== '' || q.institution.trim() !== '' || q.year !== ''
    )
    
    const teacherData = {
      ...formData,
      qualifications: cleanQualifications,
      contactInfo: {
        ...formData.contactInfo,
        phoneNumber: formData.contactInfo.phoneNumber.trim(),
        email: formData.contactInfo.email.trim(),
        address: formData.contactInfo.address.trim()
      }
    }
    
    // Chỉ gửi password khi tạo mới
    if (!editingTeacher) {
      teacherData.password = formData.password.trim()
    }
    
    try {
      let result
      if (editingTeacher) {
        result = await dispatch(updateTeacher({ 
          id: editingTeacher._id, 
          ...teacherData 
        })).unwrap()
      } else {
        result = await dispatch(createTeacher(teacherData)).unwrap()
      }
      
      setIsModalOpen(false)
      
      // Hiển thị thông báo thành công
      alert(editingTeacher ? 'Cập nhật giáo viên thành công!' : 'Tạo giáo viên thành công!')
    } catch (error) {
      console.error('Error saving teacher:', error)
      let errorMessage = 'Có lỗi xảy ra khi lưu thông tin giáo viên'
      
      if (error.message) {
        if (error.message.includes('email')) {
          errorMessage = 'Email đã tồn tại trong hệ thống'
        } else if (error.message.includes('username')) {
          errorMessage = 'Tên người dùng đã tồn tại'
        } else {
          errorMessage = error.message
        }
      }
      
      alert(errorMessage)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleQualificationChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.map((qual, i) => 
        i === index ? { ...qual, [field]: value } : qual
      )
    }))
  }

  const addQualification = () => {
    setFormData(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, { degree: '', institution: '', year: '' }]
    }))
  }

  const removeQualification = (index) => {
    if (formData.qualifications.length > 1) {
      setFormData(prev => ({
        ...prev,
        qualifications: prev.qualifications.filter((_, i) => i !== index)
      }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Quản lý giáo viên' : 'Danh sách đồng nghiệp'}
          </h1>
          <p className="text-gray-600">
            {isAdmin 
              ? 'Quản lý thông tin và phân công giáo viên'
              : 'Xem thông tin đồng nghiệp và lịch làm việc'
            }
          </p>
        </div>
        {/* Chỉ admin mới có quyền thêm giáo viên */}
        <PermissionGuard requireAdmin={true}>
          <Button
            onClick={handleAddTeacher}
            icon={FiPlus}
          >
            Thêm giáo viên
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

      {/* Empty State */}
      {!isLoading && !error && teachers.length === 0 && (
        <div className="text-center py-12">
          <FiUserCheck className="w-24 h-24 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isAdmin ? 'Chưa có giáo viên nào' : 'Chưa có thông tin đồng nghiệp'}
          </h3>
          <p className="text-gray-600 mb-4">
            {isAdmin 
              ? 'Hãy thêm giáo viên đầu tiên để bắt đầu quản lý'
              : 'Chưa có thông tin về đồng nghiệp trong hệ thống'
            }
          </p>
          <PermissionGuard requireAdmin={true}>
            <Button onClick={handleAddTeacher} icon={FiPlus}>
              Thêm giáo viên đầu tiên
            </Button>
          </PermissionGuard>
        </div>
      )}

      {/* Stats */}
      {!isLoading && !error && teachers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <FiUserCheck className="w-6 h-6 mr-3 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Tổng giáo viên</p>
                <p className="text-xl font-bold">{teachers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
                <FiHome className="w-6 h-6 mr-3 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Có lớp phụ trách</p>
                <p className="text-xl font-bold">
                  {teachers.filter(t => t.assignedClasses && t.assignedClasses.length > 0).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <FiCheckCircle className="w-6 h-6 mr-3 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Có bằng cấp</p>
                <p className="text-xl font-bold">
                  {teachers.filter(t => t.qualifications && t.qualifications.length > 0).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <FiPause className="w-6 h-6 mr-3 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Đang làm việc</p>
                <p className="text-xl font-bold">
                  {teachers.filter(t => t.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && teachers.length > 0 && (
        <Table
          columns={columns}
          data={teachers}
          actions={(row) => (
            <div className="flex justify-end space-x-2 items-center">
              {/* Staff có thể xem thông tin, chỉ admin mới edit được */}
              <PermissionGuard requireAdmin={true}>
                <button
                  onClick={() => handleEditTeacher(row)}
                  className="text-blue-600 hover:text-blue-900 p-1"
                  title="Chỉnh sửa"
                >
                  <FiEdit className="w-5 h-5" />
                </button>
              </PermissionGuard>
              {/* Chỉ admin mới có quyền xóa */}
              <PermissionGuard requireAdmin={true}>
                <button
                  onClick={() => handleDeleteTeacher(row)}
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
        title={editingTeacher ? 'Chỉnh sửa giáo viên' : 'Thêm giáo viên mới'}
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
                Chuyên môn <span className="text-red-500">*</span>
              </label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn chuyên môn</option>
                <option value="Giáo dục mầm non">Giáo dục mầm non</option>
                <option value="Trị liệu ngôn ngữ">Trị liệu ngôn ngữ</option>
                <option value="Trị liệu vận động">Trị liệu vận động</option>
                <option value="Giáo dục thể chất">Giáo dục thể chất</option>
                <option value="Giáo dục âm nhạc">Giáo dục âm nhạc</option>
                <option value="Giáo dục mỹ thuật">Giáo dục mỹ thuật</option>
                <option value="Tâm lý học">Tâm lý học</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="contactInfo.phoneNumber"
                value={formData.contactInfo.phoneNumber}
                onChange={handleInputChange}
                required
                pattern="[0-9]{10,15}"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="contactInfo.email"
                value={formData.contactInfo.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {!editingTeacher && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu đăng nhập <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  placeholder="Nhập mật khẩu đăng nhập (ít nhất 6 ký tự)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mật khẩu này sẽ được sử dụng để đăng nhập vào hệ thống
                </p>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ
            </label>
            <input
              type="text"
              name="contactInfo.address"
              value={formData.contactInfo.address}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Địa chỉ liên hệ"
            />
          </div>

          {/* Qualifications */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Bằng cấp
              </label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addQualification}
                icon={FiPlus}
              >
                Thêm bằng cấp
              </Button>
            </div>
            
            {formData.qualifications.map((qualification, index) => (
              <div key={`qualification-${index}-${qualification.degree || 'new'}`} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3 p-3 border border-gray-200 rounded-lg">
                <input
                  type="text"
                  placeholder="Tên bằng cấp"
                  value={qualification.degree}
                  onChange={(e) => handleQualificationChange(index, 'degree', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Trường đào tạo"
                  value={qualification.institution}
                  onChange={(e) => handleQualificationChange(index, 'institution', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Năm"
                  value={qualification.year}
                  onChange={(e) => handleQualificationChange(index, 'year', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.qualifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQualification(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Xóa
                  </button>
                )}
              </div>
            ))}
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
              {editingTeacher ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Teachers
