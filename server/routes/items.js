const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const { getEmbedding, findAndNotifyMatches } = require('../utils/ai');
const auth = require('../middleware/auth');

// @route   POST /api/items
// @desc    Create a new lost/found item post
// @access  Public (should be private in real app, but user context passed from frontend for now)
router.post('/', auth, async (req, res) => {
    try {
        const { type, title, description, category, location, date, image } = req.body;

        // Basic validation
        if (!type || !title || !category || !image) {
            return res.status(400).json({ message: "Please fill in all required fields." });
        }

        const newItem = new Item({
            user: req.user.id,
            type,
            title,
            description,
            category,
            location,
            date: date || Date.now(),
            image
        });

        // Generate embedding
        const embedding = await getEmbedding(image);
        if (embedding && embedding.length > 0) {
            newItem.embedding = embedding;
        }

        const savedItem = await newItem.save();
        
        // Asynchronously check for matches and notify users
        findAndNotifyMatches(savedItem);
        
        res.status(201).json(savedItem);
    } catch (err) {
        console.error("Error creating item:", err);
        res.status(500).json({ message: "Server Error creating post." });
    }
});

// @route   GET /api/items
// @desc    Get all items (with optional filtering)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { type, limit, status, search } = req.query;
        let query = {};
        if (type) query.type = type;
        if (status) query.status = status;
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        // If limit is provided, maybe we don't need the full image? 
        // For now, let's just limit the number of documents.
        // TODO: Ideally, implement pagination with skip/limit.

        let findQuery = Item.find(query).sort({ createdAt: -1 }).populate('user', 'firstName lastName');

        if (limit) {
            findQuery = findQuery.limit(parseInt(limit));
        }

        const items = await findQuery;
        res.json(items);
    } catch (err) {
        console.error("Error fetching items:", err);
        res.status(500).json({ message: "Server Error fetching items." });
    }
});

// @route   GET /api/items/:id
// @desc    Get single item by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('user', 'firstName lastName');
        if (!item) return res.status(404).json({ message: "Item not found" });
        res.json(item);
    } catch (err) {
        console.error("Error fetching item:", err);
        res.status(500).json({ message: "Server Error fetching item." });
    }
});

// @route   DELETE /api/items/:id
// @desc    Delete an item
// @access  Public (protected by user check check manually)
router.delete('/:id', auth, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        // Check if the user deleting is the owner
        if (item.user.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized to delete this post" });
        }

        await item.deleteOne();
        res.json({ message: "Item removed" });
    } catch (err) {
        console.error("Error deleting item:", err);
        res.status(500).json({ message: "Server Error deleting item." });
    }
});

// @route   PATCH /api/items/:id/status
// @desc    Update item status
// @access  Public (protected by user check check manually)
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        const { status } = req.body;

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        // Check if the user updating is the owner
        if (item.user.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized to update this post's status" });
        }

        if (!['active', 'completed'].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        item.status = status;
        const updatedItem = await item.save();
        res.json(updatedItem);
    } catch (err) {
        console.error("Error updating item status:", err);
        res.status(500).json({ message: "Server Error updating item status." });
    }
});

module.exports = router;
