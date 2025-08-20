const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// Tất cả routes đều cần authentication
router.use(protect);
 
// Routes cho dashboard
router.get('/overview', dashboardController.getOverviewStats);
router.get('/monthly', dashboardController.getMonthlyStats);
router.get('/student-growth', dashboardController.getStudentGrowthChart);
router.get('/therapy-stats', dashboardController.getTherapyStatsChart);
router.get('/recent-activities', dashboardController.getRecentActivities);
router.get('/top-teachers', dashboardController.getTopTeachers);

module.exports = router;
