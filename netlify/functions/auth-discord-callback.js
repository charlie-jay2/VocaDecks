require("dotenv").config(); // Load .env for local dev

const mongoose = require("mongoose");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const querystring = require("querystring");

// Load environment variables
const {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URI,
  SESSION_SECRET,
  MONGO_URI,
} = process.env;

// Check required env vars
if (
  !DISCORD_CLIENT_ID ||
  !DISCORD_CLIENT_SECRET ||
  !DISCORD_REDIRECT_URI ||
  !SESSION_SECRET
) {
  console.error("❌ Missing Discord or session env vars");
}
if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI for MongoDB connection");
}

// MongoDB connection function
async function connectDB() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI environment variable is not set");
  }

  if (mongoose.connection.readyState === 1) {
    console.log("✅ Already connected to MongoDB");
    return;
  }

  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}

// Example User schema
const UserSchema = new mongoose.Schema({
  discordId: String,
  username: String,
  avatar: String,
  accessToken: String,
  refreshToken: String,
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);

exports.handler = async (event, context) => {
  try {
    await connectDB();

    const code = event.queryStringParameters.code;
    if (!code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing Discord code parameter" }),
      };
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: querystring.stringify({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      console.error("❌ Discord token exchange failed:", tokenData);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Failed to get access token" }),
      };
    }

    const { access_token, refresh_token } = tokenData;

    // Fetch user info from Discord API
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const userData = await userResponse.json();
    if (!userResponse.ok) {
      console.error("❌ Discord user fetch failed:", userData);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Failed to fetch user info" }),
      };
    }

    const { id: discordId, username, avatar } = userData;

    // Upsert user in DB
    const user = await User.findOneAndUpdate(
      { discordId },
      {
        username,
        avatar,
        accessToken: access_token,
        refreshToken: refresh_token,
      },
      { upsert: true, new: true }
    );
    console.log("✅ User saved/updated:", user.discordId);

    // Create JWT payload and sign
    const payload = {
      discordId: user.discordId,
      username: user.username,
      avatar: user.avatar,
    };
    console.log("JWT payload:", payload);

    const token = jwt.sign(payload, SESSION_SECRET, { expiresIn: "7d" });

    console.log("Generated JWT token:", token);

    // Redirect with token as cookie and query param
    return {
      statusCode: 302,
      headers: {
        Location: `https://vocadecks.com?token=${token}`,
        "Set-Cookie": `session=${token}; HttpOnly; Path=/; Max-Age=604800; Secure`,
      },
      body: "",
    };
  } catch (err) {
    console.error("❌ Error in auth callback:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
