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
// @desc    Get all items
// @access  Public
router.get('/', async (req, res) => {
    try {
        const items = await Item.find().sort({ createdAt: -1 }).populate('user', 'firstName lastName');
        res.json(items);
    } catch (err) {
        console.error("Error fetching items:", err);
        res.status(500).json({ message: "Server Error fetching items." });
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
