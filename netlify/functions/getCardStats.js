const fs = require("fs");
const path = require("path");

exports.handler = async function (event, context) {
  try {
    const { cardName } = event.queryStringParameters || {};
    if (!cardName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing cardName query parameter" }),
      };
    }

    // Use path relative to this file, pointing to netlify/data/cards.json
    const cardsPath = path.resolve(__dirname, "../data/cards.json");
    const data = fs.readFileSync(cardsPath, "utf-8");
    const cards = JSON.parse(data);

    const allCards = [].concat(...Object.values(cards));
    const card = allCards.find((c) => c.name === cardName);

    if (!card) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Card not found" }),
      };
    }

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
