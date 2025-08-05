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
      console.error("JWT verification failed:", e);
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid or expired token" }),
      };
    }

    console.log("Decoded JWT:", decoded);

    const db = client.db("test");
    const users = db.collection("users");

    const userDoc = await users.findOne({ userId: decoded.id });

    console.log("Mongo userDoc:", userDoc);

    if (!userDoc) {
      console.log("No user found for userId:", decoded.id);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    // Ensure missing fields are added
    const updates = {};
    if (userDoc.battlesWon === undefined) updates.battlesWon = 0;
    if (userDoc.battlesLost === undefined) updates.battlesLost = 0;

    if (Object.keys(updates).length > 0) {
      console.log("Adding missing fields for user:", updates);
      await users.updateOne({ userId: decoded.id }, { $set: updates });
      Object.assign(userDoc, updates);
    }

    // XP bar calculation
    const level = userDoc.level ?? 1;
    const xp = userDoc.xp ?? 0;

    const xpNeeded = level * 100; // Assuming 100 XP per level scaling
    let xpPercent = (xp / xpNeeded) * 100;

    // Clamp to 99% max to prevent bar from showing "full" before level up
    xpPercent = Math.min(xpPercent, 99);

    const avatarURL = decoded.avatar
      ? `https://cdn.discordapp.com/avatars/${decoded.id}/${decoded.avatar}.png`
      : "https://cdn.discordapp.com/embed/avatars/0.png";

    return {
      statusCode: 200,
      body: JSON.stringify({
        username: decoded.username,
        avatar: avatarURL,
        level: level,
        xp: xp,
        xpNeeded: xpNeeded,
        xpPercent: xpPercent,
        points: userDoc.points ?? 0,
        messageCount: userDoc.messageCount ?? 0,
        trades: userDoc.trades ?? 0,
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
