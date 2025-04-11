const mongoose = require("mongoose");

// Extend the user schema to include a profile picture field.
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    profilePic: { type: String, default: "" },
    deleted: { type: Boolean, default: false },
});

const handler = async (event) => {
    try {
        const { username, password } = JSON.parse(event.body);

        await mongoose.connect(process.env.MONGO_URL, {
            dbName: "test",
        });

        const User = mongoose.models.User || mongoose.model("User", UserSchema);

        // Find user by username with matching password and not deleted
        const user = await User.findOne({ username, password, deleted: { $ne: true } });
        if (!user) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: "Invalid credentials" }),
            };
        }

        // In a real application, here you would create a session or JWT token.
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Login successful" }),
        };

    } catch (err) {
        console.error("Error during login:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Server error", error: err.message }),
        };
    }
};

module.exports = { handler };
