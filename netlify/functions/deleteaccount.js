const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});

const handler = async (event) => {
    try {
        const { username, email, password } = JSON.parse(event.body);

        await mongoose.connect(process.env.MONGO_URL, {
            dbName: "test",
        });

        const User = mongoose.models.User || mongoose.model("users", UserSchema);

        const user = await User.findOne({ email, username, password });

        if (!user) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "No matching account found." }),
            };
        }

        await User.deleteOne({ _id: user._id });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Account successfully deleted." }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Server error", error: err.message }),
        };
    }
};

module.exports = { handler };
