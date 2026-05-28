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
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Use env variable or default to local Vite
    methods: ["GET", "POST"]
  }
});

app.use(express.json({ limit: "10mb" })); // Increased limit for Base64 images
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173"
})); // This lets your React app talk to this server

// Make io accessible to our routers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Use the routes we created
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/admin', require('./routes/admin'));
app.get('/api', (req, res) => {
  res.send("Backend is running")
})
app.use('/api/notifications', require('./routes/notifications')); // Register Notification Routes
app.use('/api/matches', require('./routes/matches')); // Register Matches route
// --- SOCKET.IO LOGIC ---
io.on("connection", (socket) => {
  // console.log(`User Connected: ${socket.id}`);

  // User joins a room identified by their User ID (so they can receive private messages)
  socket.on("join_room", (userId) => {
    socket.join(userId);
    // console.log(`User with ID: ${userId} joined room: ${userId}`);
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
        image: data.image,
        replyToId: data.replyToId,
        replyToContent: data.replyToContent,
        replyToSenderName: data.replyToSenderName,
        itemId: data.itemId
      });
      await newMessage.save();

      // Emit to receiver's room and sender's room
      io.to(data.receiver).emit("receive_message", newMessage);
      io.to(data.sender).emit("receive_message", newMessage); // also to sender logic if needed
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    // console.log("User Disconnected", socket.id);
  });
});


// Auto-seed admin user on startup
const seedAdminOnStartup = async () => {
  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    const email = "admin@example.com";
    
    let admin = await User.findOne({ email });
    if (!admin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      admin = new User({
        email,
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        role: "admin"
      });
      await admin.save();
      console.log("✅ Auto-seeded new Admin user");
    } else {
      let updated = false;
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        updated = true;
      }
      // Ensure password is reset to admin123 in case of sync issues
      const isMatch = await bcrypt.compare("admin123", admin.password);
      if (!isMatch) {
        admin.password = await bcrypt.hash("admin123", 10);
        updated = true;
      }
      if (updated) {
        await admin.save();
        console.log("✅ Auto-updated Admin credentials and role");
      }
    }
  } catch (err) {
    console.error("❌ Auto-seeding Admin failed:", err);
  }
};

// Connect to MongoDB (We will get this link in the next step)
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    seedAdminOnStartup();
  })
  .catch(err => console.log("❌ Connection Error:", err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));