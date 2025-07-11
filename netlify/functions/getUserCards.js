const { MongoClient } = require("mongodb");
const jwt = require("jsonwebtoken");

let client;

exports.handler = async function (event, context) {
  context.callbackWaitsForEmptyEventLoop = false;

  // Handle CORS preflight request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "https://vocadecks.com",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
    };
  }

  if (!client) {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
  }

  try {
    const token = event.queryStringParameters?.token;
    if (!token) {
      return {
        statusCode: 401,
        headers: {
          "Access-Control-Allow-Origin": "https://vocadecks.com",
        },
        body: JSON.stringify({ error: "No token provided" }),
      };
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SESSION_SECRET);
    } catch (e) {
      return {
        statusCode: 401,
        headers: {
          "Access-Control-Allow-Origin": "https://vocadecks.com",
        },
        body: JSON.stringify({ error: "Invalid or expired token" }),
      };
    }

    const db = client.db("test");
    const users = db.collection("users");

    const userDoc = await users.findOne({ userId: decoded.id });

    if (!userDoc) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "https://vocadecks.com",
        },
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://vocadecks.com",
      },
      body: JSON.stringify({ cards: userDoc.cards || [] }),
    };
  } catch (error) {
    console.error("Error in getUserCards:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "https://vocadecks.com",
      },
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
