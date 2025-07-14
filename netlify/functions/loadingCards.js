const fs = require("fs");
const path = require("path");

exports.handler = async function (event, context) {
  try {
    // Adjust the path relative to this file's location
    const cardsDir = path.join(__dirname, "../../Cards");
    const files = await fs.promises.readdir(cardsDir);

    // Filter for files starting with 'r1' and ending with '.png' (case-insensitive)
    const cardFiles = files.filter(
      (file) =>
        file.toLowerCase().startsWith("r1") &&
        file.toLowerCase().endsWith(".png")
    );

    return {
      statusCode: 200,
      body: JSON.stringify(cardFiles),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to read card files",
        details: error.message,
      }),
    };
  }
};
