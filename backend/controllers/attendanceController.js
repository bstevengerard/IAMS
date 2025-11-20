const { getConnection } = require('../dbSetup');
const { getIo } = require('../socket');

const createAttendance = async (req, res) => {
  const { user_id, date, status } = req.body;

  try {
    const connection = await getConnection();
    await connection.execute(
      'INSERT INTO attendance_records (user_id, date, status) VALUES (?, ?, ?)',
      [user_id, date, status]
    );
    connection.release();
    res.status(201).json({ message: 'Attendance record created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create attendance record' });
  }
};

const getAttendance = async (req, res) => {
  const { user_id } = req.params;
  const userRole = req.user.role;
  const userId = req.user.id;

  // Security users can only view their own attendance
  if (userRole !== 'admin' && userId != user_id) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }

  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT ar.*, u.name FROM attendance_records ar JOIN users u ON ar.user_id = u.id WHERE ar.user_id = ? ORDER BY ar.date DESC',
      [user_id]
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
};

const getAllAttendance = async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT ar.*, u.name FROM attendance_records ar JOIN users u ON ar.user_id = u.id ORDER BY ar.date DESC'
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch attendance records' });
  }
};

const updateAttendance = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const connection = await getConnection();
    await connection.execute(
      'UPDATE attendance_records SET status = ? WHERE id = ?',
      [status, id]
    );
    connection.release();
    res.json({ message: 'Attendance updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Update failed' });
  }
};

const deleteAttendance = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await getConnection();
    await connection.execute('DELETE FROM attendance_records WHERE id = ?', [id]);
    connection.release();
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Deletion failed' });
  }
};

const markAttendance = async (req, res) => {
  const { date, status } = req.body;
  const userId = req.user.id;

  try {
    const connection = await getConnection();

    // Check if attendance already exists for today
    const [existing] = await connection.execute(
      'SELECT id FROM attendance_records WHERE user_id = ? AND date = ?',
      [userId, date]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Attendance already marked for this date' });
    }

    await connection.execute(
      'INSERT INTO attendance_records (user_id, date, status) VALUES (?, ?, ?)',
      [userId, date, status]
    );

    connection.release();

    // Emit real-time update
    const io = getIo();
    io.emit('attendanceMarked', { userId, date, status });

    res.status(201).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to mark attendance' });
  }
};

module.exports = {
  createAttendance,
  getAttendance,
  getAllAttendance,
  updateAttendance,
  deleteAttendance,
  markAttendance
};
