// server/routes/memes.js
// Handles all meme-related operations (CRUD + voting + comments)

const express = require('express');
const router = express.Router();
const { verifyToken, optionalAuth } = require('../middleware/auth');
const Meme = require('../models/Meme');
const Comment = require('../models/Comment');
const Vote = require('../models/Vote');

// GET /api/memes
// Get all memes (public route, but shows if user voted)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const memes = await Meme.find()
      .populate('uploadedBy', 'username') // Get uploader's username
      .sort({ createdAt: -1 }); // Newest first
    
    if (req.userId) {
      const userVotes = await Vote.find({ 
        userId: req.userId,
        memeId: { $in: memes.map(m => m._id) }
      });
      
      const voteMap = {};
      userVotes.forEach(vote => {
        voteMap[vote.memeId.toString()] = vote.voteType;
      });
      
      memes.forEach(meme => {
        meme.userVote = voteMap[meme._id.toString()] || null;
      });
    }
    
    res.json(memes);
    
  } catch (error) {
    console.error('Get memes error:', error);
    res.status(500).json({ message: 'Error fetching memes' });
  }
});

// GET /api/memes/:id
// Get single meme with comments
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id)
      .populate('uploadedBy', 'username')
      .lean();
    
    if (!meme) {
      return res.status(404).json({ message: 'Meme not found' });
    }
    
    const comments = await Comment.find({ memeId: meme._id })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    
    meme.comments = comments;
    
    if (req.userId) {
      const userVote = await Vote.findOne({ 
        userId: req.userId, 
        memeId: meme._id 
      });
      meme.userVote = userVote ? userVote.voteType : null;
    }
    
    res.json(meme);
    
  } catch (error) {
    console.error('Get meme error:', error);
    res.status(500).json({ message: 'Error fetching meme' });
  }
});

// POST /api/memes
// Create new meme (protected route)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, imageUrl } = req.body;
    
    if (!title || !imageUrl) {
      return res.status(400).json({ 
        message: 'Title and image URL are required' 
      });
    }
    
    // Create meme
    const meme = new Meme({
      title,
      imageUrl,
      uploadedBy: req.userId // From verifyToken middleware
    });
    
    await meme.save();
    
    // Populate uploader info before returning
    await meme.populate('uploadedBy', 'username');
    
    res.status(201).json({
      message: 'Meme created successfully',
      meme
    });
    
  } catch (error) {
    console.error('Create meme error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Error creating meme' });
  }
});

// PUT /api/memes/:id
// Update meme (protected, owner only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, imageUrl } = req.body;
    
    const meme = await Meme.findById(req.params.id);
    
    if (!meme) {
      return res.status(404).json({ message: 'Meme not found' });
    }
    
    if (meme.uploadedBy.toString() !== req.userId) {
      return res.status(403).json({ 
        message: 'You can only edit your own memes' 
      });
    }
    
    if (title) meme.title = title;
    if (imageUrl) meme.imageUrl = imageUrl;
    
    await meme.save();
    await meme.populate('uploadedBy', 'username');
    
    res.json({
      message: 'Meme updated successfully',
      meme
    });
    
  } catch (error) {
    console.error('Update meme error:', error);
    res.status(500).json({ message: 'Error updating meme' });
  }
});

// DELETE /api/memes/:id
// Delete meme (protected, owner only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    
    if (!meme) {
      return res.status(404).json({ message: 'Meme not found' });
    }
    
    if (meme.uploadedBy.toString() !== req.userId) {
      return res.status(403).json({ 
        message: 'You can only delete your own memes' 
      });
    }
    
    await Comment.deleteMany({ memeId: meme._id });
    await Vote.deleteMany({ memeId: meme._id });
    
    const deletedMeme = {
      id: meme._id,
      title: meme.title,
      voteCount: meme.voteCount
    };
    
    await meme.deleteOne();
    
    res.json({ 
      message: 'Meme deleted successfully',
      meme: deletedMeme
    });
    
  } catch (error) {
    console.error('Delete meme error:', error);
    res.status(500).json({ message: 'Error deleting meme' });
  }
});

//POST /api/memes/:id/vote
// Vote on a meme (protected, hence the verifyToken in the 2nd param (should not be accessed unless user is logged authenticated))
router.post('/:id/vote', verifyToken, async (req, res) => {
  try {
    const { voteType } = req.body;
    const memeId = req.params.id;
    
    if (!voteType || !['up', 'down'].includes(voteType)) {
      return res.status(400).json({ 
        message: 'Vote type must be "up" or "down"' 
      });
    }
    
    const meme = await Meme.findById(memeId);
    if (!meme) {
      return res.status(404).json({ message: 'Meme not found' });
    }
    
    const existingVote = await Vote.findOne({ 
      userId: req.userId, 
      memeId 
    });
    
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await existingVote.deleteOne();
        await Vote.updateVoteCount(memeId);
        
        return res.json({ 
          message: 'Vote removed',
          userVote: null
        });
      }
      
      existingVote.voteType = voteType;
      await existingVote.save();
    } else {
      await Vote.create({
        userId: req.userId,
        memeId,
        voteType
      });
    }
    
    const newVoteCount = await Vote.updateVoteCount(memeId);
    
    res.json({ 
      message: 'Vote recorded',
      userVote: voteType,
      voteCount: newVoteCount
    });
    
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ message: 'Error recording vote' });
  }
});

// POST /api/memes/:id/comments
// Add comment to meme (protected)
router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    const memeId = req.params.id;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }
    
    const meme = await Meme.findById(memeId);
    if (!meme) {
      return res.status(404).json({ message: 'Meme not found' });
    }
    
    const comment = new Comment({
      text: text.trim(),
      memeId,
      userId: req.userId
    });
    
    await comment.save();
    await comment.populate('userId', 'username');
    
    res.status(201).json({
      message: 'Comment added',
      comment
    });
    
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

// DELETE /api/memes/:memeId/comments/:commentId
// Delete a comment (protected, owner only)

router.delete('/:memeId/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is the comment owner
    if (comment.userId.toString() !== req.userId) {
      return res.status(403).json({ 
        message: 'You can only delete your own comments' 
      });
    }
    
    await comment.deleteOne();
    
    res.json({ message: 'Comment deleted successfully' });
    
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
});

module.exports = router;