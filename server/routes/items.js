const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// @route   POST /api/items
// @desc    Create a new lost/found item post
// @access  Public (should be private in real app, but user context passed from frontend for now)
router.post('/', async (req, res) => {
    try {
        const { user, type, title, description, category, location, date, image } = req.body;

        // Basic validation
        if (!user || !type || !title || !category || !image) {
            return res.status(400).json({ message: "Please fill in all required fields." });
        }

        const newItem = new Item({
            user,
            type,
            title,
            description,
            category,
            location,
            date: date || Date.now(),
            image
        });

        const savedItem = await newItem.save();
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
        const { type, limit } = req.query;
        let query = {};
        if (type) query.type = type;

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
router.delete('/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        const { userId } = req.body; // Expecting userId in body to verify ownership

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        // Check if the user deleting is the owner
        if (item.user.toString() !== userId) {
            return res.status(401).json({ message: "Not authorized to delete this post" });
        }

        await item.deleteOne();
        res.json({ message: "Item removed" });
    } catch (err) {
        console.error("Error deleting item:", err);
        res.status(500).json({ message: "Server Error deleting item." });
    }
});

module.exports = router;
