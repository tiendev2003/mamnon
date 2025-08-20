import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchSchedules, 
  fetchSchedulesByDate,
  createSchedule, 
  updateSchedule, 
  deleteSchedule,
  selectSchedules,
  selectCurrentWeekSchedules,
  selectSchedulesLoading,
  selectSchedulesError,
  clearError
} from '../../store/scheduleSlice'
import { fetchTeachers, selectTeachers } from '../../store/teacherSlice'
import { fetchClasses, selectClasses } from '../../store/classSlice'
import Table from '../../components/UI/Table'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import { 
  FiCalendar, 
  FiPlus, 
  FiClock,
  FiGrid,
  FiList
} from 'react-icons/fi'

const Schedules = () => {
  const dispatch = useDispatch()
  const schedules = useSelector(selectSchedules)
  const weekSchedules = useSelector(selectCurrentWeekSchedules)
  const teachers = useSelector(selectTeachers)
  const classes = useSelector(selectClasses)
  const isLoading = useSelector(selectSchedulesLoading)
  const error = useSelector(selectSchedulesError)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [formData, setFormData] = useState({
    teacher: '',
    date: '',
    slots: [{
      startTime: '',
      endTime: '',
      activity: 'class',
      relatedTo: '',
      refModel: '',
      notes: ''
    }],
    isHoliday: false,
    holidayReason: ''
  })

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchSchedules())
    dispatch(fetchTeachers())
    dispatch(fetchClasses())
  }, [dispatch])

    // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const columns = [
    {
      key: 'teacher',
      title: 'Giáo viên',
      render: (value) => (
        <span className="font-medium">
          {value?.fullName || 'Chưa có thông tin'}
        </span>
      )
    },
    {
      key: 'date',
      title: 'Ngày',
      render: (value) => new Date(value).toLocaleDateString('vi-VN')
    },
    {
      key: 'slots',
      title: 'Số ca làm việc',
      render: (value) => (
        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value?.length || 0} ca
        </span>
      )
    },
    {
      key: 'slotsTime',
      title: 'Thời gian',
      render: (value, row) => {
        const slots = row.slots
        if (!slots || slots.length === 0) return 'Chưa có ca'
        const firstSlot = slots[0]
        const lastSlot = slots[slots.length - 1]
        return `${firstSlot.startTime} - ${lastSlot.endTime}`
      }
    },
    {
      key: 'isHoliday',
      title: 'Trạng thái',
      render: (value, row) => (
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {value ? `Nghỉ: ${row.holidayReason}` : 'Làm việc'}
        </span>
      )
    }
  ]

  const handleAddSchedule = () => {
    setEditingSchedule(null)
    setFormData({
      teacher: '',
      date: selectedDate,
      slots: [{
        startTime: '08:00',
        endTime: '12:00',
        activity: 'class',
        relatedTo: '',
        refModel: '',
        notes: ''
      }],
      isHoliday: false,
      holidayReason: ''
    })
    setIsModalOpen(true)
  }

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule)
    setFormData({
      teacher: schedule.teacher?._id || '',
      date: new Date(schedule.date).toISOString().split('T')[0],
      slots: schedule.slots?.length > 0 ? schedule.slots : [{
        startTime: '08:00',
        endTime: '12:00',
        activity: 'class',
        relatedTo: '',
        refModel: '',
        notes: ''
      }],
      isHoliday: schedule.isHoliday || false,
      holidayReason: schedule.holidayReason || ''
    })
    setIsModalOpen(true)
  }

  const handleDeleteSchedule = async (schedule) => {
    const teacherName = schedule.teacher?.fullName || 'N/A'
    const scheduleDate = new Date(schedule.date).toLocaleDateString('vi-VN')
    if (window.confirm(`Bạn có chắc chắn muốn xóa lịch làm việc của ${teacherName} ngày ${scheduleDate}?`)) {
      try {
        await dispatch(deleteSchedule(schedule._id)).unwrap()
      } catch (error) {
        console.error('Error deleting schedule:', error)
        alert('Có lỗi xảy ra khi xóa lịch làm việc')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate slots
    const validSlots = formData.slots.filter(slot => 
      slot.startTime && slot.endTime && slot.activity
    )
    
    if (validSlots.length === 0 && !formData.isHoliday) {
      alert('Vui lòng thêm ít nhất một ca làm việc hoặc đánh dấu là ngày nghỉ')
      return
    }
    
    const scheduleData = {
      ...formData,
      slots: validSlots.map(slot => ({
        ...slot,
        relatedTo: slot.relatedTo || undefined,
        refModel: slot.relatedTo ? slot.refModel : undefined
      }))
    }
    
    try {
      if (editingSchedule) {
        await dispatch(updateSchedule({ 
          id: editingSchedule._id, 
          ...scheduleData 
        })).unwrap()
      } else {
        await dispatch(createSchedule(scheduleData)).unwrap()
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving schedule:', error)
      alert('Có lỗi xảy ra khi lưu lịch làm việc')
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSlotChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      slots: prev.slots.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }))
  }

  const addSlot = () => {
    setFormData(prev => ({
      ...prev,
      slots: [...prev.slots, {
        startTime: '',
        endTime: '',
        activity: 'class',
        relatedTo: '',
        refModel: '',
        notes: ''
      }]
    }))
  }

  const removeSlot = (index) => {
    if (formData.slots.length > 1) {
      setFormData(prev => ({
        ...prev,
        slots: prev.slots.filter((_, i) => i !== index)
      }))
    }
  }

  const loadWeekSchedules = () => {
    const currentDate = new Date(selectedDate)
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    dispatch(fetchSchedulesByDate({
      startDate: startOfWeek.toISOString().split('T')[0],
      endDate: endOfWeek.toISOString().split('T')[0]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
             </div>
        <div className="flex space-x-3">
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            onClick={() => setViewMode('list')}
            icon={FiList}
          >
            Danh sách
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'primary' : 'outline'}
            onClick={() => setViewMode('calendar')}
            icon={FiCalendar}
          >
            Lịch tuần
          </Button>
          <Button
            onClick={handleAddSchedule}
            icon={FiPlus}
          >
            Tạo lịch mới
          </Button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chọn ngày
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {viewMode === 'calendar' && (
            <Button onClick={loadWeekSchedules}>
              Tải lịch tuần
            </Button>
          )}
        </div>
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
      {!isLoading && !error && schedules.length === 0 && viewMode === 'list' && (
        <div className="text-center py-12">
          <FiCalendar className="w-24 h-24 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lịch làm việc nào</h3>
          <p className="text-gray-600 mb-4">Hãy tạo lịch làm việc đầu tiên cho giáo viên</p>
          <Button onClick={handleAddSchedule} icon={FiPlus}>
            Tạo lịch đầu tiên
          </Button>
        </div>
      )}

      {/* Stats */}
      {!isLoading && !error && schedules.length > 0 && viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <FiCalendar className="w-6 h-6 mr-3 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Tổng lịch</p>
                <p className="text-xl font-bold">{schedules.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <span className="text-2xl mr-3">👩‍🏫</span>
              <div>
                <p className="text-sm text-gray-600">Giáo viên có lịch</p>
                <p className="text-xl font-bold">
                  {new Set(schedules.map(s => s.teacher?._id)).size}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⏰</span>
              <div>
                <p className="text-sm text-gray-600">Tổng ca làm việc</p>
                <p className="text-xl font-bold">
                  {schedules.reduce((sum, s) => sum + (s.slots?.length || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🏖️</span>
              <div>
                <p className="text-sm text-gray-600">Ngày nghỉ</p>
                <p className="text-xl font-bold">
                  {schedules.filter(s => s.isHoliday).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {!isLoading && !error && schedules.length > 0 && viewMode === 'list' && (
        <Table
          columns={columns}
          data={schedules}
          onEdit={handleEditSchedule}
          onDelete={handleDeleteSchedule}
        />
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center py-20">
            <FiCalendar className="w-24 h-24 mx-auto text-gray-400" />
            <h2 className="text-2xl font-bold mt-4">Xem lịch theo tuần</h2>
            <p className="text-gray-600 mt-2">Chọn ngày và nhấn "Tải lịch tuần" để xem lịch làm việc theo tuần</p>
            {weekSchedules.length > 0 && (
              <div className="mt-6">
                <p className="text-green-600 font-medium">
                  Đã tải {weekSchedules.length} lịch làm việc trong tuần
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSchedule ? 'Chỉnh sửa lịch làm việc' : 'Tạo lịch làm việc mới'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giáo viên <span className="text-red-500">*</span>
              </label>
              <select
                name="teacher"
                value={formData.teacher}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn giáo viên</option>
                {teachers.map(teacher => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.fullName} - {teacher.specialization}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Holiday checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isHoliday"
              name="isHoliday"
              checked={formData.isHoliday}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isHoliday" className="text-sm font-medium text-gray-700">
              Đây là ngày nghỉ
            </label>
          </div>

          {/* Holiday reason */}
          {formData.isHoliday && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lý do nghỉ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="holidayReason"
                value={formData.holidayReason}
                onChange={handleInputChange}
                required={formData.isHoliday}
                placeholder="Nghỉ lễ, nghỉ phép, v.v."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Work slots */}
          {!formData.isHoliday && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Ca làm việc
                </label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addSlot}
                  icon={FiPlus}
                >
                  Thêm ca
                </Button>
              </div>
              
              {formData.slots.map((slot, index) => (
                <div key={`slot-${index}-${slot.startTime}-${slot.endTime}`} className="p-4 border border-gray-200 rounded-lg mb-3">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Giờ bắt đầu
                      </label>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Giờ kết thúc
                      </label>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Hoạt động
                      </label>
                      <select
                        value={slot.activity}
                        onChange={(e) => handleSlotChange(index, 'activity', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="class">Dạy học</option>
                        <option value="therapy">Trị liệu</option>
                        <option value="break">Nghỉ giải lao</option>
                        <option value="meeting">Họp</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Liên quan đến
                      </label>
                      <select
                        value={slot.relatedTo}
                        onChange={(e) => {
                          const value = e.target.value
                          handleSlotChange(index, 'relatedTo', value)
                          // Auto set refModel based on activity
                          if (value) {
                            const refModel = slot.activity === 'class' ? 'Class' : 'TherapySession'
                            handleSlotChange(index, 'refModel', refModel)
                          } else {
                            handleSlotChange(index, 'refModel', '')
                          }
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="">Không liên quan</option>
                        {slot.activity === 'class' && classes.map(cls => (
                          <option key={cls._id} value={cls._id}>
                            {cls.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      {formData.slots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSlot(index)}
                          className="text-red-600 hover:text-red-800 text-sm px-2 py-1"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Ghi chú
                    </label>
                    <input
                      type="text"
                      value={slot.notes}
                      onChange={(e) => handleSlotChange(index, 'notes', e.target.value)}
                      placeholder="Ghi chú thêm về ca làm việc..."
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              ))}
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
              {editingSchedule ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Schedules
