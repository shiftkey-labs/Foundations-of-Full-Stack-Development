const express = require('express');
const router = express.Router();
const Meme = require('../models/Meme');

// GET /api/leaderboard
// Get top memes sorted by vote count
router.get('/', async (req, res) => {
  try {
    // Get limit from query params, default is 10
    const limit = parseInt(req.query.limit) || 10;
    
    // Find memes sorted by vote cnt (highest first)
    const topMemes = await Meme.find()
      .sort({ voteCount: -1, createdAt: -1 }) // Sort by votes, then by date
      .limit(limit)
      .populate('uploadedBy', 'username')
      .select('title imageUrl voteCount uploadedBy createdAt')
      .lean();
    
    // Add rank to each meme
    const leaderboard = topMemes.map((meme, index) => ({
      ...meme,
      rank: index + 1
    }));
    
    res.json(leaderboard);
    
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

// GET /api/leaderboard/user/:userId
// Get user's ranking and stats
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's memes
    const userMemes = await Meme.find({ uploadedBy: userId })
      .select('voteCount');
    
    if (userMemes.length === 0) {
      return res.json({
        totalMemes: 0,
        totalVotes: 0,
        averageVotes: 0,
        topMeme: null
      });
    }
    
    const totalVotes = userMemes.reduce((sum, meme) => sum + meme.voteCount, 0);
    const averageVotes = Math.round(totalVotes / userMemes.length);
    
    const topMeme = await Meme.findOne({ uploadedBy: userId })
      .sort({ voteCount: -1 })
      .select('title imageUrl voteCount')
      .lean();
    
    res.json({
      totalMemes: userMemes.length,
      totalVotes,
      averageVotes,
      topMeme
    });
    
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ message: 'Error fetching user stats' });
  }
});

module.exports = router;