const { createClient } = require("@supabase/supabase-js");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async function (event, context) {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Get Authorization header and validate token presence
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "No token provided" }),
      };
    }

    const token = authHeader.substring(7);

    // Verify JWT token
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

    // Fetch user from Supabase 'users' table by userid = decoded.id
    const { data: userDoc, error } = await supabase
      .from("users")
      .select("*")
      .eq("userid", decoded.id)
      .single();

    if (error || !userDoc) {
      console.log("No user found for userid:", decoded.id);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    // Ensure missing fields are added and update if necessary
    const updates = {};
    if (userDoc.battleswon === undefined) updates.battleswon = 0;
    if (userDoc.battleslost === undefined) updates.battleslost = 0;

    if (Object.keys(updates).length > 0) {
      console.log("Adding missing fields for user:", updates);
      const { error: updateError } = await supabase
        .from("users")
        .update(updates)
        .eq("userid", decoded.id);

      if (updateError) {
        console.error("Error updating user fields:", updateError);
        // Proceed anyway, just don't update local userDoc copy
      } else {
        Object.assign(userDoc, updates);
      }
    }

    // XP bar calculation
    const level = userDoc.level ?? 1;
    const xp = userDoc.xp ?? 0;

    const xpNeeded = level * 100; // Assuming 100 XP per level scaling
    let xpPercent = (xp / xpNeeded) * 100;
    xpPercent = Math.min(xpPercent, 99); // Clamp to 99%

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
        messageCount: userDoc.messagecount ?? 0,
        trades: userDoc.trades ?? 0,
        battlesWon: userDoc.battleswon,
        battlesLost: userDoc.battleslost,
        cards: userDoc.cards || [],
        specialCards: userDoc.specialcards || [],
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
