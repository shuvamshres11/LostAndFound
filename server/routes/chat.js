const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');

// Get chat history between two users
router.get('/history/:user1/:user2', async (req, res) => {
    try {
        const { user1, user2 } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 }
            ]
        }).sort({ timestamp: 1 }); // Oldest first

        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: "Error fetching chat history" });
    }
});

// Get list of users the current user has chatted with
router.get('/conversations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Find all messages where the user is sender or receiver
        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        });

        // Extract unique user IDs
        const userIds = new Set();
        messages.forEach(msg => {
            if (msg.sender.toString() !== userId) userIds.add(msg.sender.toString());
            if (msg.receiver.toString() !== userId) userIds.add(msg.receiver.toString());
        });

        // Convert Set to Array and fetch user details
        const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('firstName lastName profilePicture');

        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching conversations" });
    }
});

module.exports = router;
