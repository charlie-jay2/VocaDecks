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

  if (!SESSION_SECRET) {
    console.error("❌ SESSION_SECRET is missing in env");
    return {
      statusCode: 500,
      body: "Server misconfigured: SESSION_SECRET missing",
    };
  }

  const query = event.queryStringParameters;
  if (!query.code) {
    return { statusCode: 400, body: "Missing code" };
  }

  // Exchange code for access token
  let tokenData;
  try {
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

    tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("❌ Discord token error:", tokenData);
      return { statusCode: 400, body: JSON.stringify(tokenData) };
    }
  } catch (err) {
    console.error("❌ Token fetch exception:", err);
    return { statusCode: 500, body: "Failed to fetch Discord token" };
  }

  // Fetch user info
  let userData;
  try {
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    userData = await userRes.json();

    if (!userData.id) {
      console.error("❌ Discord user fetch error:", userData);
      return { statusCode: 400, body: JSON.stringify(userData) };
    }
  } catch (err) {
    console.error("❌ User fetch exception:", err);
    return { statusCode: 500, body: "Failed to fetch Discord user" };
  }

  // Upsert user in Supabase 'users' table
  try {
    const { error } = await supabase
      .from("users")
      .upsert({ userid: userData.id, cards: [] }, { onConflict: "userid" })
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase upsert error:", error);
      return { statusCode: 500, body: JSON.stringify(error) };
    }
  } catch (err) {
    console.error("❌ Supabase exception:", err);
    return { statusCode: 500, body: "Internal server error" };
  }

  // Create JWT token with user info (expires in 48 hours)
  let jwtToken;
  try {
    jwtToken = jwt.sign(
      {
        id: userData.id,
        username: `${userData.username}#${userData.discriminator}`,
      },
      SESSION_SECRET,
      { expiresIn: "48h" }
    );
  } catch (err) {
    console.error("❌ JWT sign error:", err);
    return { statusCode: 500, body: "Failed to create session token" };
  }

  // Redirect back to frontend with token in query string
  return {
    statusCode: 302,
    headers: {
      Location: `/menu.html?token=${jwtToken}`,
    },
  };
};
