const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../dbSetup');
const { JWT_SECRET } = require('../middleware/auth');

const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const connection = await getConnection();
    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'security']
    );

    connection.release();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ message: 'Registration failed' });
    }
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    connection.release();
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
};

const deleteAccount = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const connection = await getConnection();

    // Only admin can delete any account, or user can delete their own
    if (userRole !== 'admin' && userId != id) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    await connection.execute('DELETE FROM users WHERE id = ?', [id]);
    connection.release();

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Deletion failed' });
  }
};

module.exports = {
  register,
  login,
  deleteAccount
};
