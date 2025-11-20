const { getConnection } = require('../dbSetup');

const getAllUsers = async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT id, name, email, role, created_at FROM users');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    connection.release();
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  try {
    const connection = await getConnection();
    await connection.execute(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [name, email, role, id]
    );
    connection.release();
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ message: 'Update failed' });
    }
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await getConnection();
    await connection.execute('DELETE FROM users WHERE id = ?', [id]);
    connection.release();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Deletion failed' });
  }
};

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser
};
