// register.js
require("dotenv").config();
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const { Schema } = mongoose;

// MongoDB schema for user registration with explicit collection name
const registrationSchema = new Schema({
    username: String,
    email: { type: String, unique: true },
    password: String,
    verificationCode: Number,
    verified: { type: Boolean, default: false },
}, { collection: 'usersignupdata' }); // Specify the collection name here

// MongoDB schema for email verification codes
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
        // Parse the input
        const { username, email, password } = JSON.parse(event.body);

        // Connect to the VocaDecksDB database
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'VocaDecksDB', // Specify the database name here
        }).then(() => {
            console.log("MongoDB connected successfully.");
        }).catch((error) => {
            console.error("MongoDB connection error: ", error);
            throw new Error("Database connection failed");
        });

        // Check if the email is already registered
        const existingUser = await Registration.findOne({ email });
        if (existingUser) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "User already exists." }),
            };
        }

        // Generate a 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000);

        // Save user registration data in the 'usersignupdata' collection
        const newUser = new Registration({
            username,
            email,
            password,
            verificationCode,
        });

        // Save user and handle errors if any
        await newUser.save()
            .then(() => {
                console.log("User successfully saved.");
            })
            .catch((error) => {
                console.error("Error saving user: ", error);
                throw new Error("Failed to save user data.");
            });

        // Save verification code to 'emailverify' collection
        const newVerification = new EmailVerify({
            email,
            verificationCode,
        });

        await newVerification.save()
            .then(() => {
                console.log("Verification code saved to emailverify collection.");
            })
            .catch((error) => {
                console.error("Error saving verification code: ", error);
                throw new Error("Failed to save verification code.");
            });

        // Send verification email
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
                <!DOCTYPE html>
                <html>
                  <head>
                    <style>
                      @import url("https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap");
                    </style>
                  </head>
                  <body
                    style="
                      margin: 0;
                      padding: 0;
                      background-color: #f5f5f5;
                      font-family: 'Raleway', Arial, sans-serif;
                    ">
                    <table
                      width="100%"
                      cellspacing="0"
                      cellpadding="0"
                      style="
                        max-width: 600px;
                        margin: auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                      ">
                      <tr>
                        <td align="center" style="padding: 20px">
                          <img
                            src="https://iili.io/3zD8YMB.png"
                            alt="Vocadecks Logo"
                            style="max-width: 330px; display: block" />
                        </td>
                      </tr>

                      <tr>
                        <td align="center" style="padding: 10px">
                          <p
                            style="
                              font-size: 18px;
                              font-weight: bold;
                              color: #333333;
                              margin: 0;
                            ">
                            🚀 Email Verification for VocaDecks 🚀
                          </p>
                        </td>
                      </tr>

                      <tr>
                        <td align="center" style="padding: 20px">
                          <table
                            width="100%"
                            cellspacing="10"
                            cellpadding="0"
                            style="text-align: center">
                            <tr>
                              <td
                                style="
                                  background-color: #f9f9f9;
                                  border: 2px solid transparent;
                                  border-radius: 8px;
                                  padding: 10px;
                                  width: 100%;
                                  text-align: center;
                                ">
                                <p
                                  style="color: #333333; font-size: 16px; margin: 0;">
                                  Hi there <strong>${username}</strong>,<br/>
                                  We have received an email verification request for this email: <strong>${email}</strong>.<br/>
                                  The verification code for this email is: <strong>${verificationCode}</strong><br/><br/>
                                  If you did not make this request, please contact us at <a href="mailto:management@vocadecks.com">management@vocadecks.com</a>.<br/><br/>
                                  <strong>Note:</strong> The code expires in 30 minutes.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <tr>
                        <td
                          align="center"
                          style="padding: 20px; font-size: 12px; color: #666666">
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
