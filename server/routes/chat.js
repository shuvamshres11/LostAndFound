const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get chat history between two users
router.get('/history/:user1/:user2', auth, async (req, res) => {
    try {
        const { user1, user2 } = req.params;

        // Ensure requesting user is one of the participants
        if (req.user.id !== user1 && req.user.id !== user2) {
            return res.status(403).json({ message: "Not authorized to access this chat" });
        }

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
router.get('/conversations/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;

        // Ensure requesting user is the conversations owner
        if (req.user.id !== userId) {
            return res.status(403).json({ message: "Not authorized to access these conversations" });
        }

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
router.post('/mark-read', auth, async (req, res) => {
    try {
        const { sender, receiver } = req.body; // sender is the current user (who read messages), receiver is the one who sent them

        // Ensure requesting user is the one marking messages read (the receiver of the messages)
        if (req.user.id !== sender) {
            return res.status(403).json({ message: "Not authorized" });
        }

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
router.post('/delete-conversation', auth, async (req, res) => {
    try {
        const { myId, otherId } = req.body;

        // Ensure requesting user is the one deleting their conversation view
        if (req.user.id !== myId) {
            return res.status(403).json({ message: "Not authorized" });
        }

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
