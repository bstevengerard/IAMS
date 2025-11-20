const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http'); // Import the http module
const { createTables } = require('./dbSetup');
const { init } = require('./socket');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const attendanceRoutes = require('./routes/attendance');

const app = express();
const server = http.createServer(app); // Create an HTTP server from the Express app
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'IAMS Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await createTables();
    
    // Initialize Socket.IO with the server
    init(server);

    server.listen(PORT, () => { // Listen on the http server, not the Express app
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
