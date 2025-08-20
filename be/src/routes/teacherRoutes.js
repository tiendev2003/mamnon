const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher
} = require('../controllers/teacherController');

router.route('/').get(protect, getTeachers).post(protect, authorize('admin'), createTeacher);
router.route('/:id').get(protect, getTeacher).put(protect, authorize('admin'), updateTeacher).delete(protect, authorize('admin'), deleteTeacher);

module.exports = router;
