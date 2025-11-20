const express = require('express');
const {
  createAttendance,
  getAttendance,
  getAllAttendance,
  updateAttendance,
  deleteAttendance,
  markAttendance
} = require('../controllers/attendanceController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create attendance (admin only)
router.post('/', authenticateToken, requireRole('admin'), createAttendance);

// Get attendance for a user
router.get('/user/:user_id', authenticateToken, getAttendance);

// Get all attendance (admin only)
router.get('/', authenticateToken, requireRole('admin'), getAllAttendance);

// Update attendance (admin only)
router.put('/:id', authenticateToken, requireRole('admin'), updateAttendance);

// Delete attendance (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), deleteAttendance);

// Mark attendance (for current user)
router.post('/mark', authenticateToken, markAttendance);

module.exports = router;
