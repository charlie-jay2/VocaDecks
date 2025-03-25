require("dotenv").config();
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const newsletterSignupSchema = new Schema({
    name: String,
    email: String,
});

let NewsletterSignup;
try {
    NewsletterSignup = mongoose.model("NewsletterSignup");
} catch (error) {
    NewsletterSignup = mongoose.model("NewsletterSignup", newsletterSignupSchema);
}

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    try {
        const { name, email } = JSON.parse(event.body);

        // Connect to MongoDB using Mongoose
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Check if the email exists in the database
        const user = await NewsletterSignup.findOne({ email });

        if (!user) {
            return {
                statusCode: 404,
                body: JSON.stringify({ success: false, message: "Email does not exist." }),
            };
        }

        // Delete the email from the database
        const result = await NewsletterSignup.deleteOne({ email });

        if (result.deletedCount === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ success: false, message: "Failed to unsubscribe. Please try again." }),
            };
        }

        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.APP_PASSWORD,
            },
        });

        let mailOptions = {
            from: `"VocaDecks" <${process.env.EMAIL}>`,
            to: email,
            subject: "You have unsubscribed from VocaDecks Newsletter",
            html: `
      <html>
        <head>
          <style>
            @import url("https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap");
          </style>
        </head>
        <body style="background-color: #f5f5f5; font-family: 'Raleway', Arial, sans-serif;">
          <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px;">
            <tr>
              <td align="center" style="padding: 20px">
                <img src="https://iili.io/3IAmUWF.png" alt="Vocadecks Logo" style="max-width: 330px; display: block" />
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 10px">
                <p style="font-size: 20px; font-weight: bold; color: #333333; margin: 0;">
                  You've Unsubscribed from VocaDecks
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 20px">
                <p style="color: #333333; font-size: 16px; margin: 0;">
                  Hi <b>${name}</b>, <br>  
                  You've successfully unsubscribed from the VocaDecks Newsletter. We hope to see you again soon!
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 20px; font-size: 12px; color: #666666">
                © 2025 Vocadecks. All Rights Reserved.
              </td>
            </tr>
          </table>
        </body>
      </html>
      `,
        };

        await transporter.sendMail(mailOptions);

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: "Successfully unsubscribed." }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: "Error occurred while unsubscribing.", error: error.message }),
        };
    } finally {
        mongoose.connection.close();
    }
};
