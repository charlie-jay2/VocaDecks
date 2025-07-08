// netlify/functions/getUserCards.js
const { MongoClient } = require("mongodb");
const jwt = require("jsonwebtoken");

exports.handler = async function (event, context) {
  const token = event.queryStringParameters?.token;
  if (!token)
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Token missing" }),
    };

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
    const dbUser = await client
      .db("Test")
      .collection("users")
      .findOne({ userId: decoded.id });
    if (!dbUser)
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found" }),
      };

    return {
      statusCode: 200,
      body: JSON.stringify({ cards: dbUser.cards || [] }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  } finally {
    client.close();
  }
};
