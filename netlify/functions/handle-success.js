const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Nodemailer setup (use your SMTP configuration)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Replace with your mail provider
    auth: {
        user: process.env.EMAIL, // Your email address
        pass: process.env.APP_PASSWORD, // Your email app password
    },
});

const handler = async (event, context) => {
    try {
        const { sessionId } = JSON.parse(event.body);

        // Retrieve the checkout session
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session || !session.customer_email) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No session or email found' }),
            };
        }

        const userEmail = session.customer_email;

        // Get a random card from the vocadecks folder
        const cardFolderPath = path.join(__dirname, '../../vocadecks');
        const cardFiles = fs.readdirSync(cardFolderPath);
        const randomCard = cardFiles[Math.floor(Math.random() * cardFiles.length)];

        // Path to the selected card
        const cardPath = path.join(cardFolderPath, randomCard);

        // Prepare the email
        const mailOptions = {
            from: process.env.EMAIL,
            to: userEmail,
            subject: 'Your VocaDecks Card!',
            text: 'This is your card!',
            attachments: [
                {
                    filename: randomCard,
                    path: cardPath,
                    cid: 'cardImage', // CID is used to reference the image inline
                },
            ],
        };

        // Send email with Nodemailer
        await transporter.sendMail(mailOptions);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Card sent to user.' }),
        };
    } catch (error) {
        console.error("Error handling payment success:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};

exports.handler = handler;
