const express = require('express');
const { getAllUsers, getUser, updateUser, deleteUser } = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication and admin role
router.get('/', authenticateToken, requireRole('admin'), getAllUsers);
router.get('/:id', authenticateToken, requireRole('admin'), getUser);
router.put('/:id', authenticateToken, requireRole('admin'), updateUser);
router.delete('/:id', authenticateToken, requireRole('admin'), deleteUser);

module.exports = router;
