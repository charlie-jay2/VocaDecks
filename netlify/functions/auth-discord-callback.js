// netlify/functions/auth-discord-callback.js
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

  // Exchange code for Discord access token
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

  // Fetch user info from Discord
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

  // Upsert user in Supabase 'users' table while preserving cards
  try {
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("userid", userData.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Supabase fetch error:", fetchError);
      return { statusCode: 500, body: "Error checking user" };
    }

    if (!existingUser) {
      // New user → insert with default cards
      const { error: insertError } = await supabase
        .from("users")
        .insert({
          userid: userData.id,
          username: userData.username,
          avatar: userData.avatar,
          cards: [], // Only for new users
        })
        .single();

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        return { statusCode: 500, body: "Error creating user" };
      }
    } else {
      // Existing user → update only username/avatar, leave cards untouched
      const { error: updateError } = await supabase
        .from("users")
        .update({
          username: userData.username,
          avatar: userData.avatar,
        })
        .eq("userid", userData.id);

      if (updateError) {
        console.error("Supabase update error:", updateError);
        return { statusCode: 500, body: "Error updating user" };
      }
    }
  } catch (err) {
    console.error("❌ Supabase exception:", err);
    return { statusCode: 500, body: "Internal server error" };
  }

  // Create JWT token
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

  // Return HTML that saves the token and redirects
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html" },
    body: `
      <html>
        <body>
          <script>
            localStorage.setItem('token', '${jwtToken}');
            window.location.href = '/menu.html';
          </script>
          Redirecting...
        </body>
      </html>
    `,
  };
};
