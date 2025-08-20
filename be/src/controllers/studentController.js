const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// @desc    Get students (with pagination)
// @route   GET /api/students
// @access  Protected
exports.getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    
    // Nếu là staff/teacher, chỉ lấy học sinh trong lớp họ phụ trách
    if (req.user.role === 'staff') {
      const teacher = await Teacher.findOne({ userId: req.user.id }).populate('assignedClasses');
      if (teacher && teacher.assignedClasses.length > 0) {
        const classIds = teacher.assignedClasses.map(cls => cls._id);
        query.class = { $in: classIds };
      } else {
        // Nếu không phụ trách lớp nào, trả về mảng rỗng
        return res.status(200).json({ 
          success: true, 
          data: [], 
          meta: { total: 0, page, limit } 
        });
      }
    }
    
    if (req.query.q) {
      query.fullName = { $regex: req.query.q, $options: 'i' };
    }

    const students = await Student.find(query).skip(skip).limit(limit).populate('class').lean();
    const total = await Student.countDocuments(query);
    res.status(200).json({ success: true, data: students, meta: { total, page, limit } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Protected
exports.getStudent = async (req, res) => {
  try {
    let query = { _id: req.params.id, isActive: true };
    
    // Nếu là staff/teacher, kiểm tra quyền truy cập
    if (req.user.role === 'staff') {
      const teacher = await Teacher.findOne({ userId: req.user.id }).populate('assignedClasses');
      if (teacher && teacher.assignedClasses.length > 0) {
        const classIds = teacher.assignedClasses.map(cls => cls._id);
        query.class = { $in: classIds };
      } else {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    }
    
    const student = await Student.findOne(query).populate('class therapyHistory.therapist academicProgress.evaluatedBy');
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create student
// @route   POST /api/students
// @access  Protected
exports.createStudent = async (req, res) => {
  try {
    // Nếu là staff/teacher, chỉ cho phép tạo học sinh trong lớp họ phụ trách
    if (req.user.role === 'staff' && req.teacher) {
      const classIds = req.teacher.assignedClasses.map(cls => cls._id.toString());
      if (req.body.class && !classIds.includes(req.body.class.toString())) {
        return res.status(403).json({ 
          success: false, 
          error: 'Cannot create student for class you are not assigned to' 
        });
      }
    }
    
    const student = await Student.create(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Protected
exports.updateStudent = async (req, res) => {
  try {
    let query = { _id: req.params.id, isActive: true };
    
    // Nếu là staff/teacher, kiểm tra quyền truy cập
    if (req.user.role === 'staff' && req.teacher) {
      const classIds = req.teacher.assignedClasses.map(cls => cls._id);
      query.class = { $in: classIds };
      
      // Nếu có thay đổi class, kiểm tra quyền
      if (req.body.class && !classIds.includes(req.body.class)) {
        return res.status(403).json({ 
          success: false, 
          error: 'Cannot move student to class you are not assigned to' 
        });
      }
    }
    
    const student = await Student.findOneAndUpdate(query, req.body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found or access denied' });
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete (soft) student
// @route   DELETE /api/students/:id
// @access  Protected
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
