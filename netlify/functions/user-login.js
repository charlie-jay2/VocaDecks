// user-login.js
require("dotenv").config();
const mongoose = require("mongoose");

const { Schema } = mongoose;

// MongoDB schema for user registration
const registrationSchema = new Schema({
    username: String,
    email: { type: String, unique: true },
    password: String,
    verificationCode: Number,
    verified: { type: Boolean, default: false },
}, { collection: 'usersignupdata' }); // Referencing the 'usersignupdata' collection

// Avoid model redefinition by checking if it's already defined
const Registration = mongoose.models.Registration || mongoose.model("Registration", registrationSchema);

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    try {
        const { email, password } = JSON.parse(event.body);
        console.log('Received login attempt:', { email, password });

        // Connect to the specific database (VocaDecksDB)
        await mongoose.connect(process.env.MONGO_URL, {
            dbName: 'VocaDecksDB', // Explicitly specify the database
            useUnifiedTopology: true, // Removed deprecated useNewUrlParser
        });

        // Ensure the email is case-sensitive and matches exactly
        const user = await Registration.findOne({ email: email.toLowerCase() });
        console.log('User found in DB:', user);

        if (!user) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid email or password." }),
            };
        }

        // Check if the password matches (plaintext comparison)
        if (user.password !== password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid email or password." }),
            };
        }

        // Check if the user is verified
        if (!user.verified) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Email not verified. Please check your email for verification." }),
            };
        }

        // Create a permanent session token (no expiration)
        const sessionToken = new mongoose.Types.ObjectId().toString();

        // Save session in the session collection
        const sessionSchema = new Schema({
            email: String,
            sessionToken: String,
        });

        // Avoid model redefinition for session model
        const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);

        const session = new Session({
            email,
            sessionToken,
        });

        await session.save();

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: "Login successful!",
                sessionToken, // Send back the session token for further authentication
            }),
        };
    } catch (error) {
        console.error('Error during login process:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Server error", error: error.message }),
        };
    }
};
