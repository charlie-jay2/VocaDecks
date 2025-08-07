const { createClient } = require("@supabase/supabase-js");
const jwt = require("jsonwebtoken");
const cardStats = require("../../cardStats.json"); // Adjust path if needed
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async function (event, context) {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Get token from query string parameters
    const token = event.queryStringParameters?.token;
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "No token provided" }),
      };
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SESSION_SECRET);
    } catch (e) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid or expired token" }),
      };
    }

    // Query user from Supabase 'users' table by userId matching decoded.id
    const { data: userDoc, error } = await supabase
      .from("users")
      .select("*")
      .eq("userid", decoded.id) // Note the field name — adjust if different in your DB
      .single();

    if (error || !userDoc) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    // userDoc.cards is expected to be an array of filenames
    const userCardImages = userDoc.cards || [];

    // Filter cardStats to only those cards user owns (matching image filename)
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
