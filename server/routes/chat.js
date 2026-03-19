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
            ],
            deletedBy: { $ne: user1 }
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

        // Find all messages where the user is sender or receiver and NOT deleted by them
        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }],
            deletedBy: { $ne: userId }
        });

        // Extract unique user IDs
        const userIds = new Set();
        messages.forEach(msg => {
            if (msg.sender.toString() !== userId) userIds.add(msg.sender.toString());
            if (msg.receiver.toString() !== userId) userIds.add(msg.receiver.toString());
        });

        // Convert Set to Array and fetch user details
        const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('firstName lastName profilePicture');

        // Calculate unread count for each user
        const conversationsWithUnread = await Promise.all(users.map(async (user) => {
            const unreadCount = await Message.countDocuments({
                sender: user._id,
                receiver: userId,
                isRead: false
            });
            return {
                ...user.toObject(),
                unreadCount
            };
        }));

        res.json(conversationsWithUnread);
    } catch (err) {
        res.status(500).json({ message: "Error fetching conversations" });
    }
});

// Mark messages as read between two users
router.post('/mark-read', async (req, res) => {
    try {
        const { sender, receiver } = req.body; // sender is the current user (who read messages), receiver is the one who sent them

        await Message.updateMany(
            { sender: receiver, receiver: sender, isRead: false },
            { $set: { isRead: true } }
        );

        res.json({ success: true, message: "Messages marked as read" });
    } catch (err) {
        res.status(500).json({ message: "Error marking messages as read" });
    }
});

// Delete conversation (One-sided)
router.post('/delete-conversation', async (req, res) => {
    try {
        const { myId, otherId } = req.body;

        await Message.updateMany(
            {
                $or: [
                    { sender: myId, receiver: otherId },
                    { sender: otherId, receiver: myId }
                ]
            },
            { $addToSet: { deletedBy: myId } }
        );

        res.json({ success: true, message: "Conversation deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting conversation" });
    }
});

module.exports = router;
