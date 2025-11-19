const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  memeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meme',
    required: true
  },
  voteType: {
    type: String,
    enum: ['up', 'down'], // can only assing up or down to vote
    required: true
  }
}, {
  timestamps: true
});

// COMPOUND INDEX
// Ensures one user can only vote once per meme
// The 'unique' constraint prevents duplicate combinations
voteSchema.index({ userId: 1, memeId: 1 }, { unique: true });

// STATIC METHOD
// Can be called on the model itself: Vote.updateVoteCount()
voteSchema.statics.updateVoteCount = async function(memeId) {
  const Meme = mongoose.model('Meme');
  
  // Count upvotes and downvotes
  const upvotes = await this.countDocuments({ memeId, voteType: 'up' });
  const downvotes = await this.countDocuments({ memeId, voteType: 'down' });
  
  // Calculate net vote count
  const voteCount = upvotes - downvotes;
  
  // Update the meme's voteCount field
  await Meme.findByIdAndUpdate(memeId, { voteCount });
  
  return voteCount;
};

module.exports = mongoose.model('Vote', voteSchema);