const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const http = require('http');
const { Server } = require("socket.io");
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite's default port
    methods: ["GET", "POST"]
  }
});

app.use(express.json({ limit: "10mb" })); // Increased limit for Base64 images
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors()); // This lets your React app talk to this server

// Use the routes we created
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items')); // Register Item Routes
app.use('/api/chat', require('./routes/chat')); // Register Chat Routes

// --- SOCKET.IO LOGIC ---
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // User joins a room identified by their User ID (so they can receive private messages)
  socket.on("join_room", (userId) => {
    socket.join(userId);
    console.log(`User with ID: ${userId} joined room: ${userId}`);
  });

  // Send Message Event
  socket.on("send_message", async (data) => {
    // data = { sender, receiver, content, itemId }
    console.log("Message received:", data);

    // Save to MongoDB
    try {
      const newMessage = new Message({
        sender: data.sender,
        receiver: data.receiver,
        content: data.content,
        itemId: data.itemId
      });
      await newMessage.save();

      // Emit to receiver's room
      // We emit the full message object so the frontend can display it immediately
      io.to(data.receiver).emit("receive_message", newMessage);

      // Also emit back to sender (optional, but good for confirmation or multi-device sync)
      // io.to(data.sender).emit("receive_message", newMessage); 

    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// Connect to MongoDB (We will get this link in the next step)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Connection Error:", err));

server.listen(5000, () => console.log("🚀 Server running on port 5000"));