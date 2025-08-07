require('dotenv').config();
const { handler } = require('./user');

async function test() {
  // dummy event and context objects for local testing
  const event = {};
  const context = {
    callbackWaitsForEmptyEventLoop: true,
  };

  try {
    const response = await handler(event, context);
    const body = JSON.parse(response.body);

    if (response.statusCode === 200) {
      console.log("Fetched users:", body);
    } else {
      console.error("Error:", body.error);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

test();
