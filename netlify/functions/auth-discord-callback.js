const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");

exports.handler = async (event) => {
  const {
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_REDIRECT_URI,
    SESSION_SECRET,
    MONGO_URI,
  } = process.env;
  const query = event.queryStringParameters;

  if (!query.code) {
    return { statusCode: 400, body: "Missing code" };
  }

  // Exchange code for access token
  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: query.code,
      redirect_uri: DISCORD_REDIRECT_URI,
      scope: "identify",
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return { statusCode: 400, body: "Failed to get access token" };
  }

  // Fetch user info
  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const userData = await userRes.json();

  if (!userData.id) {
    return { statusCode: 400, body: "Failed to fetch user data" };
  }

  // Connect to MongoDB and upsert user
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const users = client.db("test").collection("users");

    // Upsert user by Discord ID:
    await users.updateOne(
      { discordId: userData.id },
      {
        $set: {
          discordId: userData.id,
          username: `${userData.username}#${userData.discriminator}`,
          avatar: userData.avatar,
          lastLogin: new Date(),
        },
        $setOnInsert: {
          cards: [], // initialize cards array on first insert
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
  } finally {
    await client.close();
  }

  // Create JWT token with user info (expires in 48 hours)
  const jwtToken = jwt.sign(
    {
      id: userData.id,
      username: `${userData.username}#${userData.discriminator}`,
      avatar: userData.avatar,
    },
    SESSION_SECRET,
    { expiresIn: "48h" }
  );

  // Redirect back to frontend with token in query string
  return {
    statusCode: 302,
    headers: {
      Location: `/battlep.html?token=${jwtToken}`,
    },
  };
};
