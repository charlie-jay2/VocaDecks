const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL;

// Match the "users" collection in the "test" database
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    profilePic: String,
    deleted: Boolean,
}, { collection: 'users' }); // <-- force it to use "users" collection

const User = mongoose.models.TestUsers || mongoose.model("TestUsers", userSchema);

let isConnected = false;
async function connectDB() {
    if (!isConnected) {
        await mongoose.connect(MONGO_URL, {
            dbName: "test", // <-- use the correct database
        });
        isConnected = true;
    }
}

exports.handler = async (event) => {
    try {
        await connectDB();

        const {
            username,
            currentPassword,
            newUsername,
            newEmail,
            newPassword,
            profilePic
        } = JSON.parse(event.body);

        if (!username || !currentPassword) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Username and current password are required." }),
            };
        }

        const user = await User.findOne({ username });
        if (!user) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "User not found." }),
            };
        }

        if (user.password !== currentPassword) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: "Incorrect current password." }),
            };
        }

        // Prevent duplicate usernames
        if (newUsername && newUsername !== username) {
            const exists = await User.findOne({ username: newUsername });
            if (exists) {
                return {
                    statusCode: 409,
                    body: JSON.stringify({ message: "New username already taken." }),
                };
            }
            user.username = newUsername;
        }

        if (newEmail) user.email = newEmail;
        if (newPassword) user.password = newPassword;
        if (profilePic) user.profilePic = profilePic;

        await user.save();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Profile updated successfully." }),
        };

    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Server error", error: err.message }),
        };
    }
};
