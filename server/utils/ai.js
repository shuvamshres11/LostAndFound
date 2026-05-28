const Notification = require('../models/Notification');
const Item = require('../models/Item');

// Internal fetch wrapper for getting embedding from python microservice
const getEmbedding = async (base64Image) => {
    try {
        let aiUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
        // Strip trailing slash if present to avoid double-slash (//embed) 404s
        if (aiUrl.endsWith('/')) {
            aiUrl = aiUrl.slice(0, -1);
        }
        
        const response = await fetch(`${aiUrl}/embed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: base64Image })
        });
        
        if (!response.ok) {
            console.error("Failed to fetch embedding from Python service:", await response.text());
            return [];
        }

        const data = await response.json();
        return data.embedding;
    } catch (err) {
        console.error("Error communicating with AI service. Is it running?", err.message);
        return [];
    }
};

const calculateCosineSimilarity = (vecA, vecB) => {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const findAndNotifyMatches = async (newItem) => {
    // We only care if the item has an embedding
    if (!newItem.embedding || newItem.embedding.length === 0) return;

    try {
        // Look for items of the OPPOSITE type
        const matchType = newItem.type === 'lost' ? 'found' : 'lost';
        
        // Find all active items of the opposite type that have embeddings
        // Only active items!
        const opposingItems = await Item.find({ 
            type: matchType, 
            status: 'active',
            embedding: { $exists: true, $not: { $size: 0 } }
        });

        for (const item of opposingItems) {
            const similarity = calculateCosineSimilarity(newItem.embedding, item.embedding);
            
            // If match is >= 80%
            if (similarity >= 0.80) {
                const percentage = Math.round(similarity * 100);
                
                // (Removed 'same-user' check specifically to allow easier testing for your FYP presentation!)
                // if (newItem.user.toString() === item.user.toString()) continue;

                // Create notification for the OTHER user
                const notifOther = new Notification({
                    user: item.user,
                    type: 'info',
                    message: `Possible ${percentage}% match found for your ${matchType} item: "${item.title}". Check your matches page!`,
                    actionUrl: `/items/${newItem._id}`
                });
                await notifOther.save();

                // Create notification for the NEW user
                const notifNew = new Notification({
                    user: newItem.user,
                    type: 'info',
                    message: `Possible ${percentage}% match found for your ${newItem.type} item from a recent ${matchType} post! Check your matches page!`,
                    actionUrl: `/items/${item._id}`
                });
                await notifNew.save();
            }
        }
    } catch (err) {
        console.error("Error finding matches:", err);
    }
};

module.exports = {
    getEmbedding,
    calculateCosineSimilarity,
    findAndNotifyMatches
};
