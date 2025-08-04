const { MongoClient } = require("mongodb");
const jwt = require("jsonwebtoken");
const cardStats = require("../../cardStats.json"); // Adjust path if needed

let client;

exports.handler = async function (event, context) {
  context.callbackWaitsForEmptyEventLoop = false;

  if (!client) {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
  }

  try {
    const token = event.queryStringParameters?.token;
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "No token provided" }),
      };
    }

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

    const userDoc = await users.findOne({ userId: decoded.id });

    if (!userDoc) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    // userDoc.cards is an array of filenames, e.g. ["r1KAITO C.png", "r2Rin E.png", ...]
    const userCardImages = userDoc.cards || [];

    // Filter cardStats to only cards user owns by matching image filenames
    let userCardsFullData = cardStats.filter((card) =>
      userCardImages.includes(card.image.split("/").pop())
    );

    // Prepend './Cards/' to each card image path for frontend usage
    userCardsFullData = userCardsFullData.map((card) => ({
      ...card,
      image: "./Cards/" + card.image.split("/").pop(),
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ cards: userCardsFullData }),
    };
  } catch (error) {
    console.error("Error in getUserCards:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
