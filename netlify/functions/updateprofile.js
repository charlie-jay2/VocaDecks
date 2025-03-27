const mongoose = require("mongoose");
require("dotenv").config();

const User = mongoose.model("User", new mongoose.Schema({
    email: String,
    avatar: String,
    level: Number,
    cardsWon: Number,
    inventoryPublic: Boolean,
    allowRequests: Boolean,
}));

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    await mongoose.connect(process.env.MONGO_URL);

    const { email, avatar, inventoryPublic, allowRequests } = JSON.parse(event.body);

    const updateData = {};
    if (avatar) updateData.avatar = avatar;
    if (inventoryPublic !== undefined) updateData.inventoryPublic = inventoryPublic;
    if (allowRequests !== undefined) updateData.allowRequests = allowRequests;

    await User.updateOne({ email }, { $set: updateData }, { upsert: true });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
