const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});

const handler = async (event) => {
    try {
        const { username, email, password } = JSON.parse(event.body);

        await mongoose.connect(process.env.MONGO_URL, {
            dbName: "test", // Updated to your actual DB name
        });

        const User = mongoose.models.User || mongoose.model("User", UserSchema);

        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Email or username already exists." }),
            };
        }

        const newUser = await User.create({ username, email, password });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.APP_PASSWORD,
            },
        });

        const mailOptions = {
            from: `"VocaDecks" <${process.env.EMAIL}>`,
            to: email,
            subject: "Welcome to VocaDecks!",
            html: `
                <div style="text-align: center; font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 30px;">
                    <img src="https://iili.io/3RlUb4I.png" alt="VocaDecks Logo" style="max-width: 200px; margin-bottom: 20px;">
                    <h2 style="color: #4CAF50;">Welcome, ${username}!</h2>
                    <p style="font-size: 16px; color: #333;">Your account has been created successfully.</p>
                    <p style="font-size: 16px; color: #333;"><strong>Email:</strong> ${email}</p>
                    <p style="font-size: 16px; color: #333;">Thanks for signing up with <strong>VocaDecks</strong>.</p>
                    <hr style="border-top: 1px solid #ddd; margin: 20px 0;">
                    <footer style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">
                        Copyright 2025 © VocaDecks | All Rights Reserved
                    </footer>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Signup successful! Confirmation email sent." }),
        };

    } catch (err) {
        console.error("Error during signup:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "An error occurred during signup. Please try again later." }),
        };
    }
};

module.exports = { handler };
