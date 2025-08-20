const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const TherapySession = require('../models/TherapySession');
const User = require('../models/User');

// Báo cáo tổng quan
exports.getOverviewReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    // Thống kê tổng quan
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalTherapySessions,
      activeStudents,
      completedTherapySessions,
      cancelledTherapySessions
    ] = await Promise.all([
      Student.countDocuments(dateFilter),
      Teacher.countDocuments(dateFilter),
      Class.countDocuments(dateFilter),
      TherapySession.countDocuments(startDate && endDate ? {
        sessionDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      } : {}),
      Student.countDocuments({ ...dateFilter, status: 'active' }),
      TherapySession.countDocuments({
        status: 'completed',
        ...(startDate && endDate ? {
          sessionDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        } : {})
      }),
      TherapySession.countDocuments({
        status: 'cancelled',
        ...(startDate && endDate ? {
          sessionDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        } : {})
      })
    ]);

    // Tính tỷ lệ
    const therapySuccessRate = totalTherapySessions > 0 
      ? ((completedTherapySessions / totalTherapySessions) * 100).toFixed(2)
      : 0;

    const therapyCancellationRate = totalTherapySessions > 0
      ? ((cancelledTherapySessions / totalTherapySessions) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        totalStudents,
        totalTeachers,
        totalClasses,
        totalTherapySessions,
        activeStudents,
        completedTherapySessions,
        cancelledTherapySessions,
        therapySuccessRate: parseFloat(therapySuccessRate),
        therapyCancellationRate: parseFloat(therapyCancellationRate)
      }
    });
  } catch (error) {
    console.error('Error getting overview report:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi tạo báo cáo tổng quan',
      error: error.message
    });
  }
};

// Báo cáo học sinh
exports.getStudentReport = async (req, res) => {
  try {
    const { startDate, endDate, status, classId } = req.query;
    
    let matchCondition = {};
    
    // Lọc theo thời gian
    if (startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Lọc theo trạng thái
    if (status) {
      matchCondition.status = status;
    }
    
    // Lọc theo lớp
    if (classId) {
      matchCondition.class = classId;
    }

    // Lấy danh sách học sinh với thông tin chi tiết
    const students = await Student.find(matchCondition)
      .populate('class', 'name')
      .populate('therapyHistory')
      .sort({ createdAt: -1 });

    // Thống kê theo lớp
    const studentsByClass = await Student.aggregate([
      { $match: matchCondition },
      {
        $lookup: {
          from: 'classes',
          localField: 'class',
          foreignField: '_id',
          as: 'classInfo'
        }
      },
      {
        $unwind: {
          path: '$classInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$class',
          className: { $first: '$classInfo.name' },
          count: { $sum: 1 },
          activeCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Thống kê theo trạng thái
    const studentsByStatus = await Student.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        filters: { status, classId },
        students,
        statistics: {
          total: students.length,
          byClass: studentsByClass,
          byStatus: studentsByStatus
        }
      }
    });
  } catch (error) {
    console.error('Error getting student report:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi tạo báo cáo học sinh',
      error: error.message
    });
  }
};

// Báo cáo giáo viên và hiệu suất
exports.getTeacherReport = async (req, res) => {
  try {
    const { startDate, endDate, teacherId } = req.query;
    
    let matchCondition = {};
    if (teacherId) {
      matchCondition._id = teacherId;
    }

    let therapyMatchCondition = {};
    if (startDate && endDate) {
      therapyMatchCondition.sessionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Lấy thông tin giáo viên với thống kê buổi trị liệu
    const teacherStats = await Teacher.aggregate([
      { $match: matchCondition },
      {
        $lookup: {
          from: 'therapysessions',
          let: { teacherId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$teacher', '$$teacherId'] },
                ...therapyMatchCondition
              }
            }
          ],
          as: 'sessions'
        }
      },
      {
        $addFields: {
          totalSessions: { $size: '$sessions' },
          completedSessions: {
            $size: {
              $filter: {
                input: '$sessions',
                cond: { $eq: ['$$this.status', 'completed'] }
              }
            }
          },
          cancelledSessions: {
            $size: {
              $filter: {
                input: '$sessions',
                cond: { $eq: ['$$this.status', 'cancelled'] }
              }
            }
          },
          noShowSessions: {
            $size: {
              $filter: {
                input: '$sessions',
                cond: { $eq: ['$$this.status', 'no_show'] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          successRate: {
            $cond: [
              { $gt: ['$totalSessions', 0] },
              { $multiply: [{ $divide: ['$completedSessions', '$totalSessions'] }, 100] },
              0
            ]
          },
          cancellationRate: {
            $cond: [
              { $gt: ['$totalSessions', 0] },
              { $multiply: [{ $divide: ['$cancelledSessions', '$totalSessions'] }, 100] },
              0
            ]
          }
        }
      },
      {
        $sort: { totalSessions: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        filters: { teacherId },
        teachers: teacherStats
      }
    });
  } catch (error) {
    console.error('Error getting teacher report:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi tạo báo cáo giáo viên',
      error: error.message
    });
  }
};

// Báo cáo trị liệu
exports.getTherapyReport = async (req, res) => {
  try {
    const { startDate, endDate, status, teacherId, studentId } = req.query;
    
    let matchCondition = {};
    
    // Lọc theo thời gian
    if (startDate && endDate) {
      matchCondition.sessionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Lọc theo trạng thái
    if (status) {
      matchCondition.status = status;
    }
    
    // Lọc theo giáo viên
    if (teacherId) {
      matchCondition.teacher = teacherId;
    }
    
    // Lọc theo học sinh
    if (studentId) {
      matchCondition.student = studentId;
    }

    // Lấy danh sách buổi trị liệu
    const therapySessions = await TherapySession.find(matchCondition)
      .populate('student', 'fullName')
      .populate('teacher', 'fullName')
      .sort({ sessionDate: -1 });

    // Thống kê theo trạng thái
    const sessionsByStatus = await TherapySession.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Thống kê theo tháng
    const sessionsByMonth = await TherapySession.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: {
            year: { $year: '$sessionDate' },
            month: { $month: '$sessionDate' }
          },
          count: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Thống kê theo giáo viên
    const sessionsByTeacher = await TherapySession.aggregate([
      { $match: matchCondition },
      {
        $lookup: {
          from: 'teachers',
          localField: 'teacher',
          foreignField: '_id',
          as: 'teacherInfo'
        }
      },
      {
        $unwind: '$teacherInfo'
      },
      {
        $group: {
          _id: '$teacher',
          teacherName: { $first: '$teacherInfo.fullName' },
          count: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        filters: { status, teacherId, studentId },
        sessions: therapySessions,
        statistics: {
          total: therapySessions.length,
          byStatus: sessionsByStatus,
          byMonth: sessionsByMonth,
          byTeacher: sessionsByTeacher
        }
      }
    });
  } catch (error) {
    console.error('Error getting therapy report:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi tạo báo cáo trị liệu',
      error: error.message
    });
  }
};

// Báo cáo lớp học
exports.getClassReport = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    let matchCondition = {};
    
    // Lọc theo thời gian
    if (startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Lọc theo trạng thái
    if (status) {
      matchCondition.status = status;
    }

    // Lấy thông tin lớp học với số lượng học sinh
    const classes = await Class.aggregate([
      { $match: matchCondition },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: 'class',
          as: 'students'
        }
      },
      {
        $lookup: {
          from: 'teachers',
          localField: 'teacher',
          foreignField: '_id',
          as: 'teacherInfo'
        }
      },
      {
        $unwind: {
          path: '$teacherInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          totalStudents: { $size: '$students' },
          activeStudents: {
            $size: {
              $filter: {
                input: '$students',
                cond: { $eq: ['$$this.status', 'active'] }
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          status: 1,
          capacity: 1,
          createdAt: 1,
          teacherName: '$teacherInfo.fullName',
          totalStudents: 1,
          activeStudents: 1,
          occupancyRate: {
            $cond: [
              { $gt: ['$capacity', 0] },
              { $multiply: [{ $divide: ['$totalStudents', '$capacity'] }, 100] },
              0
            ]
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    // Thống kê tổng quan
    const totalClasses = classes.length;
    const totalStudents = classes.reduce((sum, cls) => sum + cls.totalStudents, 0);
    const averageClassSize = totalClasses > 0 ? (totalStudents / totalClasses).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        filters: { status },
        classes,
        statistics: {
          totalClasses,
          totalStudents,
          averageClassSize: parseFloat(averageClassSize)
        }
      }
    });
  } catch (error) {
    console.error('Error getting class report:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi tạo báo cáo lớp học',
      error: error.message
    });
  }
};
