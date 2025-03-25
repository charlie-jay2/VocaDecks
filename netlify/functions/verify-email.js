// verify-email.js
require("dotenv").config();
const mongoose = require("mongoose");
const { Schema } = mongoose;

const registrationSchema = new Schema({
    username: String,
    email: { type: String, unique: true },
    password: String,
    verificationToken: String,
    verified: { type: Boolean, default: false },
}, { collection: 'usersignupdata' });

const EmailVerify = mongoose.models.EmailVerify || mongoose.model("EmailVerify", new Schema({
    email: { type: String, unique: true },
    verificationToken: String,
    createdAt: { type: Date, default: Date.now }
}, { collection: 'emailverify' }));

exports.handler = async (event) => {
    if (event.httpMethod !== "GET") {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    const { token } = event.queryStringParameters;

    if (!token) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "No token provided." }),
        };
    }

    try {
        // Connect to the VocaDecksDB database
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'VocaDecksDB',
        });

        // Find the email and token match
        const emailVerification = await EmailVerify.findOne({ verificationToken: token });

        if (!emailVerification) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid or expired verification token." }),
            };
        }

        // Mark the user as verified
        const user = await mongoose.model('Registration').findOne({ email: emailVerification.email });

        if (!user) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "User not found." }),
            };
        }

        user.verified = true;
        await user.save();

        // Optionally delete the verification token after use
        await EmailVerify.deleteOne({ verificationToken: token });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Email verified successfully!" }),
        };
    } catch (error) {
        console.error("Error verifying email:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Server error", error: error.message }),
        };
    }
};
