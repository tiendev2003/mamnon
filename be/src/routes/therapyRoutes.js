const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createSession,
  getSessions,
  getSession,
  updateSession,
  cancelSession
} = require('../controllers/therapyController');

router.route('/').get(protect, getSessions).post(protect, authorize('admin','staff'), createSession);
router.route('/:id').get(protect, getSession).put(protect, authorize('admin','staff'), updateSession).delete(protect, authorize('admin','staff'), cancelSession);

module.exports = router;
