const express = require('express');
const router = express.Router();
const Meme = require('../models/Meme');

// GET /api/stats
// Returns aggregate stats about memes/votes
router.get('/', async (_req, res) => {
  try {
    const totalMemes = await Meme.countDocuments();

    const voteAggregate = await Meme.aggregate([
      {
        $group: {
          _id: null,
          totalVotes: { $sum: '$voteCount' }
        }
      }
    ]);

    const totalVotes = voteAggregate[0]?.totalVotes || 0;

    res.json({
      totalMemes,
      totalVotes
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

module.exports = router;

