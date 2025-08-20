const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const TherapySession = require('../models/TherapySession');
const User = require('../models/User');
const Schedule = require('../models/Schedule');

// Lấy thống kê tổng quan
exports.getOverviewStats = async (req, res) => {
  try {
    let statsData = {};

    if (req.user.role === 'admin') {
      // Admin thấy tất cả thống kê
      const [
        totalStudents,
        totalTeachers,
        totalClasses,
        totalUsers,
        activeStudents,
        activeClasses,
        todayTherapySessions,
        pendingTherapySessions
      ] = await Promise.all([
        Student.countDocuments(),
        Teacher.countDocuments(),
        Class.countDocuments(),
        User.countDocuments(),
        Student.countDocuments({ 'enrollmentInfo.status': 'active' }),
        Class.countDocuments({ isActive: true }),
        TherapySession.countDocuments({
          sessionDate: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lte: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }),
        TherapySession.countDocuments({ status: 'pending' })
      ]);

      statsData = {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalUsers,
        activeStudents,
        activeClasses,
        todayTherapySessions,
        pendingTherapySessions
      };
    } else if (req.user.role === 'staff') {
      // Staff chỉ thấy thống kê của lớp họ phụ trách
      const teacher = await Teacher.findOne({ userId: req.user.id }).populate('assignedClasses');
      
      if (teacher && teacher.assignedClasses.length > 0) {
        const classIds = teacher.assignedClasses.map(cls => cls._id);
        
        const [
          myStudents,
          activeStudents,
          activeClasses,
          myTodayTherapySessions
        ] = await Promise.all([
          Student.countDocuments({ class: { $in: classIds } }),
          Student.countDocuments({ 
            class: { $in: classIds }, 
            'enrollmentInfo.status': 'active' 
          }),
          Class.countDocuments({ 
            _id: { $in: classIds }, 
            isActive: true 
          }),
          TherapySession.countDocuments({
            class: { $in: classIds },
            sessionDate: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)),
              $lte: new Date(new Date().setHours(23, 59, 59, 999))
            }
          })
        ]);

        statsData = {
          totalStudents: myStudents,
          totalTeachers: 0,
          totalClasses: classIds.length,
          totalUsers: 0,
          activeStudents,
          activeClasses,
          todayTherapySessions: myTodayTherapySessions,
          pendingTherapySessions: 0
        };
      } else {
        statsData = {
          totalStudents: 0,
          totalTeachers: 0,
          totalClasses: 0,
          totalUsers: 0,
          activeStudents: 0,
          activeClasses: 0,
          todayTherapySessions: 0,
          pendingTherapySessions: 0
        };
      }
    }

    res.status(200).json({
      success: true,
      data: statsData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Lấy hoạt động gần đây

// Lấy thống kê theo tháng
exports.getMonthlyStats = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Thống kê học sinh mới theo tháng
    const newStudentsThisMonth = await Student.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Thống kê buổi trị liệu theo tháng
    const therapySessionsThisMonth = await TherapySession.countDocuments({
      sessionDate: { $gte: startDate, $lte: endDate }
    });

    // Thống kê buổi trị liệu hoàn thành
    const completedTherapySessionsThisMonth = await TherapySession.countDocuments({
      sessionDate: { $gte: startDate, $lte: endDate },
      status: 'completed'
    });

    // Thống kê lớp học active
    const activeClassesThisMonth = await Class.countDocuments({
      status: 'active',
      createdAt: { $lte: endDate }
    });

    res.json({
      success: true,
      data: {
        period: { year: parseInt(year), month: parseInt(month) },
        newStudentsThisMonth,
        therapySessionsThisMonth,
        completedTherapySessionsThisMonth,
        activeClassesThisMonth
      }
    });
  } catch (error) {
    console.error('Error getting monthly stats:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy thống kê theo tháng',
      error: error.message
    });
  }
};

// Lấy thống kê biểu đồ - học sinh theo tháng trong năm
exports.getStudentGrowthChart = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const chartData = [];
    
    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      
      const newStudents = await Student.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });
      
      const totalStudents = await Student.countDocuments({
        createdAt: { $lte: endDate }
      });
      
      chartData.push({
        month,
        monthName: `Tháng ${month}`,
        newStudents,
        totalStudents
      });
    }

    res.json({
      success: true,
      data: {
        year: parseInt(year),
        chartData
      }
    });
  } catch (error) {
    console.error('Error getting student growth chart:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy biểu đồ tăng trưởng học sinh',
      error: error.message
    });
  }
};

// Lấy thống kê trị liệu theo trạng thái
exports.getTherapyStatsChart = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let matchCondition = {};
    if (startDate && endDate) {
      matchCondition.sessionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const therapyStats = await TherapySession.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusLabels = {
      scheduled: 'Đã lên lịch',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
      no_show: 'Vắng mặt'
    };

    const chartData = therapyStats.map(stat => ({
      status: stat._id,
      statusLabel: statusLabels[stat._id] || stat._id,
      count: stat.count
    }));

    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        chartData
      }
    });
  } catch (error) {
    console.error('Error getting therapy stats chart:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy thống kê trị liệu',
      error: error.message
    });
  }
};

// Lấy hoạt động gần đây
exports.getRecentActivities = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Lấy học sinh mới nhất
    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) / 2)
      .select('fullName createdAt');

    // Lấy buổi trị liệu gần đây
    const recentTherapySessions = await TherapySession.find()
      .populate('student', 'fullName')
      .populate('teacher', 'fullName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) / 2)
      .select('student teacher sessionDate status createdAt');

    // Ghép và sắp xếp activities
    const activities = [
      ...recentStudents.map(student => ({
        type: 'new_student',
        title: `Học sinh mới: ${student.fullName}`,
        time: student.createdAt,
        icon: '👶'
      })),
      ...recentTherapySessions.map(session => ({
        type: 'therapy_session',
        title: `Buổi trị liệu: ${session.student?.fullName || 'N/A'}`,
        subtitle: `Giáo viên: ${session.teacher?.fullName || 'N/A'}`,
        time: session.createdAt,
        icon: '🏥'
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, parseInt(limit));

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error getting recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy hoạt động gần đây',
      error: error.message
    });
  }
};

// Lấy top giáo viên (theo số buổi trị liệu)
exports.getTopTeachers = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const topTeachers = await TherapySession.aggregate([
      {
        $group: {
          _id: '$teacher',
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'teachers',
          localField: '_id',
          foreignField: '_id',
          as: 'teacherInfo'
        }
      },
      {
        $unwind: '$teacherInfo'
      },
      {
        $project: {
          fullName: '$teacherInfo.fullName',
          email: '$teacherInfo.email',
          specialization: '$teacherInfo.specialization',
          totalSessions: 1,
          completedSessions: 1,
          successRate: {
            $cond: [
              { $gt: ['$totalSessions', 0] },
              { $multiply: [{ $divide: ['$completedSessions', '$totalSessions'] }, 100] },
              0
            ]
          }
        }
      },
      {
        $sort: { totalSessions: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.json({
      success: true,
      data: topTeachers
    });
  } catch (error) {
    console.error('Error getting top teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy thống kê giáo viên',
      error: error.message
    });
  }
};
