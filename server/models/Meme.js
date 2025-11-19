// server/models/Meme.js
// Defines the structure of Meme documents in MongoDB

const mongoose = require('mongoose');

const memeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Meme title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  // RELATIONSHIP: Reference to User who uploaded this meme
  // This creates a relationship between Meme and User collections
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId, // MongoDB's unique ID type
    ref: 'User', // References the User model
    required: true
  },
  // Store vote count directly for performance
  // Instead of counting votes each time, we store the total
  voteCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }, // Include virtual fields when converting to JSON
  toObject: { virtuals: true }
});

// VIRTUAL FIELD
// This doesn't store data in DB, but populates when we query
// It finds all comments associated with this meme
memeSchema.virtual('comments', {
  ref: 'Comment', // Reference Comment model
  localField: '_id', // Match meme's _id
  foreignField: 'memeId' // With comment's memeId field
});

module.exports = mongoose.model('Meme', memeSchema);