const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  try {
    // Only allow GET requests
    if (event.httpMethod !== "GET") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" }),
        headers: { "Content-Type": "application/json" },
      };
    }

    // Get token from query string or header
    const token =
      event.queryStringParameters.token ||
      event.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing token" }),
        headers: { "Content-Type": "application/json" },
      };
    }

    // Call your backend API to get opponent info
    const response = await fetch("https://vdbe-0f2p.onrender.com/opponent", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: `Backend responded with ${response.statusText}`,
        }),
        headers: { "Content-Type": "application/json" },
      };
    }

    const opponentData = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(opponentData),
      headers: { "Content-Type": "application/json" },
    };
  } catch (error) {
    console.error("Error in getOpponentInfo:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
      headers: { "Content-Type": "application/json" },
    };
  }
};
