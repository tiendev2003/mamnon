const Class = require('../models/Class');
const Teacher = require('../models/Teacher');

// Get all classes (with pagination & search)
exports.getClasses = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        let query = { isActive: true };
        
        // Nếu là staff/teacher, chỉ lấy lớp họ phụ trách
        if (req.user.role === 'staff') {
            const teacher = await Teacher.findOne({ userId: req.user.id });
            if (teacher && teacher.assignedClasses.length > 0) {
                query._id = { $in: teacher.assignedClasses };
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
            query.name = { $regex: req.query.q, $options: 'i' };
        }

        const classes = await Class.find(query)
            .skip(skip)
            .limit(limit)
            .populate('teachers students')
            .lean();
        const total = await Class.countDocuments(query);
        res.status(200).json({ success: true, data: classes, meta: { total, page, limit } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get class by ID
exports.getClassById = async (req, res) => {
    try {
        let query = { _id: req.params.id, isActive: true };
        
        // Nếu là staff/teacher, kiểm tra quyền truy cập
        if (req.user.role === 'staff') {
            const teacher = await Teacher.findOne({ userId: req.user.id });
            if (teacher && teacher.assignedClasses.length > 0) {
                if (!teacher.assignedClasses.includes(req.params.id)) {
                    return res.status(403).json({ success: false, error: 'Access denied' });
                }
            } else {
                return res.status(403).json({ success: false, error: 'Access denied' });
            }
        }
        
        const classItem = await Class.findOne(query)
            .populate('teachers students');
        if (!classItem || !classItem.isActive) return res.status(404).json({ success: false, error: 'Class not found' });
        res.status(200).json({ success: true, data: classItem });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Create new class
exports.createClass = async (req, res) => {
    try {
        const newClass = await Class.create(req.body);
        res.status(201).json({ success: true, data: newClass });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Update class
exports.updateClass = async (req, res) => {
    try {
        const updatedClass = await Class.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedClass) return res.status(404).json({ success: false, error: 'Class not found' });
        res.status(200).json({ success: true, data: updatedClass });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Soft delete class
exports.deleteClass = async (req, res) => {
    try {
        const deletedClass = await Class.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!deletedClass) return res.status(404).json({ success: false, error: 'Class not found' });
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
