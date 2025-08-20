const Teacher = require('../models/Teacher');
const User = require('../models/User');

// @desc    Get teachers
// @route   GET /api/teachers
// @access  Protected
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({ isActive: true })
      .populate('assignedClasses')
      .populate('userId', 'username email fullName role isActive')
      .lean();
    res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Protected
exports.getTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('assignedClasses')
      .populate('userId', 'username email fullName role isActive');
    if (!teacher || !teacher.isActive) return res.status(404).json({ success: false, error: 'Teacher not found' });
    res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create teacher
// @route   POST /api/teachers
// @access  Protected
exports.createTeacher = async (req, res) => {
  try {
    const { fullName, specialization, qualifications, contactInfo, assignedClasses, password } = req.body;
    
    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Mật khẩu phải có ít nhất 6 ký tự' 
      });
    }
    
    // Tạo username từ email hoặc tên
    const username = contactInfo.email.split('@')[0];
    
    // Kiểm tra username đã tồn tại chưa
    let existingUser = await User.findOne({ 
      $or: [
        { username: username },
        { email: contactInfo.email }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email hoặc username đã tồn tại' 
      });
    }
    
    // Tạo user mới cho teacher
    const userData = {
      username: username,
      email: contactInfo.email,
      fullName: fullName,
      role: 'staff',
      phoneNumber: contactInfo.phoneNumber.replace(/\D/g, ''), // Chỉ lấy số
      position: 'Giáo viên',
      password: password,
      permissions: ['manage_students', 'manage_classes']
    };
    
    const user = await User.create(userData);
    
    // Tạo teacher với userId
    const teacherData = {
      fullName,
      specialization,
      qualifications: qualifications || [],
      contactInfo,
      assignedClasses: assignedClasses || [],
      userId: user._id
    };
    
    const teacher = await Teacher.create(teacherData);
    
    // Populate user info before returning
    await teacher.populate('userId', 'username email fullName role isActive');
    
    res.status(201).json({ 
      success: true, 
      data: teacher,
      message: `Tạo giáo viên thành công!`
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Protected
exports.updateTeacher = async (req, res) => {
  try {
    const { fullName, specialization, qualifications, contactInfo, assignedClasses } = req.body;
    
    // Tìm teacher hiện tại
    const currentTeacher = await Teacher.findById(req.params.id);
    if (!currentTeacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found' });
    }
    
    // Cập nhật user nếu có thay đổi
    if (currentTeacher.userId) {
      const userUpdateData = {
        fullName: fullName,
        email: contactInfo.email,
        phoneNumber: contactInfo.phoneNumber.replace(/\D/g, '')
      };
      
      await User.findByIdAndUpdate(currentTeacher.userId, userUpdateData, { 
        new: true, 
        runValidators: true 
      });
    }
    
    // Cập nhật teacher
    const teacherUpdateData = {
      fullName,
      specialization,
      qualifications: qualifications || [],
      contactInfo,
      assignedClasses: assignedClasses || []
    };
    
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id, 
      teacherUpdateData, 
      { new: true, runValidators: true }
    ).populate('userId', 'username email fullName role isActive');
    
    res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete (soft) teacher
// @route   DELETE /api/teachers/:id
// @access  Protected
exports.deleteTeacher = async (req, res) => {
  try {
    // Tìm teacher
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found' });
    }
    
    // Soft delete teacher
    await Teacher.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    
    // Soft delete user tương ứng nếu có
    if (teacher.userId) {
      await User.findByIdAndUpdate(teacher.userId, { isActive: false }, { new: true });
    }
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
