const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// --- SIGNUP ROUTE ---
router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // 1. Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Send a 400 status so the frontend catch block triggers the alert
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Save to MongoDB
    const newUser = new User({
      email,
      password: hashedPassword,
      firstName: firstName || "",
      lastName: lastName || ""
    });
    await newUser.save();

    res.status(201).json({ message: "User created successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error during registration" });
  }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Account not found. Please sign up." });
    }

    // 2. Compare the provided password with the hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password. Try again." });
    }

    // 3. Success
    res.status(200).json({
      message: "Login successful!",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error during login" });
  }
});

// --- GET PROFILE ROUTE ---
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password'); // Exclude password
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

// --- UPDATE PROFILE ROUTE ---
router.put('/profile/:id', async (req, res) => {
  try {
    const { firstName, lastName, phone, bio, profilePicture } = req.body;

    // Find user and update
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, phone, bio, profilePicture },
      { new: true } // Return the updated document
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully!", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Server error updating profile" });
  }
});

// --- CHECK EMAIL (FORGOT PASSWORD) ---
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }
    res.status(200).json({ message: "User exists" });
  } catch (err) {
    res.status(500).json({ message: "Server error checking email" });
  }
});

// --- RESET PASSWORD ---
router.put('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error resetting password" });
  }
});

module.exports = router;