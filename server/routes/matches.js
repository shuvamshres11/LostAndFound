const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const { calculateCosineSimilarity } = require('../utils/ai');
const auth = require('../middleware/auth');

// @route   GET /api/matches/my-items/:userId
// @desc    Get all active items for a user that have an AI embedding
// @access  Private
router.get('/my-items/:userId', auth, async (req, res) => {
    try {
        const userId = req.params.userId;
        const userItems = await Item.find({ 
            user: userId, 
            status: 'active',
            embedding: { $exists: true, $not: { $size: 0 } }
        });
        res.json(userItems);
    } catch (err) {
        console.error("Error fetching my items for matches:", err);
        res.status(500).json({ message: "Server Error fetching items." });
    }
});

// @route   GET /api/matches/item/:itemId
// @desc    Get AI matches for ONE specific item
// @access  Private
router.get('/item/:itemId', auth, async (req, res) => {
    try {
        const itemId = req.params.itemId;
        
        // 1. Find the specific item
        const myItem = await Item.findById(itemId).populate('user', 'firstName lastName email phoneNumber');
        
        if (!myItem || !myItem.embedding || myItem.embedding.length === 0) {
            return res.status(404).json({ message: "Item not found or has no AI embedding yet." });
        }

        // 2. Fetch all other active items with embeddings
        // Removing `user: { $ne: userId }` constraint so user can match themselves for FYP testing!
        const allOtherItems = await Item.find({
            status: 'active',
            embedding: { $exists: true, $not: { $size: 0 } }
        }).populate('user', 'firstName lastName email phoneNumber');

        const matches = [];
        const opposingType = myItem.type === 'lost' ? 'found' : 'lost';
        const candidates = allOtherItems.filter(item => item.type === opposingType);
        
        for (const candidate of candidates) {
            const similarity = calculateCosineSimilarity(myItem.embedding, candidate.embedding);
            
            matches.push({
                matchItem: {
                    _id: candidate._id,
                    title: candidate.title,
                    type: candidate.type,
                    category: candidate.category,
                    location: candidate.location,
                    date: candidate.date,
                    image: candidate.image,
                    user: candidate.user
                },
                score: Math.round(similarity * 100)
            });
        }

        // Sort by score descending
        matches.sort((a, b) => b.score - a.score);

        res.json({
            myItem: {
                _id: myItem._id,
                title: myItem.title,
                type: myItem.type,
                image: myItem.image
            },
            matches: matches
        });

    } catch (err) {
        console.error("Error fetching specific item matches:", err);
        res.status(500).json({ message: "Server Error fetching matches." });
    }
});

module.exports = router;
