const express = require('express');
const router = express.Router();
const {
	getUsers,
	createUser,
	register,
	login,
	logout,
	forgotPassword,
	resetPassword,
	getMe,
	updateProfile,
	changePassword,
	getUser,
	updateUser,
	deleteUser,
	updateUserStatus,
	changeUserPassword
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.route('/').get(protect, authorize('admin'), getUsers).post( createUser);
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);

// Protected routes (require valid JWT)
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Admin only routes
router.route('/:id')
	.get(protect, authorize('admin'), getUser)
	.put(protect, authorize('admin'), updateUser)
	.delete(protect, authorize('admin'), deleteUser);

router.patch('/:id/status', protect, authorize('admin'), updateUserStatus);
router.patch('/:id/change-password', protect, authorize('admin'), changeUserPassword);

module.exports = router;
