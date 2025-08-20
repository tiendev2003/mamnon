import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchOverviewReport,
  fetchStudentReport,
  fetchTeacherReport,
  fetchTherapyReport,
  fetchClassReport,
  clearError
} from '../../store/reportSlice'
import Button from '../../components/UI/Button'
import StatsCard from '../../components/UI/StatsCard'
import Table from '../../components/UI/Table'
import { 
  FiUsers, 
  FiUserCheck, 
  FiHome, 
  FiHeart, 
  FiFileText,
  FiBarChart2,
  FiCheckCircle,
  FiDownload
} from 'react-icons/fi'

const Reports = () => {
  const dispatch = useDispatch()
  const { 
    overviewReport,
    studentReport, 
    teacherReport,
    therapyReport,
    classReport,
    isLoading,
    error 
  } = useSelector((state) => state.reports)

  const [activeTab, setActiveTab] = useState('overview')
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    classId: '',
    teacherId: '',
    studentId: ''
  })

  // Set default date range (last 30 days)
  useEffect(() => {
    const today = new Date()
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    setFilters(prev => ({
      ...prev,
      startDate: lastMonth.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    }))
  }, [])

  // Load initial data
  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      handleGenerateReport()
    }
  }, [filters.startDate, filters.endDate])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleGenerateReport = () => {
    const filterParams = {
      startDate: filters.startDate,
      endDate: filters.endDate
    }

    switch (activeTab) {
      case 'overview':
        dispatch(fetchOverviewReport(filterParams))
        break
      case 'students':
        dispatch(fetchStudentReport({
          ...filterParams,
          status: filters.status,
          classId: filters.classId
        }))
        break
      case 'teachers':
        dispatch(fetchTeacherReport({
          ...filterParams,
          teacherId: filters.teacherId
        }))
        break
      case 'therapy':
        dispatch(fetchTherapyReport({
          ...filterParams,
          status: filters.status,
          teacherId: filters.teacherId,
          studentId: filters.studentId
        }))
        break
      case 'classes':
        dispatch(fetchClassReport({
          ...filterParams,
          status: filters.status
        }))
        break
    }
  }

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: FiBarChart2 },
    { id: 'students', label: 'Học sinh', icon: FiUsers },
    { id: 'teachers', label: 'Giáo viên', icon: FiUserCheck },
    { id: 'therapy', label: 'Trị liệu', icon: FiHeart },
    { id: 'classes', label: 'Lớp học', icon: FiHome }
  ]

  const renderOverviewReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Tổng học sinh"
          value={overviewReport.totalStudents}
          icon={FiUsers}
          color="blue"
          trend={{ value: `${overviewReport.activeStudents} đang học`, isPositive: true }}
          isLoading={isLoading.overview}
        />
        <StatsCard
          title="Tổng giáo viên"
          value={overviewReport.totalTeachers}
          icon={FiUserCheck}
          color="green"
          isLoading={isLoading.overview}
        />
        <StatsCard
          title="Tổng lớp học"
          value={overviewReport.totalClasses}
          icon={FiHome}
          color="purple"
          isLoading={isLoading.overview}
        />
        <StatsCard
          title="Buổi trị liệu"
          value={overviewReport.totalTherapySessions}
          icon={FiHeart}
          color="yellow"
          trend={{ 
            value: `${overviewReport.therapySuccessRate}% thành công`, 
            isPositive: overviewReport.therapySuccessRate > 80 
          }}
          isLoading={isLoading.overview}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê trị liệu</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tổng buổi trị liệu:</span>
              <span className="font-semibold">{overviewReport.totalTherapySessions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Hoàn thành:</span>
              <span className="font-semibold text-green-600">{overviewReport.completedTherapySessions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Đã hủy:</span>
              <span className="font-semibold text-red-600">{overviewReport.cancelledTherapySessions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tỷ lệ thành công:</span>
              <span className="font-semibold text-blue-600">{overviewReport.therapySuccessRate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khoảng thời gian</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Từ ngày:</span>
              <span className="font-semibold">
                {overviewReport.period?.startDate 
                  ? new Date(overviewReport.period.startDate).toLocaleDateString('vi-VN')
                  : 'N/A'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Đến ngày:</span>
              <span className="font-semibold">
                {overviewReport.period?.endDate 
                  ? new Date(overviewReport.period.endDate).toLocaleDateString('vi-VN')
                  : 'N/A'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tỷ lệ hủy:</span>
              <span className="font-semibold text-orange-600">{overviewReport.therapyCancellationRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStudentReport = () => {
    const columns = [
      {
        key: 'fullName',
        title: 'Họ tên',
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'class',
        title: 'Lớp',
        render: (value) => value?.name || 'Chưa phân lớp'
      },
      {
        key: 'status',
        title: 'Trạng thái',
        render: (value) => (
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
            value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {value === 'active' ? 'Đang học' : 'Nghỉ học'}
          </span>
        )
      },
      {
        key: 'dateOfBirth',
        title: 'Ngày sinh',
        render: (value) => new Date(value).toLocaleDateString('vi-VN')
      },
      {
        key: 'createdAt',
        title: 'Ngày nhập học',
        render: (value) => new Date(value).toLocaleDateString('vi-VN')
      }
    ]

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Tổng học sinh"
            value={studentReport.statistics?.total || 0}
            icon={FiUsers}
            color="blue"
            isLoading={isLoading.student}
          />
          <StatsCard
            title="Theo lớp"
            value={studentReport.statistics?.byClass?.length || 0}
            icon={FiHome}
            color="green"
            isLoading={isLoading.student}
          />
          <StatsCard
            title="Đang học"
            value={studentReport.statistics?.byStatus?.find(s => s._id === 'active')?.count || 0}
            icon={FiCheckCircle}
            color="purple"
            isLoading={isLoading.student}
          />
        </div>

        {/* Additional filters for students */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả</option>
                <option value="active">Đang học</option>
                <option value="inactive">Nghỉ học</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lớp học
              </label>
              <select
                name="classId"
                value={filters.classId}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả lớp</option>
                {/* TODO: Load classes from API */}
              </select>
            </div>
          </div>
        </div>

        <Table
          columns={columns}
          data={studentReport.students || []}
          isLoading={isLoading.student}
        />
      </div>
    )
  }

  const renderTeacherReport = () => {
    const columns = [
      {
        key: 'fullName',
        title: 'Họ tên',
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'specialization',
        title: 'Chuyên môn'
      },
      {
        key: 'totalSessions',
        title: 'Tổng buổi trị liệu',
        render: (value) => <span className="font-semibold">{value}</span>
      },
      {
        key: 'completedSessions',
        title: 'Hoàn thành',
        render: (value) => <span className="text-green-600 font-semibold">{value}</span>
      },
      {
        key: 'successRate',
        title: 'Tỷ lệ thành công',
        render: (value) => (
          <span className={`font-semibold ${value >= 80 ? 'text-green-600' : value >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
            {value?.toFixed(1)}%
          </span>
        )
      }
    ]

    return (
      <div className="space-y-6">
        <Table
          columns={columns}
          data={teacherReport.teachers || []}
          isLoading={isLoading.teacher}
        />
      </div>
    )
  }

  const renderTherapyReport = () => {
    const columns = [
      {
        key: 'student',
        title: 'Học sinh',
        render: (value) => <span className="font-medium">{value?.fullName || 'N/A'}</span>
      },
      {
        key: 'teacher',
        title: 'Giáo viên',
        render: (value) => value?.fullName || 'N/A'
      },
      {
        key: 'sessionDate',
        title: 'Ngày trị liệu',
        render: (value) => new Date(value).toLocaleDateString('vi-VN')
      },
      {
        key: 'status',
        title: 'Trạng thái',
        render: (value) => {
          const statusLabels = {
            scheduled: 'Đã lên lịch',
            completed: 'Hoàn thành',
            cancelled: 'Đã hủy',
            no_show: 'Vắng mặt'
          }
          const statusColors = {
            scheduled: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            no_show: 'bg-yellow-100 text-yellow-800'
          }
          return (
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[value]}`}>
              {statusLabels[value] || value}
            </span>
          )
        }
      },
      {
        key: 'duration',
        title: 'Thời gian',
        render: (value) => `${value} phút`
      }
    ]

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Tổng buổi"
            value={therapyReport.statistics?.total || 0}
            icon={FiHeart}
            color="blue"
            isLoading={isLoading.therapy}
          />
          <StatsCard
            title="Hoàn thành"
            value={therapyReport.statistics?.byStatus?.find(s => s._id === 'completed')?.count || 0}
            icon={FiCheckCircle}
            color="green"
            isLoading={isLoading.therapy}
          />
          <StatsCard
            title="Đã hủy"
            value={therapyReport.statistics?.byStatus?.find(s => s._id === 'cancelled')?.count || 0}
            icon={FiFileText}
            color="red"
            isLoading={isLoading.therapy}
          />
          <StatsCard
            title="Vắng mặt"
            value={therapyReport.statistics?.byStatus?.find(s => s._id === 'no_show')?.count || 0}
            icon={FiFileText}
            color="yellow"
            isLoading={isLoading.therapy}
          />
        </div>

        <Table
          columns={columns}
          data={therapyReport.sessions || []}
          isLoading={isLoading.therapy}
        />
      </div>
    )
  }

  const renderClassReport = () => {
    const columns = [
      {
        key: 'name',
        title: 'Tên lớp',
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'teacherName',
        title: 'Giáo viên chủ nhiệm',
        render: (value) => value || 'Chưa phân công'
      },
      {
        key: 'totalStudents',
        title: 'Số học sinh',
        render: (value) => <span className="font-semibold">{value}</span>
      },
      {
        key: 'capacity',
        title: 'Sức chứa',
        render: (value) => <span className="text-gray-600">{value}</span>
      },
      {
        key: 'occupancyRate',
        title: 'Tỷ lệ lấp đầy',
        render: (value) => (
          <span className={`font-semibold ${value >= 80 ? 'text-red-600' : value >= 60 ? 'text-yellow-600' : 'text-green-600'}`}>
            {value?.toFixed(1)}%
          </span>
        )
      },
      {
        key: 'status',
        title: 'Trạng thái',
        render: (value) => (
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
            value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {value === 'active' ? 'Hoạt động' : 'Tạm dừng'}
          </span>
        )
      }
    ]

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Tổng lớp học"
            value={classReport.statistics?.totalClasses || 0}
            icon={FiHome}
            color="blue"
            isLoading={isLoading.class}
          />
          <StatsCard
            title="Tổng học sinh"
            value={classReport.statistics?.totalStudents || 0}
            icon={FiUsers}
            color="green"
            isLoading={isLoading.class}
          />
          <StatsCard
            title="Trung bình/lớp"
            value={classReport.statistics?.averageClassSize || 0}
            icon={FiBarChart2}
            color="purple"
            isLoading={isLoading.class}
          />
        </div>

        <Table
          columns={columns}
          data={classReport.classes || []}
          isLoading={isLoading.class}
        />
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewReport()
      case 'students':
        return renderStudentReport()
      case 'teachers':
        return renderTeacherReport()
      case 'therapy':
        return renderTherapyReport()
      case 'classes':
        return renderClassReport()
      default:
        return renderOverviewReport()
    }
  }

  return (
    <div className="space-y-6">
      

      {/* Date Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Từ ngày
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đến ngày
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <Button
              onClick={handleGenerateReport}
              disabled={!filters.startDate || !filters.endDate}
              className="w-full"
              icon={FiBarChart2}
            >
              Tạo báo cáo
            </Button>
          </div>
        </div>
      </div>

      {/* Error */}
      {Object.values(error).some(err => err) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Có lỗi xảy ra khi tải báo cáo. Vui lòng thử lại.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
        
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

export default Reports
