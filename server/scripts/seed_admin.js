const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const email = "admin@example.com";
        const password = "admin123";
        const firstName = "Admin";
        const lastName = "User";

        let user = await User.findOne({ email });

        if (user) {
            user.role = 'admin';
            user.firstName = firstName;
            user.lastName = lastName;
            // Optionally update password if you want reset
            // const hashedPassword = await bcrypt.hash(password, 10);
            // user.password = hashedPassword;
            await user.save();
            console.log("Existing user updated to Admin role.");
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            user = new User({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: 'admin'
            });
            await user.save();
            console.log("New Admin user created.");
        }

        console.log(`Admin Login: ${email} / ${password}`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();
