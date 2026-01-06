const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['lost', 'found'],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: true
    },
    location: {
        type: String, // String for now, could be coordinates later
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String, // Base64 string
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'resolved'],
        default: 'active'
    },
    // Field for future CLIP embeddings
    embedding: {
        type: [Number],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Item', ItemSchema);
