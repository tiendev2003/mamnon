const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Teacher = require('../models/Teacher');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return res.status(401).json({ success: false, error: 'Not authorized to access this route' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ success: false, error: 'No user found with this id' });
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token is not valid' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Middleware kiểm tra quyền chỉnh sửa học sinh/lớp học cho teacher
exports.checkTeacherAccess = (resourceType) => {
  return async (req, res, next) => {
    try {
      // Admin có toàn quyền
      if (req.user.role === 'admin') {
        return next();
      }

      // Staff/Teacher cần kiểm tra quyền
      if (req.user.role === 'staff') {
        const teacher = await Teacher.findOne({ userId: req.user.id }).populate('assignedClasses');
        
        if (!teacher) {
          return res.status(403).json({ success: false, error: 'Teacher profile not found' });
        }

        // Nếu không có lớp được phân công
        if (!teacher.assignedClasses || teacher.assignedClasses.length === 0) {
          return res.status(403).json({ success: false, error: 'No classes assigned' });
        }

        // Lưu thông tin teacher vào req để sử dụng sau
        req.teacher = teacher;
        return next();
      }

      return res.status(403).json({ success: false, error: 'Access denied' });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };
};
