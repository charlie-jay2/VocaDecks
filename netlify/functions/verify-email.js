// verifyEmail.js
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
});

const verificationCodeSchema = new Schema({
    email: { type: String, unique: true },
    verificationCode: Number,
    createdAt: { type: Date, default: Date.now }
}, { collection: 'emailverify' }); // Specify the collection name for email verification codes

// Avoid model redefinition by checking if it's already defined
const Registration = mongoose.models.Registration || mongoose.model("Registration", registrationSchema);
const EmailVerify = mongoose.models.EmailVerify || mongoose.model("EmailVerify", verificationCodeSchema);

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    try {
        const { email, verificationCode } = JSON.parse(event.body);

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'VocaDecksDB', // Specify the database name here
        });

        // Find the verification code in the 'emailverify' collection
        const verificationRecord = await EmailVerify.findOne({ email });

        if (!verificationRecord) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Verification record not found." }),
            };
        }

        // Ensure comparison between strings (convert verificationCode to string)
        if (verificationRecord.verificationCode.toString() !== verificationCode.toString()) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid verification code." }),
            };
        }

        // Find the user based on email
        const user = await Registration.findOne({ email });

        if (!user) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "User not found." }),
            };
        }

        // Update user status to verified
        user.verified = true;
        await user.save();

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: "Email verified successfully!" }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Server error", error: error.message }),
        };
    }
};
