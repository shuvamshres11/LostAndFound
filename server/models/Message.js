const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    replyToId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        required: false
    },
    replyToContent: {
        type: String,
        required: false
    },
    replyToSenderName: {
        type: String,
        required: false
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: false // Optional: chat can be general or specific to an item
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    isRead: {
        type: Boolean,
        default: false
    },
    deletedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

module.exports = mongoose.model('Message', messageSchema);
