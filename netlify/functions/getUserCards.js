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
  const { discordID } = event.queryStringParameters || {};

  console.log("MONGO_URI present?", !!MONGO_URI);
  console.log("Received discordID:", discordID);

  if (!MONGO_URI) {
    return {
      statusCode: 500,
      body: "Missing MONGO_URI environment variable",
    };
  }

  if (!discordID) {
    return {
      statusCode: 400,
      body: "Missing discordID query parameter",
    };
  }

  try {
    await connectDB(MONGO_URI);

    // Adjust 'userId' if your User schema uses a different field name
    const user = await User.findOne({ userId: discordID });

    if (!user) {
      return {
        statusCode: 404,
        body: "User not found",
      };
    }

    const cardNames = user.cards || [];

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cardNames),
    };
  } catch (error) {
    console.error("Error fetching user cards:", error);
    return {
      statusCode: 500,
      body: "Internal server error",
    };
  }
};
