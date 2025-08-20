const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createSchedule,
  getSchedules,
  getSchedule,
  updateSchedule,
  deleteSchedule
} = require('../controllers/scheduleController');

router.route('/').get(protect, getSchedules).post(protect, authorize('admin','staff'), createSchedule);
router.route('/:id').get(protect, getSchedule).put(protect, authorize('admin','staff'), updateSchedule).delete(protect, authorize('admin'), deleteSchedule);

module.exports = router;
