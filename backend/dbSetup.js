const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'iams_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

const getConnection = async () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool.getConnection();
};

const createDatabase = async () => {
  try {
    const tempConfig = { ...dbConfig };
    delete tempConfig.database; // Connect without specifying the database
    const tempPool = mysql.createPool(tempConfig);
    const connection = await tempPool.getConnection();
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'iams_db'}\``);
    connection.release();
    tempPool.end();
    console.log('Database created or already exists');
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  }
};

const createTables = async () => {
  try {
    await createDatabase(); // Ensure database exists before creating tables

    const connection = await getConnection();

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'security') NOT NULL DEFAULT 'security',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create attendance_records table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS attendance_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        date DATE NOT NULL,
        status ENUM('present', 'absent') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Hash the default admin password
    const defaultAdminPassword = 'admin123';

    // Insert default admin user if not exists
    await connection.execute(`
      INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)
    `, ['Mutekano', 'admin@iams.com', defaultAdminPassword, 'admin']);

    connection.release();
    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

module.exports = {
  getConnection,
  createTables,
  createDatabase
};
