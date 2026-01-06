const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: "10mb" })); // Increased limit for Base64 images
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors()); // This lets your React app talk to this server

// Use the routes we created
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items')); // Register Item Routes

// Connect to MongoDB (We will get this link in the next step)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Connection Error:", err));

app.listen(5000, () => console.log("🚀 Server running on port 5000"));