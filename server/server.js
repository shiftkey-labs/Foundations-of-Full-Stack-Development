const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/auth');
const memeRoutes = require('./routes/memes');
const leaderboardRoutes = require('./routes/leaderboard');
const statsRoutes = require('./routes/stats');

// Load environment variables from .env file
dotenv.config();

const app = express();

// MIDDLEWARE
// These functions run before our route handlers

// CORS - Allows our frontend to communicate with backend
const corsOptions = {
  origin: '*',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
};

// app.use(cors(corsOptions));
app.use(cors());

// This lets us access req.body in our routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
// Define API endpoints (you can find the routes in the routes folder)
app.use('/api/auth', authRoutes);
app.use('/api/memes', memeRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/stats', statsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is meowing!', timestamp: new Date() });
});

// 404 Handler - Catches requests to undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// DATABASE CONNECTION
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });