// netlify/functions/getUserCards.js

const mongoose = require("mongoose");
const User = require("../../models/User");

let dbConnected = false;

async function connectDB(uri) {
  if (dbConnected) return;
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  dbConnected = true;
}

exports.handler = async (event) => {
  const { MONGO_URI } = process.env;
  const { discordID } = event.queryStringParameters;

  if (!discordID) {
    return { statusCode: 400, body: "Missing discordID" };
  }

  try {
    await connectDB(MONGO_URI);

    const user = await User.findOne({ userId: discordID });
    if (!user) {
      return { statusCode: 404, body: "User not found" };
    }

    // Cards in MongoDB are stored like "Gumi R"
    const cardNames = user.cards; // already clean

    return {
      statusCode: 200,
      body: JSON.stringify(cardNames),
    };
  } catch (err) {
    console.error("Error fetching user cards:", err);
    return {
      statusCode: 500,
      body: "Internal server error",
    };
  }
};
