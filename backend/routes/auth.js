const express = require('express');
const { register, login, deleteAccount } = require('../controllers/authController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.delete('/delete/:id', authenticateToken, deleteAccount);

module.exports = router;
