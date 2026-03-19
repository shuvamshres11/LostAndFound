const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// @route   GET /api/notifications/:userId
// @desc    Get all notifications for a user
// @access  Private (id check)
router.get('/:userId', async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.params.userId })
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ message: "Server Error fetching notifications." });
    }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        res.json(notification);
    } catch (err) {
        console.error("Error updating notification:", err);
        res.status(500).json({ message: "Server Error updating notification." });
    }
});

module.exports = router;
