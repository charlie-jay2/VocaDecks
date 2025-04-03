const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Secret Key

const handler = async (event, context) => {
    try {
        // Parse the incoming data
        const { email, username } = JSON.parse(event.body);

        // Validate input data
        if (!email || !username) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Email and Username are required." }),
            };
        }

        // Create a checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'gbp',
                        product_data: {
                            name: 'Product',
                        },
                        unit_amount: 30, // Product price in pence (20p)
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.URL}/success`,
            cancel_url: `${process.env.URL}/cancel`,
            customer_email: email, // Pass email to Stripe
            metadata: {
                vocadecks_username: username, // Custom metadata for the username
            },
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ id: session.id }),
        };
    } catch (error) {
        console.error("Error creating checkout session:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};

exports.handler = handler;
