const express = require('express');
const router = express.Router();
const { protect, authorize, checkTeacherAccess } = require('../middleware/auth');
const classController = require('../controllers/classController');

// Get all classes
router.get('/', protect, classController.getClasses);

// Get class by ID
router.get('/:id', protect, classController.getClassById);

// Create new class
router.post('/', protect, authorize('admin'), classController.createClass);

// Update class
router.put('/:id', protect, checkTeacherAccess('class'), classController.updateClass);

// Delete class
router.delete('/:id', protect, authorize('admin'), classController.deleteClass);

module.exports = router;
