const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();

dotenv.config();

// app.use(cors(corsOptions));
app.use(cors());
// This lets us access req.body in our routes
app.use(express.json());

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