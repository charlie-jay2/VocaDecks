const fs = require("fs");
const path = require("path");

exports.handler = async function (event, context) {
  try {
    const { cardName } = event.queryStringParameters || {};
    console.log("📩 Incoming request for cardName:", cardName);

    if (!cardName) {
      console.warn("⚠️ Missing cardName in query");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing cardName query parameter" }),
      };
    }

    const cardsPath = path.resolve(__dirname, "../data/cards.json");
    console.log("📂 Reading cards.json from:", cardsPath);

    const data = fs.readFileSync(cardsPath, "utf-8");
    const cards = JSON.parse(data);

    const allCards = [].concat(...Object.values(cards));
    console.log(`📦 Total cards loaded: ${allCards.length}`);

    const card = allCards.find((c) => c.name === cardName);
    if (!card) {
      console.warn("❌ Card not found:", cardName);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Card not found" }),
      };
    }

    console.log("✅ Card found:", card.name, card.stats);

    return {
      statusCode: 200,
      body: JSON.stringify({ stats: card.stats }),
    };
  } catch (error) {
    console.error("💥 Error in getCardStats function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
