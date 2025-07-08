const { MongoClient } = require("mongodb");
const jwt = require("jsonwebtoken");

exports.handler = async function (event, context) {
  let token = event.queryStringParameters?.token;

  if (typeof token !== "string" || token.length === 0) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Token missing or invalid" }),
    };
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.SESSION_SECRET);
  } catch {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Invalid token" }),
    };
  }

  const client = new MongoClient(process.env.MONGO_URI);
  try {
    await client.connect();

    // Query by discordId, NOT userId
    const dbUser = await client
      .db("test")
      .collection("users")
      .findOne({ discordId: decoded.id });

    if (!dbUser) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ cards: dbUser.cards || [] }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  } finally {
    await client.close();
  }
};
