const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Secret Key
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const handler = async (event, context) => {
    const sig = event.headers["stripe-signature"];
    const body = event.body;

    let eventObj;

    try {
        eventObj = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
        return { statusCode: 400, body: `Webhook Error: ${err.message}` };
    }

    if (eventObj.type === "checkout.session.completed") {
        const session = eventObj.data.object;
        // Handle the successful payment here
        console.log("Payment successful for session:", session.id);
    }

    return { statusCode: 200, body: "Success" };
};

exports.handler = handler;
