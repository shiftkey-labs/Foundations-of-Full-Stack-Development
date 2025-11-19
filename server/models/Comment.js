const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },

  // RELATIONSHIPS
  // A comment belongs to both a meme and a user
  memeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meme', // Which did meme was this comment commented
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Store user who wrote comment
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);