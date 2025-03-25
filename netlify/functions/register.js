// register.js
require("dotenv").config();
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const crypto = require("crypto");

const { Schema } = mongoose;

// MongoDB schema for user registration with explicit collection name
const registrationSchema = new Schema({
    username: String,
    email: { type: String, unique: true },
    password: String,
    verificationToken: String,
    verified: { type: Boolean, default: false },
}, { collection: 'usersignupdata' }); // Specify the collection name here

// MongoDB schema for email verification tokens
const verificationTokenSchema = new Schema({
    email: { type: String, unique: true },
    verificationToken: String,
    createdAt: { type: Date, default: Date.now }
}, { collection: 'emailverify' }); // Specify the collection name for email verification tokens

// Avoid model redefinition by checking if it's already defined
const Registration = mongoose.models.Registration || mongoose.model("Registration", registrationSchema);
const EmailVerify = mongoose.models.EmailVerify || mongoose.model("EmailVerify", verificationTokenSchema);

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    try {
        // Parse the input
        const { username, email, password } = JSON.parse(event.body);

        // Connect to the VocaDecksDB database
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'VocaDecksDB', // Specify the database name here
        });

        // Check if the email is already registered
        const existingUser = await Registration.findOne({ email });
        if (existingUser) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "User already exists." }),
            };
        }

        // Generate a unique verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Save user registration data in the 'usersignupdata' collection
        const newUser = new Registration({
            username,
            email,
            password,
            verificationToken,
        });

        // Save user and handle errors if any
        await newUser.save();

        // Save verification token to 'emailverify' collection
        const newVerification = new EmailVerify({
            email,
            verificationToken,
        });

        await newVerification.save();

        // Send verification email with the verification link
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
            subject: "VocaDecks - Email Verification",
            html: `
                <p>Hi ${username},</p>
                <p>Thank you for signing up with VocaDecks! Please click the link below to verify your email address:</p>
                <p>
                    <a href="https://www.vocadeck.com/verify-email?token=${verificationToken}" target="_blank">
                        Verify your email
                    </a>
                </p>
                <p>If you did not request this verification, please ignore this message.</p>
                <p>Note: The link will expire in 30 minutes.</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: "Registration successful! Please check your email for verification.",
            }),
        };
    } catch (error) {
        console.error("Error in registration process:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Server error", error: error.message }),
        };
    }
};
