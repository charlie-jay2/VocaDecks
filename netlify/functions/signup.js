const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

// Updated UserSchema with soft delete (using 'deleted' flag)
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    deleted: { type: Boolean, default: false },  // Flag for soft deletion
});

const handler = async (event) => {
    try {
        const { username, email, password } = JSON.parse(event.body);

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL, {
            dbName: "test",
        });

        // Prevent model overwrite error by checking if the model already exists
        const User = mongoose.models.User || mongoose.model("User", UserSchema);

        // Check if a user already exists with the same email or username (excluding deleted ones)
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }],
            deleted: { $ne: true }  // Ensure that we're not finding soft-deleted users
        });

        if (existingUser) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Email or username already exists" }),
            };
        }

        // Save new user (plain password as requested)
        const newUser = await User.create({ username, email, password });

        // Send email confirmation
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
        console.error("Error during signup:", err); // Log the error for easier debugging
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Server error", error: err.message }),
        };
    }
};

module.exports = { handler };
