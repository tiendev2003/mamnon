import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchTherapySessions, 
  createTherapySession, 
  updateTherapySession, 
  deleteTherapySession,
  selectTherapySessions,
  selectTherapySessionsLoading,
  selectTherapySessionsError,
  clearError
} from '../../store/therapySlice'
import { fetchStudents, selectStudents } from '../../store/studentSlice'
import { fetchTeachers, selectTeachers } from '../../store/teacherSlice'
import Table from '../../components/UI/Table'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import { 
  FiHeart, 
  FiCalendar, 
  FiCheckCircle,
  FiPlus,
  FiEdit,
  FiTrash2
} from 'react-icons/fi'

const TherapySessions = () => {
  const dispatch = useDispatch()
  const sessions = useSelector(selectTherapySessions)
  const students = useSelector(selectStudents)
  const teachers = useSelector(selectTeachers)
  const isLoading = useSelector(selectTherapySessionsLoading)
  const error = useSelector(selectTherapySessionsError)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [formData, setFormData] = useState({
    student: '',
    therapist: '',
    dateTime: '',
    duration: 60,
    type: '',
    status: 'scheduled',
    notes: {
      beforeSession: '',
      duringSession: '',
      followUp: ''
    },
    progress: {
      rating: '',
      comments: ''
    }
  })

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchTherapySessions())
    dispatch(fetchStudents())
    dispatch(fetchTeachers())
  }, [dispatch])

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  // Get therapists (teachers with therapy specialization)
  const therapists = teachers.filter(teacher => 
    teacher.specialization && 
    (teacher.specialization.includes('trị liệu') || 
     teacher.specialization.includes('Trị liệu') ||
     teacher.specialization.includes('therapy'))
  )

  const columns = [
    {
      key: 'student',
      title: 'Học sinh',
      render: (value) => (
        <span className="font-medium">
          {value?.fullName || 'Chưa có thông tin'}
        </span>
      )
    },
    {
      key: 'therapist',
      title: 'Chuyên gia trị liệu',
      render: (value) => (
        <span className="font-medium">
          {value?.fullName || 'Chưa có thông tin'}
        </span>
      )
    },
    {
      key: 'dateTime',
      title: 'Ngày & Giờ',
      render: (value) => new Date(value).toLocaleString('vi-VN')
    },
    {
      key: 'duration',
      title: 'Thời lượng',
      render: (value) => `${value} phút`
    },
    {
      key: 'type',
      title: 'Loại trị liệu'
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (value) => {
        const statusConfig = {
          scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đã lên lịch' },
          completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Hoàn thành' },
          cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' }
        }
        const config = statusConfig[value] || statusConfig.scheduled
        return (
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        )
      }
    },
    {
      key: 'progress',
      title: 'Đánh giá',
      render: (value) => {
        if (!value?.rating) return 'Chưa đánh giá'
        return (
          <div className="flex items-center">
            <span className="text-yellow-500">{'★'.repeat(value.rating)}</span>
            <span className="text-gray-300">{'★'.repeat(5 - value.rating)}</span>
            <span className="ml-1 text-sm text-gray-600">({value.rating}/5)</span>
          </div>
        )
      }
    }
  ]

  const handleAddSession = () => {
    setEditingSession(null)
    setFormData({
      student: '',
      therapist: '',
      dateTime: '',
      duration: 60,
      type: '',
      status: 'scheduled',
      notes: {
        beforeSession: '',
        duringSession: '',
        followUp: ''
      },
      progress: {
        rating: '',
        comments: ''
      }
    })
    setIsModalOpen(true)
  }

  const handleEditSession = (session) => {
    setEditingSession(session)
    setFormData({
      student: session.student?._id || '',
      therapist: session.therapist?._id || '',
      dateTime: new Date(session.dateTime).toISOString().slice(0, 16),
      duration: session.duration || 60,
      type: session.type || '',
      status: session.status || 'scheduled',
      notes: {
        beforeSession: session.notes?.beforeSession || '',
        duringSession: session.notes?.duringSession || '',
        followUp: session.notes?.followUp || ''
      },
      progress: {
        rating: session.progress?.rating || '',
        comments: session.progress?.comments || ''
      }
    })
    setIsModalOpen(true)
  }

  const handleDeleteSession = async (session) => {
    const studentName = session.student?.fullName || 'N/A'
    const sessionDate = new Date(session.dateTime).toLocaleString('vi-VN')
    if (window.confirm(`Bạn có chắc chắn muốn xóa ca trị liệu của ${studentName} lúc ${sessionDate}?`)) {
      try {
        await dispatch(deleteTherapySession(session._id)).unwrap()
      } catch (error) {
        console.error('Error deleting therapy session:', error)
        alert('Có lỗi xảy ra khi xóa ca trị liệu')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const sessionData = {
      ...formData,
      duration: parseInt(formData.duration),
      progress: {
        ...formData.progress,
        rating: formData.progress.rating ? parseInt(formData.progress.rating) : undefined
      }
    }
    
    try {
      if (editingSession) {
        await dispatch(updateTherapySession({ 
          id: editingSession._id, 
          ...sessionData 
        })).unwrap()
      } else {
        await dispatch(createTherapySession(sessionData)).unwrap()
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving therapy session:', error)
      alert('Có lỗi xảy ra khi lưu thông tin ca trị liệu')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('notes.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        notes: {
          ...prev.notes,
          [field]: value
        }
      }))
    } else if (name.startsWith('progress.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
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

  // Calculate stats
  const todayCount = (sessions || []).filter(s => {
    const sessionDate = new Date(s.dateTime).toDateString()
    const today = new Date().toDateString()
    return sessionDate === today
  }).length

  const completedCount = (sessions || []).filter(s => s.status === 'completed').length
  const scheduledCount = (sessions || []).filter(s => s.status === 'scheduled').length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
         </div>
        <Button onClick={handleAddSession}   icon={FiPlus}>

          Đặt lịch trị liệu
        </Button>
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
      {!isLoading && !error && (!sessions || sessions.length === 0) && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có ca trị liệu nào</h3>
          <p className="text-gray-600 mb-4">Hãy đặt lịch ca trị liệu đầu tiên cho học sinh</p>
          <Button onClick={handleAddSession}   icon={FiPlus}>
            Đặt lịch đầu tiên
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      {!isLoading && !error && sessions && sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tổng ca trị liệu</p>
                <p className="text-2xl font-bold text-gray-900">{sessions ? sessions.length : 0}</p>
              </div>
              <span className="text-3xl">🏥</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Hôm nay</p>
                <p className="text-2xl font-bold text-blue-600">{todayCount}</p>
              </div>
              <span className="text-3xl">📅</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Đã hoàn thành</p>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              </div>
              <span className="text-3xl">✅</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Chờ xử lý</p>
                <p className="text-2xl font-bold text-orange-600">{scheduledCount}</p>
              </div>
              <span className="text-3xl">⏳</span>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && sessions && sessions.length > 0 && (
        <Table
          columns={columns}
          data={sessions}
          onEdit={handleEditSession}
          onDelete={handleDeleteSession}
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSession ? 'Chỉnh sửa ca trị liệu' : 'Đặt lịch trị liệu mới'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Học sinh <span className="text-red-500">*</span>
              </label>
              <select
                name="student"
                value={formData.student}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn học sinh</option>
                {students.map(student => (
                  <option key={student._id} value={student._id}>
                    {student.fullName} - {student.dateOfBirth ? new Date(student.dateOfBirth).getFullYear() : 'N/A'}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chuyên gia trị liệu <span className="text-red-500">*</span>
              </label>
              <select
                name="therapist"
                value={formData.therapist}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn chuyên gia</option>
                {therapists.map(therapist => (
                  <option key={therapist._id} value={therapist._id}>
                    {therapist.fullName} - {therapist.specialization}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày & Giờ <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời lượng (phút) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                required
                min="15"
                max="180"
                step="15"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại trị liệu <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn loại trị liệu</option>
                <option value="Trị liệu ngôn ngữ">Trị liệu ngôn ngữ</option>
                <option value="Trị liệu vận động">Trị liệu vận động</option>
                <option value="Trị liệu hành vi">Trị liệu hành vi</option>
                <option value="Trị liệu cảm giác">Trị liệu cảm giác</option>
                <option value="Trị liệu nghề nghiệp">Trị liệu nghề nghiệp</option>
                <option value="Trị liệu âm nhạc">Trị liệu âm nhạc</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="scheduled">Đã lên lịch</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Ghi chú</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú trước buổi trị liệu
              </label>
              <textarea
                name="notes.beforeSession"
                value={formData.notes.beforeSession}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mục tiêu, kế hoạch cho buổi trị liệu..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú trong buổi trị liệu
              </label>
              <textarea
                name="notes.duringSession"
                value={formData.notes.duringSession}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Những gì đã thực hiện, phản ứng của học sinh..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú theo dõi
              </label>
              <textarea
                name="notes.followUp"
                value={formData.notes.followUp}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Khuyến nghị cho buổi tới, bài tập về nhà..."
              />
            </div>
          </div>

          {/* Progress Section */}
          {(formData.status === 'completed' || editingSession?.status === 'completed') && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Đánh giá tiến độ</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đánh giá (1-5 sao)
                  </label>
                  <select
                    name="progress.rating"
                    value={formData.progress.rating}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Chọn đánh giá</option>
                    <option value="1">1 sao - Kém</option>
                    <option value="2">2 sao - Yếu</option>
                    <option value="3">3 sao - Trung bình</option>
                    <option value="4">4 sao - Tốt</option>
                    <option value="5">5 sao - Xuất sắc</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhận xét tiến độ
                </label>
                <textarea
                  name="progress.comments"
                  value={formData.progress.comments}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Đánh giá chi tiết về tiến độ của học sinh..."
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              type="button"
            >
              Hủy
            </Button>
            <Button type="submit">
              {editingSession ? 'Cập nhật' : 'Đặt lịch'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default TherapySessions
