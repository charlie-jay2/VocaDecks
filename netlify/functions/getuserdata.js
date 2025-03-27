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
    await mongoose.connect(process.env.MONGO_URL);

    const { email } = event.queryStringParameters;
    const user = await User.findOne({ email });

    return {
        statusCode: 200,
        body: JSON.stringify(user || {}),
    };
};
