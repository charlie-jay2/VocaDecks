const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  const {
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_REDIRECT_URI,
    SESSION_SECRET,
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

  // Upsert user in Supabase 'users' table
  try {
    // Try to upsert user by discordId (userid column)
    const { error } = await supabase.from("users").upsert({
      userid: userData.id,
      username: `${userData.username}#${userData.discriminator}`,
      lastlogin: new Date().toISOString(),
      cards: [],
    }, { onConflict: "userid" });

    if (error) {
      console.error("Supabase upsert error:", error);
      return { statusCode: 500, body: "Database error" };
    }
  } catch (err) {
    console.error("Upsert exception:", err);
    return { statusCode: 500, body: "Internal server error" };
  }

  // Create JWT token with user info (expires in 48 hours)
  const jwtToken = jwt.sign(
    {
      id: userData.id,
      username: `${userData.username}#${userData.discriminator}`,
    },
    SESSION_SECRET,
    { expiresIn: "48h" }
  );

  // Redirect back to frontend with token in query string
  return {
    statusCode: 302,
    headers: {
      Location: `/menu.html?token=${jwtToken}`,
    },
  };
};
