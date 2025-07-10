const { MongoClient } = require("mongodb");
const jwt = require("jsonwebtoken");

let client;

exports.handler = async function (event, context) {
  context.callbackWaitsForEmptyEventLoop = false;

  if (!client) {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
  }

  try {
    const authHeader =
      event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "No token provided" }),
      };
    }

    const token = authHeader.substring(7);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SESSION_SECRET);
    } catch (e) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid or expired token" }),
      };
    }

    const db = client.db("test");
    const users = db.collection("users");

    const userDoc = await users.findOne({ discordId: decoded.id });

    if (!userDoc) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    const avatarURL = decoded.avatar
      ? `https://cdn.discordapp.com/avatars/${decoded.id}/${decoded.avatar}.png`
      : "https://cdn.discordapp.com/embed/avatars/0.png";

    return {
      statusCode: 200,
      body: JSON.stringify({
        username: decoded.username,
        avatar: avatarURL,
        level: userDoc.level,
        xp: userDoc.xp,
        points: userDoc.points,
        messageCount: userDoc.messageCount,
        trades: userDoc.trades,
        battlesWon: userDoc.battlesWon,
        battlesLost: userDoc.battlesLost,
        cards: userDoc.cards || [],
        specialCards: userDoc.specialCards || [],
      }),
    };
  } catch (error) {
    console.error("Error in getUserData:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
