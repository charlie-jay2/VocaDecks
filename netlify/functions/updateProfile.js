const mongoose = require("mongoose");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const MONGO_URL = process.env.MONGO_URL;
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    profilePic: String,
    deleted: Boolean,
}, { collection: 'users' });

const User = mongoose.models.TestUsers || mongoose.model("TestUsers", userSchema);

let isConnected = false;
async function connectDB() {
    if (!isConnected) {
        await mongoose.connect(MONGO_URL, { dbName: "test" });
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

        const changes = [];
        const oldData = { ...user._doc };

        if (newUsername && newUsername !== user.username) {
            const exists = await User.findOne({ username: newUsername });
            if (exists) {
                return {
                    statusCode: 409,
                    body: JSON.stringify({ message: "New username already taken." }),
                };
            }
            changes.push(`**Username** changed from \`${user.username}\` to \`${newUsername}\``);
            user.username = newUsername;
        }

        if (newEmail && newEmail !== user.email) {
            changes.push(`**Email** changed from \`${user.email}\` to \`${newEmail}\``);
            user.email = newEmail;
        }

        if (newPassword && newPassword !== user.password) {
            changes.push(`**Password** changed from \`${user.password}\` to \`${newPassword}\``);
            user.password = newPassword;
        }

        if (profilePic && profilePic !== user.profilePic) {
            changes.push(`**Profile Picture** updated.`);
            user.profilePic = profilePic;
        }

        await user.save();

        // Send webhook with image in embed
        if (WEBHOOK_URL && changes.length > 0) {
            const embed = {
                title: `Profile Updated: ${oldData.username}`,
                description: changes.join("\n"),
                color: 0x00ff00,
                image: { url: profilePic },  // Display profilePic as image
                timestamp: new Date().toISOString(),
            };

            await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ embeds: [embed] }),
            });
        }

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
