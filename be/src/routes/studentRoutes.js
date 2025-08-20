const express = require('express');
const router = express.Router();
const { protect, authorize, checkTeacherAccess } = require('../middleware/auth');
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');

router.route('/').get(protect, getStudents).post(protect, checkTeacherAccess('student'), createStudent);
router.route('/:id').get(protect, getStudent).put(protect, checkTeacherAccess('student'), updateStudent).delete(protect, authorize('admin'), deleteStudent);

module.exports = router;
