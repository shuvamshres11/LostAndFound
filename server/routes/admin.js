const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied: Admins only" });
        }
        next();
    } catch (err) {
        return res.status(500).json({ message: "Server error checking admin status" });
    }
};

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', auth, isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Server error fetching users" });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Admin
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        // Also delete their items? Optional but good practice
        await Item.deleteMany({ user: req.params.id });
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error deleting user" });
    }
});

// @route   GET /api/admin/posts
// @desc    Get dashboard stats
// @access  Admin
router.get('/stats', auth, isAdmin, async (req, res) => {
    try {
        const lostCount = await Item.countDocuments({ type: 'lost' });
        const foundCount = await Item.countDocuments({ type: 'found' });
        const userCount = await User.countDocuments({});

        res.json({
            lostItems: lostCount,
            foundItems: foundCount,
            totalUsers: userCount
        });
    } catch (err) {
        console.error("Error fetching stats:", err);
        res.status(500).json({ message: "Server error fetching stats" });
    }
});

// @desc    Get single post by ID (with image)
// @access  Admin
router.get('/posts/:id', auth, isAdmin, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)
            .populate('user', 'firstName lastName email');

        if (!item) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.json(item);
    } catch (err) {
        console.error("Error fetching post:", err);
        res.status(500).json({ message: "Server error fetching post" });
    }
});

// @desc    Get all posts (for moderation) with filters
// @access  Admin
router.get('/posts', auth, isAdmin, async (req, res) => {
    try {
        const { type, postedBy, date, page = 1, limit = 10 } = req.query;
        // console.log("Admin Posts Filter Request:", req.query); // DEBUG LOG REMOVED
        let query = {};

        if (type && type !== 'all') {
            query.type = type;
        }

        if (date) {
            // Check if date matches (simple day match)
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.createdAt = { $gte: startDate, $lte: endDate };
        }

        // Filter by user name if provided (search) - Needs complex handling with pagination
        // Since we filter by populated field 'user', we can't easily use DB query for user name 
        // unless we join or fetch users first. 
        // current implementation fetches ALL then filters in JS. This breaks pagination.
        // OPTIMIZED APPROACH:
        // 1. If postedBy is provided, find User IDs matching that name first.
        // 2. Add user: { $in: userIds } to the query.

        if (postedBy) {
            // Check if postedBy is a valid MongoDB ObjectId (for dropdown selection)
            if (mongoose.Types.ObjectId.isValid(postedBy)) {
                query.user = postedBy;
            } else {
                const searchRegex = new RegExp(postedBy, 'i'); // Case-insensitive regex
                const users = await User.find({
                    $or: [
                        { firstName: searchRegex },
                        { lastName: searchRegex }
                    ]
                }).select('_id');

                const userIds = users.map(u => u._id);
                query.user = { $in: userIds };
            }
        }

        const count = await Item.countDocuments(query);

        let items = await Item.find(query)
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .select('-embedding -image') // Exclude heavy embedding AND image field
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // res.set('X-Debug-Query', JSON.stringify(req.query)); // Remove debug header

        res.json({
            items,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalPosts: count
        });
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).json({ message: "Server error fetching posts" });
    }
});



// @route   DELETE /api/admin/posts/:id
// @desc    Delete a post with reason
// @access  Admin
router.delete('/posts/:id', auth, isAdmin, async (req, res) => {
    try {
        const { reason } = req.body; // Expecting reason in body
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Notify user if item has a user
        if (item.user && reason) {
            const notification = new Notification({
                user: item.user,
                type: 'warning', // or 'info'
                message: `Your post "${item.title}" was deleted by admin. Reason: ${reason}`
            });
            await notification.save();

            // Emit real-time event if socket is available
            if (req.io) {
                req.io.to(item.user.toString()).emit('receive_notification', notification);
            }
        }

        await Item.findByIdAndDelete(req.params.id);
        res.json({ message: "Post deleted successfully" });
    } catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).json({ message: "Server error deleting post" });
    }
});

// @route   POST /api/admin/users/:id/warning
// @desc    Send warning to user
// @access  Admin
router.post('/users/:id/warning', auth, isAdmin, async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.params.id;

        if (!message) {
            return res.status(400).json({ message: "Warning message is required" });
        }

        const notification = new Notification({
            user: userId,
            type: 'warning',
            message: `Admin Warning: ${message}`
        });
        await notification.save();

        // Emit real-time event
        if (req.io) {
            req.io.to(userId).emit('receive_notification', notification);
        }

        res.json({ message: "Warning sent successfully" });
    } catch (err) {
        console.error("Error sending warning:", err);
        res.status(500).json({ message: "Server error sending warning" });
    }
});

module.exports = router;
