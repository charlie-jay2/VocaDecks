// verify-email.js
require("dotenv").config();
const mongoose = require("mongoose");
const { Schema } = mongoose;

// MongoDB schema for email verification tokens
const verificationTokenSchema = new Schema({
    email: { type: String, unique: true },
    verificationToken: String,
    createdAt: { type: Date, default: Date.now }
}, { collection: 'emailverify' });

const EmailVerify = mongoose.models.EmailVerify || mongoose.model("EmailVerify", verificationTokenSchema);

exports.handler = async (event) => {
    const { token, email } = event.queryStringParameters;

    try {
        // Connect to the VocaDecksDB database
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'VocaDecksDB',
        }).then(() => {
            console.log("MongoDB connected successfully.");
        }).catch((error) => {
            console.error("MongoDB connection error: ", error);
            throw new Error("Database connection failed");
        });

        // Check if the token and email are valid
        const verificationRecord = await EmailVerify.findOne({ email, verificationToken: token });
        if (!verificationRecord) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid or expired verification link." }),
            };
        }

        // Mark the user's email as verified
        const user = await mongoose.model("Registration").findOneAndUpdate(
            { email },
            { verified: true },
            { new: true }
        );

        if (!user) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "User not found." }),
            };
        }

        // Optionally, delete the verification token record after success
        await EmailVerify.deleteOne({ email });

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: "Email verified successfully! You can now log in.",
            }),
        };
    } catch (error) {
        console.error("Error in verification process:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Server error", error: error.message }),
        };
    }
};
