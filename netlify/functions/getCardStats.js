// netlify/functions/getCardStats.js

const fs = require("fs");
const path = require("path");

exports.handler = async function (event, context) {
  try {
    // Parse card name from query string
    const { cardName } = event.queryStringParameters || {};
    if (!cardName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing cardName query parameter" }),
      };
    }

    // Read cards.json relative to this function
    const cardsPath = path.resolve(__dirname, "../../public/cards.json");
    const data = fs.readFileSync(cardsPath, "utf-8");
    const cards = JSON.parse(data);

    // Flatten all card arrays into a single list
    const allCards = [].concat(...Object.values(cards));

    // Find the card by name (case-sensitive match)
    const card = allCards.find((c) => c.name === cardName);

    if (!card) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Card not found" }),
      };
    }

    // Return card stats
    return {
      statusCode: 200,
      body: JSON.stringify({ stats: card.stats }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
