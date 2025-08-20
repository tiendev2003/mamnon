const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

// Tất cả routes đều cần authentication
router.use(protect);
 
 
// Routes cho reports
router.get('/overview', reportController.getOverviewReport);
router.get('/students', reportController.getStudentReport);
router.get('/teachers', reportController.getTeacherReport);
router.get('/therapy', reportController.getTherapyReport);
router.get('/classes', reportController.getClassReport);

module.exports = router;
