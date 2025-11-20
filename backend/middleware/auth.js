const jwt = require('jsonwebtoken');
const { getConnection } = require('../dbSetup');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const requireRole = (role) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

const getUserFromToken = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
    connection.release();
    return rows[0];
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  getUserFromToken,
  JWT_SECRET
};
